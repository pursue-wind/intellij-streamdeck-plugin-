package com.jetbrains.ide.streamdeck.util


fun String.toCamelCase(): String {
    val builder = StringBuilder()
    var upperCase = false
    for (i in this.indices) {
        val c = this[i]
        upperCase = if (c == ' ' || c == '-' || c == '_') {
            true
        } else {
            builder.append(if (upperCase) c.uppercaseChar() else c)
            false
        }
    }
    return builder.toString()
}

fun String.toUnderscore(): String {
    return this.replace(Regex("([a-z])([A-Z]+)"), "$1_$2")
        .replace(Regex("[ -]"), "_")
        .lowercase()
}



