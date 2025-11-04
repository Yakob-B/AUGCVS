# 🎨 Ambo University Logo Setup Guide

## Quick Setup

1. **Save your logo image** as `logo.png` in this directory (`client/public/images/`)
2. **Save your favicon** as `favicon.png` in this directory
3. That's it! The logo will automatically appear throughout the application

## Logo Features

The logo component has been customized with creative effects:

### ✨ Visual Effects
- **Hover Glow**: Purple glow effect on hover
- **Smooth Animations**: Floating animation for eye-catching presence
- **Scale Effects**: Gentle zoom on hover
- **Drop Shadows**: Purple-tinted shadows that match the theme
- **Responsive**: Automatically adapts to different screen sizes

### 📍 Where Logo Appears

1. **Navbar** - Top navigation bar (medium size, animated)
2. **Footer** - Bottom of every page (medium size)
3. **Login Page** - Large centered logo (xl size, animated)
4. **Register Page** - Large centered logo (xl size, animated)
5. **Forgot Password Page** - Large centered logo (xl size, animated)

### 🎯 Logo Specifications

**Recommended Settings:**
- **Format**: PNG with transparent background (preferred) or JPG
- **Main Logo Size**: 200x200px or larger (will be automatically scaled)
- **Favicon Size**: 32x32px or 64x64px
- **File Size**: Under 500KB for optimal performance
- **Colors**: The logo will work with any color scheme, but purple accents will be added

### 🎨 Customization Options

The Logo component supports various props:
- `size`: 'small', 'medium', 'large', 'xl', '2xl'
- `showText`: true/false (show/hide "Ambo Portal" text)
- `animated`: true/false (enable/disable floating animation)
- `linkTo`: Custom link destination (default: '/')

### 💡 Tips

1. **Optimize Your Image**: Use tools like TinyPNG or ImageOptim to compress without losing quality
2. **Transparent Background**: PNG with transparency works best for the dark purple theme
3. **High Resolution**: Use a high-resolution logo; it will be scaled down automatically
4. **Test Different Sizes**: Try different logo sizes to see what looks best

### 🚀 Automatic Fallback

If the logo image is not found or fails to load:
- The system automatically shows a beautiful purple gradient icon
- Text "Ambo Portal" will always be visible
- No errors or broken images

Enjoy your customized logo! 🎉

