import UIKit

/// Parses the colour strings that arrive on `colorFilters[].color`.
///
/// v7 ran React Native's `processColor` in JavaScript and sent a platform int
/// across the bridge. v8 sends the string unparsed, so the accepted set is
/// defined here — and it has to match `LottieColorParser.kt` exactly, or the same
/// prop would behave differently per platform.
///
/// Accepted: `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`, `rgb(r, g, b)`,
/// `rgba(r, g, b, a)`, and the CSS Level 1 colour names. Anything else returns
/// nil, and the caller reports it through `onAnimationFailure` rather than
/// silently filling transparent as v7 did.
enum LottieColorParser {
  static func parse(_ input: String) -> UIColor? {
    let value = input.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    if value.hasPrefix("#") { return parseHex(String(value.dropFirst())) }
    if value.hasPrefix("rgb") { return parseRGBFunction(value) }
    return namedColors[value]
  }

  private static func parseHex(_ hex: String) -> UIColor? {
    let expanded: String
    switch hex.count {
    case 3, 4:
      // #RGB / #RGBA — each nibble is doubled, as CSS does.
      expanded = hex.map { "\($0)\($0)" }.joined()
    case 6, 8:
      expanded = hex
    default:
      return nil
    }

    guard let raw = UInt64(expanded, radix: 16) else { return nil }
    let hasAlpha = expanded.count == 8
    let r = CGFloat((raw >> (hasAlpha ? 24 : 16)) & 0xFF) / 255
    let g = CGFloat((raw >> (hasAlpha ? 16 : 8)) & 0xFF) / 255
    let b = CGFloat((raw >> (hasAlpha ? 8 : 0)) & 0xFF) / 255
    let a = hasAlpha ? CGFloat(raw & 0xFF) / 255 : 1
    return UIColor(red: r, green: g, blue: b, alpha: a)
  }

  private static func parseRGBFunction(_ value: String) -> UIColor? {
    guard let open = value.firstIndex(of: "("),
          let close = value.lastIndex(of: ")") else { return nil }

    let parts = value[value.index(after: open)..<close]
      .split(separator: ",")
      .map { $0.trimmingCharacters(in: .whitespaces) }
    guard parts.count == 3 || parts.count == 4 else { return nil }

    // Channels accept 0-255 or a percentage; alpha is 0-1 or a percentage.
    func channel(_ s: String) -> CGFloat? {
      if s.hasSuffix("%") {
        guard let p = Double(s.dropLast()) else { return nil }
        return CGFloat(min(max(p / 100, 0), 1))
      }
      guard let n = Double(s) else { return nil }
      return CGFloat(min(max(n / 255, 0), 1))
    }
    func alpha(_ s: String) -> CGFloat? {
      if s.hasSuffix("%") {
        guard let p = Double(s.dropLast()) else { return nil }
        return CGFloat(min(max(p / 100, 0), 1))
      }
      guard let n = Double(s) else { return nil }
      return CGFloat(min(max(n, 0), 1))
    }

    guard let r = channel(parts[0]),
          let g = channel(parts[1]),
          let b = channel(parts[2]) else { return nil }
    let a = parts.count == 4 ? alpha(parts[3]) : 1
    guard let a else { return nil }
    return UIColor(red: r, green: g, blue: b, alpha: a)
  }

  /// CSS Level 1 names. Kept deliberately small and identical to the Kotlin side
  /// rather than pulling in the full CSS colour list, so the two platforms can be
  /// diffed by eye.
  private static let namedColors: [String: UIColor] = [
    "black": UIColor(white: 0, alpha: 1),
    "silver": UIColor(red: 0.75, green: 0.75, blue: 0.75, alpha: 1),
    "gray": UIColor(white: 0.5, alpha: 1),
    "grey": UIColor(white: 0.5, alpha: 1),
    "white": UIColor(white: 1, alpha: 1),
    "maroon": UIColor(red: 0.5, green: 0, blue: 0, alpha: 1),
    "red": UIColor(red: 1, green: 0, blue: 0, alpha: 1),
    "purple": UIColor(red: 0.5, green: 0, blue: 0.5, alpha: 1),
    "fuchsia": UIColor(red: 1, green: 0, blue: 1, alpha: 1),
    "magenta": UIColor(red: 1, green: 0, blue: 1, alpha: 1),
    "green": UIColor(red: 0, green: 0.5, blue: 0, alpha: 1),
    "lime": UIColor(red: 0, green: 1, blue: 0, alpha: 1),
    "olive": UIColor(red: 0.5, green: 0.5, blue: 0, alpha: 1),
    "yellow": UIColor(red: 1, green: 1, blue: 0, alpha: 1),
    "navy": UIColor(red: 0, green: 0, blue: 0.5, alpha: 1),
    "blue": UIColor(red: 0, green: 0, blue: 1, alpha: 1),
    "teal": UIColor(red: 0, green: 0.5, blue: 0.5, alpha: 1),
    "aqua": UIColor(red: 0, green: 1, blue: 1, alpha: 1),
    "cyan": UIColor(red: 0, green: 1, blue: 1, alpha: 1),
    "orange": UIColor(red: 1, green: 0.647, blue: 0, alpha: 1),
    "transparent": UIColor(white: 0, alpha: 0),
  ]
}
