package com.jetbrains.ide.streamdeck.action

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.editor.EditorFactory
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import com.sun.activation.registries.LogSupport.log


class SendSelectedTextAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        val project: Project? = e.project
        val editor = EditorFactory.getInstance().getAllEditors().firstOrNull { it.project == project }
        val selectedText = editor?.selectionModel?.selectedText

        if (selectedText != null) {
            sendTextToStreamDeck(selectedText)
            Messages.showMessageDialog(project, "Selected text sent to Stream Deck: $selectedText", "Info", Messages.getInformationIcon())
        } else {
            Messages.showMessageDialog(project, "No text selected", "Warning", Messages.getWarningIcon())
        }
    }

    private fun sendTextToStreamDeck(text: String) {
        log("stream deck req ${text}")

    }
}
