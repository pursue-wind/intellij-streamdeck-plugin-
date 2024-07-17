package com.jetbrains.ide.streamdeck.listeners

import com.intellij.ide.ApplicationInitializedListener
import com.intellij.openapi.editor.event.SelectionEvent
import com.intellij.openapi.editor.event.SelectionListener
import com.intellij.openapi.editor.EditorFactory
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.IOException
import java.io.InputStreamReader
import java.io.PrintWriter
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

class SimpleWebSocketServer(private val port: Int) {
    private val serverSocket = ServerSocket(port)
    private val executor = Executors.newCachedThreadPool()

    fun start() {
        println("WebSocket server started on port $port")
        while (true) {
            val clientSocket = serverSocket.accept()
            executor.submit(ClientHandler(clientSocket))
        }
    }

    private class ClientHandler(private val clientSocket: Socket) : Runnable {
        override fun run() {
            try {
                val input = clientSocket.getInputStream().bufferedReader()
                val output = clientSocket.getOutputStream().bufferedWriter()
                var message: String?

                // Perform WebSocket handshake
                val request = input.readLine()
                if (request != null && request.contains("GET")) {
                    output.write("HTTP/1.1 101 Switching Protocols\r\n")
                    output.write("Upgrade: websocket\r\n")
                    output.write("Connection: Upgrade\r\n")
                    output.write("Sec-WebSocket-Accept: ${generateWebSocketAccept(request)}\r\n")
                    output.write("\r\n")
                    output.flush()
                }

                // Read messages from client
                while (input.readLine().also { message = it } != null) {
                    println("Received: $message")
                    output.write("Echo: $message\r\n")
                    output.flush()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                clientSocket.close()
            }
        }

        private fun generateWebSocketAccept(request: String): String {
            // Generate WebSocket accept key (simplified for demonstration)
            return "s3pPLMBiTxaQ9kYGzzhZRbK+xOo="
        }
    }
}
class SelectionChangeListener : ApplicationInitializedListener {
    override suspend fun execute(asyncScope: CoroutineScope) {
        withContext(Dispatchers.Default) {
            try {
                val editorEventMulticaster = EditorFactory.getInstance().eventMulticaster
                val lis = MySelectionListener()
                editorEventMulticaster.addSelectionListener(lis) {}

                val server = SimpleWebSocketServer(21421)
                server.start()
            } catch (e: IOException) {
                throw RuntimeException(e)
            }
        }
    }
}


class MySelectionListener : SelectionListener {
    private var lastSelectedText: String = ""
    private val scheduler = Executors.newScheduledThreadPool(1)
    private var scheduledFuture: ScheduledFuture<*>? = null

    override fun selectionChanged(event: SelectionEvent) {
        val selectedText = event.newRange?.let { event.editor.document.getText(it) }
        if (selectedText != null && selectedText != lastSelectedText) {
            scheduledFuture?.cancel(false)
            scheduledFuture = scheduler.schedule({
                sendTextToStreamDeck(selectedText)
                lastSelectedText = selectedText
            }, 300, TimeUnit.MILLISECONDS) // 延迟500毫秒
        }
    }

    private fun sendTextToStreamDeck(text: String) {
        println(text)
    }
}