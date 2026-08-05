package com.margelo.nitro.lottienitro

import android.graphics.Color

/**
 * Parses the colour strings that arrive on `colorFilters[].color`.
 *
 * v7 ran React Native's `processColor` in JavaScript and sent a platform int
 * across the bridge. v8 sends the string unparsed, so the accepted set is defined
 * here — and it has to match `LottieColorParser.swift` exactly, or the same prop
 * would behave differently per platform. Notably this is why we do not simply
 * delegate to [Color.parseColor]: it supports hex and a name list but not
 * `rgb()`/`rgba()`, so iOS and Android would diverge.
 *
 * Accepted: `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`, `rgb(r, g, b)`,
 * `rgba(r, g, b, a)`, and the CSS Level 1 colour names. Anything else returns
 * null, and the caller reports it through `onAnimationFailure` rather than
 * silently filling transparent as v7 did.
 */
internal object LottieColorParser {
  fun parse(input: String): Int? {
    val value = input.trim().lowercase()
    return when {
      value.startsWith("#") -> parseHex(value.substring(1))
      value.startsWith("rgb") -> parseRgbFunction(value)
      else -> NAMED_COLORS[value]
    }
  }

  private fun parseHex(hex: String): Int? {
    // #RGB / #RGBA — each nibble is doubled, as CSS does.
    val expanded = when (hex.length) {
      3, 4 -> hex.map { "$it$it" }.joinToString("")
      6, 8 -> hex
      else -> return null
    }
    val raw = expanded.toLongOrNull(16) ?: return null
    val hasAlpha = expanded.length == 8
    val r = ((raw shr if (hasAlpha) 24 else 16) and 0xFF).toInt()
    val g = ((raw shr if (hasAlpha) 16 else 8) and 0xFF).toInt()
    val b = ((raw shr if (hasAlpha) 8 else 0) and 0xFF).toInt()
    val a = if (hasAlpha) (raw and 0xFF).toInt() else 255
    return Color.argb(a, r, g, b)
  }

  private fun parseRgbFunction(value: String): Int? {
    val open = value.indexOf('(')
    val close = value.lastIndexOf(')')
    if (open < 0 || close < open) return null

    val parts = value.substring(open + 1, close).split(",").map { it.trim() }
    if (parts.size != 3 && parts.size != 4) return null

    // Channels accept 0-255 or a percentage; alpha is 0-1 or a percentage.
    fun channel(s: String): Int? {
      val fraction = if (s.endsWith("%")) {
        (s.dropLast(1).toDoubleOrNull() ?: return null) / 100
      } else {
        (s.toDoubleOrNull() ?: return null) / 255
      }
      return (fraction.coerceIn(0.0, 1.0) * 255).toInt()
    }
    fun alpha(s: String): Int? {
      val fraction = if (s.endsWith("%")) {
        (s.dropLast(1).toDoubleOrNull() ?: return null) / 100
      } else {
        s.toDoubleOrNull() ?: return null
      }
      return (fraction.coerceIn(0.0, 1.0) * 255).toInt()
    }

    val r = channel(parts[0]) ?: return null
    val g = channel(parts[1]) ?: return null
    val b = channel(parts[2]) ?: return null
    val a = if (parts.size == 4) alpha(parts[3]) ?: return null else 255
    return Color.argb(a, r, g, b)
  }

  /**
   * CSS Level 1 names. Kept deliberately small and identical to the Swift side
   * rather than pulling in the full CSS list, so the two can be diffed by eye.
   */
  private val NAMED_COLORS: Map<String, Int> = mapOf(
    "black" to Color.argb(255, 0, 0, 0),
    "silver" to Color.argb(255, 192, 192, 192),
    "gray" to Color.argb(255, 128, 128, 128),
    "grey" to Color.argb(255, 128, 128, 128),
    "white" to Color.argb(255, 255, 255, 255),
    "maroon" to Color.argb(255, 128, 0, 0),
    "red" to Color.argb(255, 255, 0, 0),
    "purple" to Color.argb(255, 128, 0, 128),
    "fuchsia" to Color.argb(255, 255, 0, 255),
    "magenta" to Color.argb(255, 255, 0, 255),
    "green" to Color.argb(255, 0, 128, 0),
    "lime" to Color.argb(255, 0, 255, 0),
    "olive" to Color.argb(255, 128, 128, 0),
    "yellow" to Color.argb(255, 255, 255, 0),
    "navy" to Color.argb(255, 0, 0, 128),
    "blue" to Color.argb(255, 0, 0, 255),
    "teal" to Color.argb(255, 0, 128, 128),
    "aqua" to Color.argb(255, 0, 255, 255),
    "cyan" to Color.argb(255, 0, 255, 255),
    "orange" to Color.argb(255, 255, 165, 0),
    "transparent" to Color.argb(0, 0, 0, 0),
  )
}
