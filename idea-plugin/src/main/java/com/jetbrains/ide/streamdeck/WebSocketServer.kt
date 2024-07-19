import java.lang.Thread.sleep
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
    private val clients = mutableListOf<SocketChannel>()

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

                if (key.isAcceptable) {
                    handleAccept(key)
                } else if (key.isReadable) {
                    handleRead(key)
                }
            }
        }
    }

    private fun handleAccept(key: SelectionKey) {
        val clientChannel = (key.channel() as ServerSocketChannel).accept()
        clientChannel.configureBlocking(false)
        clientChannel.register(selector, SelectionKey.OP_READ)
        clients.add(clientChannel)
        println("Client connected: ${clientChannel.remoteAddress}")
    }

    private fun handleRead(key: SelectionKey) {
        val clientChannel = key.channel() as SocketChannel
        val buffer = ByteBuffer.allocate(1024)
        try {
            val bytesRead = clientChannel.read(buffer)
            if (bytesRead == -1) {
                key.cancel()
                clients.remove(clientChannel)
                clientChannel.close()
                println("Client disconnected")
            } else {
                buffer.flip()
                val request = StandardCharsets.UTF_8.decode(buffer).toString()
                if (request.contains("Sec-WebSocket-Key")) {
                    val response = handleHandshake(request)
                    clientChannel.write(StandardCharsets.UTF_8.encode(response))
                } else {
                    handleFrame(clientChannel, buffer)
                }
            }
        } catch (e: Exception) {
            println("Error reading from client: ${clientChannel.remoteAddress}")
            e.printStackTrace()
            key.cancel()
            clients.remove(clientChannel)
            try {
                clientChannel.close()
            } catch (ex: Exception) {
                ex.printStackTrace()
            }
        }
    }

    private fun handleHandshake(request: String): String {
        val key = request.lines().first { it.startsWith("Sec-WebSocket-Key:") }
            .replace("Sec-WebSocket-Key:", "").trim()
        val acceptKey = Base64.getEncoder().encodeToString(
            MessageDigest.getInstance("SHA-1")
                .digest((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").toByteArray(StandardCharsets.UTF_8))
        )
        return "HTTP/1.1 101 Switching Protocols\r\n" +
                "Upgrade: websocket\r\n" +
                "Connection: Upgrade\r\n" +
                "Sec-WebSocket-Accept: $acceptKey\r\n\r\n"
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
        println("Received message: $message")

        val response = "Echo: $message"
        broadcastMessage(response)
    }

    private fun sendMessage(clientChannel: SocketChannel, message: String) {
        val payload = message.toByteArray(StandardCharsets.UTF_8)
        val frame: ByteBuffer

        if (payload.size <= 125) {
            frame = ByteBuffer.allocate(2 + payload.size)
            frame.put(0x81.toByte()) // FIN + text frame
            frame.put(payload.size.toByte())
        } else if (payload.size <= 65535) {
            frame = ByteBuffer.allocate(4 + payload.size)
            frame.put(0x81.toByte()) // FIN + text frame
            frame.put(126.toByte())
            frame.putShort(payload.size.toShort())
        } else {
            frame = ByteBuffer.allocate(10 + payload.size)
            frame.put(0x81.toByte()) // FIN + text frame
            frame.put(127.toByte())
            frame.putLong(payload.size.toLong())
        }

        frame.put(payload)
        frame.flip()
        try {
            clientChannel.write(frame)
        } catch (e: Exception) {
            println("Error sending message to client: ${clientChannel.remoteAddress}")
            e.printStackTrace()
            clients.remove(clientChannel)
            try {
                clientChannel.close()
            } catch (ex: Exception) {
                ex.printStackTrace()
            }
        }
    }

    fun broadcastMessage(message: String) {
        val payload = message.toByteArray(StandardCharsets.UTF_8)

        val iterator = clients.iterator()
        while (iterator.hasNext()) {
            val clientChannel = iterator.next()
            if (clientChannel.isOpen) {
                val frame: ByteBuffer

                if (payload.size <= 125) {
                    frame = ByteBuffer.allocate(2 + payload.size)
                    frame.put(0x81.toByte()) // FIN + text frame
                    frame.put(payload.size.toByte())
                } else if (payload.size <= 65535) {
                    frame = ByteBuffer.allocate(4 + payload.size)
                    frame.put(0x81.toByte()) // FIN + text frame
                    frame.put(126.toByte())
                    frame.putShort(payload.size.toShort())
                } else {
                    frame = ByteBuffer.allocate(10 + payload.size)
                    frame.put(0x81.toByte()) // FIN + text frame
                    frame.put(127.toByte())
                    frame.putLong(payload.size.toLong())
                }

                frame.put(payload)
                frame.flip()

                try {
                    clientChannel.write(frame)
                } catch (e: Exception) {
                    println("Error sending message to client: ${clientChannel.remoteAddress}")
                    e.printStackTrace()
                    iterator.remove()
                    try {
                        clientChannel.close()
                    } catch (ex: Exception) {
                        ex.printStackTrace()
                    }
                }
            } else {
                iterator.remove()
            }
        }
    }

}

