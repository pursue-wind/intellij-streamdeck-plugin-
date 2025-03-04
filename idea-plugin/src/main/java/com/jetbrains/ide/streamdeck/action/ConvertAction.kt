package com.jetbrains.ide.streamdeck.action

import com.intellij.openapi.actionSystem.DataContext
import com.intellij.openapi.editor.Caret
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.editor.actionSystem.EditorWriteActionHandler
import com.jetbrains.ide.streamdeck.util.toCamelCase
import com.jetbrains.ide.streamdeck.util.toUnderscore
import io.github.pursuewind.intellij.plugin.generate.MyEditorAction

abstract class AbsConvertAction(convertFunc: (String) -> String) : MyEditorAction(null) {
    init {
        setupHandler(object : EditorWriteActionHandler(false) {
            override fun executeWriteAction(editor: Editor, caret: Caret?, dataContext: DataContext) {
                editor.caretModel.runForEachCaret { caret ->
                    if (caret.isValid) {
                        val newText = convertFunc(caret.selectedText ?: "")
                        editor.document.replaceString(caret.selectionStart, caret.selectionEnd, newText)
                        editor.selectionModel.setSelection(
                            caret.selectionStart,
                            caret.selectionStart + newText.length
                        )
                    }
                }
            }
        })
    }
}

class ToCamelCaseAction : AbsConvertAction(toCamelCase)
class ToUnderscoreAction : AbsConvertAction(toUnderscore)
