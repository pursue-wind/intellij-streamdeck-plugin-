package com.jetbrains.ide.streamdeck.listeners

import com.intellij.ide.ApplicationInitializedListener
import com.intellij.openapi.editor.EditorFactory
import com.intellij.openapi.editor.event.SelectionEvent
import com.intellij.openapi.editor.event.SelectionListener
import com.jetbrains.ide.streamdeck.WebSocketServer
import com.jetbrains.ide.streamdeck.util.toCamelCase
import com.jetbrains.ide.streamdeck.util.toUnderscore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.withContext
import java.io.IOException
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit


class SelectionChangeListener : ApplicationInitializedListener {
    override suspend fun execute(asyncScope: CoroutineScope) {
        withContext(Dispatchers.Default) {
            try {
                val editorEventMulticaster = EditorFactory.getInstance().eventMulticaster

                val server = WebSocketServer(21421)
                val lis = MySelectionListener { msg ->
                    server.broadcastMessage(msg) { clientName, message ->
                        when (clientName) {
                            "com.jetbrains.idea.action.editor.cc" -> toCamelCase(message)
                            "com.jetbrains.idea.action.editor.ul" -> toUnderscore(message)
                            "com.jetbrains.idea.action.editor.tr" -> toUnderscore(message)
                            else -> message
                        }
                    }
                }
                editorEventMulticaster.addSelectionListener(lis) {}

                asyncScope.async {
                    server.start()
                }.start()
            } catch (e: IOException) {
                throw RuntimeException(e)
            }
        }
    }
}


class MySelectionListener(private val msgConsumer: (String) -> Unit) : SelectionListener {
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