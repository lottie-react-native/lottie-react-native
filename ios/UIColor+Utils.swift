//
//  UIColor+Utils.swift
//  Pods
//
//  Created by Parsa's Content Creation Corner on 2025-04-12.
//
import UIKit

extension UIColor {
    /// Initializes a UIColor with a hex string, returning nil if the string is invalid
    convenience init?(hexString: String) {
        // Remove any whitespace or '#' prefix
        var hexString = hexString.trimmingCharacters(in: .whitespacesAndNewlines)
        hexString = hexString.replacingOccurrences(of: "#", with: "")
        
        // Validate hex string format
        let validHexCharSet = CharacterSet(charactersIn: "0123456789ABCDEFabcdef")
        if hexString.isEmpty || hexString.rangeOfCharacter(from: validHexCharSet.inverted) != nil {
            return nil
        }
        
        // Ensure the hex string is a valid length (3, 4, 6, or 8 characters)
        guard [3, 4, 6, 8].contains(hexString.count) else {
            return nil
        }
        
        var int = UInt64()
        guard Scanner(string: hexString).scanHexInt64(&int) else {
            return nil
        }
        
        let r, g, b, a: UInt64
        switch hexString.count {
        case 3: // RGB (12-bit)
            (r, g, b, a) = ((int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17, 255)
        case 4: // RGBA (16-bit)
            (r, g, b, a) = ((int >> 12) * 17, (int >> 8 & 0xF) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (r, g, b, a) = (int >> 16, int >> 8 & 0xFF, int & 0xFF, 255)
        case 8: // RGBA (32-bit)
            (r, g, b, a) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            return nil
        }
        
        self.init(red: CGFloat(r) / 255, green: CGFloat(g) / 255, blue: CGFloat(b) / 255, alpha: CGFloat(a) / 255)
    }
}
