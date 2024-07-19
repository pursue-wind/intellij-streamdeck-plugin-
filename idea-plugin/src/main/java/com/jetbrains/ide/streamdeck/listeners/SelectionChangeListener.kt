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

import java.net.InetSocketAddress
import java.nio.ByteBuffer
import java.nio.channels.SelectionKey
import java.nio.channels.Selector
import java.nio.channels.ServerSocketChannel
import java.nio.channels.SocketChannel
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.util.*


class SelectionChangeListener : ApplicationInitializedListener {
    override suspend fun execute(asyncScope: CoroutineScope) {
        withContext(Dispatchers.Default) {
            try {
                val editorEventMulticaster = EditorFactory.getInstance().eventMulticaster

                val server = WebSocketServer(21421)
                server.start()

                val lis = MySelectionListener(msg->{
                    server.sendMessage(msg)
                })
                editorEventMulticaster.addSelectionListener(lis) {}


            } catch (e: IOException) {
                throw RuntimeException(e)
            }
        }
    }
}


class MySelectionListener(msgConsumer: (String) -> null) : SelectionListener {
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
        msgConsumer(text)
    }
}