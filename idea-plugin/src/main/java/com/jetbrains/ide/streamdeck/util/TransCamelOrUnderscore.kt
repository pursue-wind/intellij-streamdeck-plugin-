package com.jetbrains.ide.streamdeck.util

val toCamelCase: (String) -> String = {
    val builder = StringBuilder()
    var upperCase = false
    for (i in it.indices) {
        val c = it[i]
        upperCase = if (c == ' ' || c == '-' || c == '_') {
            true
        } else {
            builder.append(if (upperCase) c.uppercaseChar() else c)
            false
        }
    }
    builder.toString()
}


val toUnderscore: (String) -> String = { s ->
    s.replace(Regex("([a-z])([A-Z]+)"), "$1_$2")
        .replace(Regex("[ -]"), "_")
        .lowercase()
}

