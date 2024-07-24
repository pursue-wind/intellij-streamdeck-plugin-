package com.jetbrains.ide.streamdeck;

import java.net.InetSocketAddress
import java.nio.ByteBuffer
import java.nio.channels.SelectionKey
import java.nio.channels.Selector
import java.nio.channels.ServerSocketChannel
import java.nio.channels.SocketChannel
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.util.*
import kotlin.experimental.xor

class WebSocketServer(port: Int) {

    private val serverSocketChannel: ServerSocketChannel = ServerSocketChannel.open()
    private val selector: Selector = Selector.open()
    private val clients = mutableMapOf<SocketChannel, String>()

    init {
        serverSocketChannel.bind(InetSocketAddress(port))
        serverSocketChannel.configureBlocking(false)
        serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT)
        println("WebSocket server started on port $port")
    }

    fun start() {
        while (true) {
            selector.select()
            val selectedKeys = selector.selectedKeys().iterator()

            while (selectedKeys.hasNext()) {
                val key = selectedKeys.next()
                selectedKeys.remove()

                when {
                    key.isAcceptable -> handleAccept(key)
                    key.isReadable -> handleRead(key)
                }
            }
        }
    }

    private fun handleAccept(key: SelectionKey) {
        val clientChannel = (key.channel() as ServerSocketChannel).accept()
        clientChannel.configureBlocking(false)
        clientChannel.register(selector, SelectionKey.OP_READ)
        println("Client connected: ${clientChannel.remoteAddress}")
    }

    private fun handleRead(key: SelectionKey) {
        val clientChannel = key.channel() as SocketChannel
        val buffer = ByteBuffer.allocate(1024)
        try {
            if (clientChannel.read(buffer) == -1) {
                disconnectClient(key, clientChannel)
            } else {
                buffer.flip()
                val request = StandardCharsets.UTF_8.decode(buffer).toString()
                if (request.contains("Sec-WebSocket-Key")) {
                    val response = handleHandshake(request)
                    clientChannel.write(StandardCharsets.UTF_8.encode(response))
                    val name = getUserNameFromRequest(request)
                    clients[clientChannel] = name
                    println("Client handshake complete: ${clientChannel.remoteAddress}, name: $name")
                } else {
                    handleFrame(clientChannel, buffer)
                }
            }
        } catch (e: Exception) {
            handleError(key, clientChannel, e)
        }
    }

    private fun handleHandshake(request: String): String {
        val key = request.lines().first { it.startsWith("Sec-WebSocket-Key:") }
            .removePrefix("Sec-WebSocket-Key:").trim()
        val acceptKey = Base64.getEncoder().encodeToString(
            MessageDigest.getInstance("SHA-1")
                .digest((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").toByteArray(StandardCharsets.UTF_8))
        )
        return buildString {
            append("HTTP/1.1 101 Switching Protocols\r\n")
            append("Upgrade: websocket\r\n")
            append("Connection: Upgrade\r\n")
            append("Sec-WebSocket-Accept: $acceptKey\r\n\r\n")
        }
    }

    private fun getUserNameFromRequest(request: String): String {
        return request.lines().firstOrNull()?.split(" ")?.getOrNull(1)
            ?.split("?")?.getOrNull(1)
            ?.split("&")?.associate {
                it.split("=").let { (key, value) -> key to value }
            }?.get("name") ?: "Unknown"
    }

    private fun handleFrame(clientChannel: SocketChannel, buffer: ByteBuffer) {
        buffer.flip()
        buffer.get() // Skip FIN/RSV/Opcode byte
        var payloadLen = buffer.get().toInt() and 0x7F

        if (payloadLen == 126) {
            payloadLen = buffer.short.toInt() and 0xFFFF
        } else if (payloadLen == 127) {
            payloadLen = buffer.long.toInt() and 0x7FFFFFFF
        }

        val maskingKey = ByteArray(4)
        buffer.get(maskingKey)
        val payload = ByteArray(payloadLen)
        buffer.get(payload)

        for (i in payload.indices) {
            payload[i] = payload[i] xor maskingKey[i % 4]
        }

        val message = String(payload, StandardCharsets.UTF_8)
        println("Received message from ${clients[clientChannel]}: $message")

        val response = "Echo: $message"
        sendMessage(clientChannel, response)
    }

    private fun sendMessage(clientChannel: SocketChannel, message: String) {
        val payload = message.toByteArray(StandardCharsets.UTF_8)
        val frame = ByteBuffer.allocate(getFrameSize(payload.size))
        frame.put(0x81.toByte())
        when {
            payload.size <= 125 -> frame.put(payload.size.toByte())
            payload.size <= 65535 -> {
                frame.put(126.toByte())
                frame.putShort(payload.size.toShort())
            }

            else -> {
                frame.put(127.toByte())
                frame.putLong(payload.size.toLong())
            }
        }
        frame.put(payload)
        frame.flip()
        try {
            clientChannel.write(frame)
        } catch (e: Exception) {
            handleError(null, clientChannel, e)
        }
    }

    fun broadcastMessage(message: String, dataTransByKeyFunc: (String, String) -> String) {
        clients.keys.removeIf { clientChannel ->
            if (clientChannel.isOpen) {
                val clientName = clients[clientChannel] ?: "default"
                val newMsg = dataTransByKeyFunc(clientName, message)
                sendMessage(clientChannel, newMsg)
                false
            } else {
                true
            }
        }
    }

    private fun disconnectClient(key: SelectionKey?, clientChannel: SocketChannel) {
        key?.cancel()
        clients.remove(clientChannel)
        clientChannel.close()
        println("Client disconnected")
    }

    private fun handleError(key: SelectionKey?, clientChannel: SocketChannel, e: Exception) {
        println("Error with client: ${clientChannel.remoteAddress}")
        e.printStackTrace()
        disconnectClient(key, clientChannel)
    }

    private fun getFrameSize(payloadSize: Int): Int {
        return when {
            payloadSize <= 125 -> 2 + payloadSize
            payloadSize <= 65535 -> 4 + payloadSize
            else -> 10 + payloadSize
        }
    }
}
