# Landing Page Animated GIF with Google Whisk

**Purpose:** Create a stunning, dynamic animated GIF for the OnlySnow landing page splash section using Google Whisk AI.

## Google Whisk Overview

[Google Whisk](https://labs.google/fx/tools/whisk) is Google Labs' experimental AI tool that creates images by blending three visual inputs:
- **Subject:** The main focal point
- **Scene:** The environment/setting
- **Style:** The artistic approach

**Key Features:**
- Powered by Gemini for caption generation
- Uses Imagen 3 for image generation
- **Whisk Animate** (Veo 2): Converts images to 8-second animated videos/GIFs
- Available in 100+ countries
- Free image generation + 10 free animation uses

## Recommended Concepts for OnlySnow Splash GIF

### Option 1: Epic Powder Run 🎿
**Subject:** Professional skier carving through deep powder
**Scene:** Steep mountain face with fresh snowfall, blue sky background
**Style:** Cinematic, high-energy action shot with snow spray

**Animation:**
- Camera follows skier down the mountain
- Powder spray creates dynamic movement
- Bright, vibrant colors (blue sky, white snow)

---

### Option 2: Storm Approaching ⛈️
**Subject:** Dramatic storm clouds rolling over mountain peaks
**Scene:** Wide mountain range at sunset/sunrise
**Style:** Time-lapse photography, dramatic lighting

**Animation:**
- Clouds rolling in from left to right
- Lightning flashes in distance
- Color transition from golden hour to stormy blues

---

### Option 3: Mountain Sunrise 🌄
**Subject:** Snow-covered mountain peaks at dawn
**Scene:** Panoramic alpine vista with layered mountain ranges
**Style:** Serene, cinematic landscape with warm/cool contrast

**Animation:**
- Sun rising behind peaks
- Light gradually illuminating the mountains
- Soft color gradient from purple/blue to orange/pink

---

### Option 4: Ski Resort Birds-Eye View 🗺️
**Subject:** Aerial view of ski resort with trails visible
**Scene:** Mountain resort from above, showing trail patterns
**Style:** High-altitude drone photography, crystal clear

**Animation:**
- Slow camera pan across the resort
- Zoom in from wide to detailed view
- Trail markers subtly glowing

---

## Step-by-Step Guide

### 1. Access Google Whisk
Visit: https://labs.google/fx/tools/whisk

**Requirements:**
- Google account
- Available in 100+ countries
- No payment required for base features

### 2. Create Your Base Image

**Method A: Text Prompts** (Recommended for consistency)
1. Click "Create with prompts" instead of image upload
2. Enter detailed descriptions for Subject, Scene, Style

**Example Prompt (Epic Powder Run):**
```
Subject: Professional skier in bright blue jacket carving down steep slope,
powder snow spray exploding around them, dynamic action shot

Scene: Steep mountain face with deep fresh powder snow, bright blue sky,
Colorado Rocky Mountains, pristine backcountry terrain

Style: High-speed action photography, cinematic quality, vivid colors,
dramatic lighting, sports photography magazine cover style
```

**Method B: Upload Reference Images**
1. Find 3 reference images matching your vision
2. Upload to Subject, Scene, Style sections
3. Whisk will blend them into a new image

### 3. Generate Base Image

1. Click "Generate"
2. Wait 10-30 seconds for Imagen 3 to create image
3. Review the result
4. Regenerate with adjusted prompts if needed

**Tips:**
- Be specific with colors (blue sky, white snow)
- Mention lighting (golden hour, dramatic, bright)
- Include mood keywords (energetic, serene, epic)
- Add technical details (4K, cinematic, high-resolution)

### 4. Animate with Veo 2

Once you have the perfect base image:

1. Click "Animate" button below the generated image
2. Whisk Animate (Veo 2) will create an 8-second animated clip
3. Wait 1-2 minutes for animation processing
4. Preview the animation

**First 10 animations are FREE**

### 5. Download as GIF

1. Click "Download" on the animated result
2. Choose format:
   - **MP4** (smaller file, better quality)
   - **GIF** (better browser compatibility)
3. Save to `/apps/frontend/public/landing-splash.gif`

**Recommended:** Download both formats
- Use MP4 for modern browsers (better compression)
- Fallback to GIF for older browsers

### 6. Optimize the GIF

**For Web Performance:**

Use ImageOptim or similar tool:
```bash
# Install imageoptim-cli (macOS)
brew install imageoptim-cli

# Optimize GIF
imageoptim --quality 80-100 landing-splash.gif
```

**Or use online tools:**
- https://ezgif.com/optimize (reduce file size)
- https://www.iloveimg.com/compress-image/compress-gif

**Target:** Under 3MB for fast loading

---

## Implementation in Code

The landing page (`apps/frontend/src/app/page.tsx`) already has a placeholder for the GIF:

```tsx
{/* Animated Background - Replace with Whisk AI generated GIF */}
<div className="absolute inset-0 z-0">
  {/* TODO: Add Whisk-generated GIF here */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700" />
</div>
```

**Replace with:**

```tsx
{/* Animated Background with Whisk AI GIF */}
<div className="absolute inset-0 z-0 overflow-hidden">
  {/* Video for modern browsers (better quality) */}
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover opacity-60"
  >
    <source src="/landing-splash.mp4" type="video/mp4" />
    {/* Fallback to GIF for older browsers */}
    <img
      src="/landing-splash.gif"
      alt="Epic skiing animation"
      className="absolute inset-0 w-full h-full object-cover"
    />
  </video>

  {/* Gradient overlay for text readability */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-blue-950/60" />
</div>
```

---

## Alternative: Multiple GIF Rotation

Create 3-4 different GIFs and rotate them:

```tsx
const splashGifs = [
  '/splash-powder-run.gif',
  '/splash-storm-chase.gif',
  '/splash-sunrise.gif',
];

const [currentGif, setCurrentGif] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentGif((prev) => (prev + 1) % splashGifs.length);
  }, 10000); // Switch every 10 seconds
  return () => clearInterval(interval);
}, []);

return (
  <img
    src={splashGifs[currentGif]}
    alt="OnlySnow splash animation"
    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
  />
);
```

---

## Cost Breakdown

**Google Whisk Pricing:**
- Image Generation: **FREE**
- First 10 Animations (Veo 2): **FREE**
- Additional Animations: **Paid** (pricing TBD)

**Recommendations:**
- Use your 10 free animations wisely
- Generate 3-4 variations for A/B testing
- Download both MP4 and GIF formats
- Keep final files under 3MB each

---

## Quality Checklist

Before finalizing your GIF:

- [ ] Resolution: At least 1920x1080 (Full HD)
- [ ] Duration: 8 seconds (Whisk standard)
- [ ] File size: Under 3MB (optimized)
- [ ] Colors: Vibrant blues and whites (on-brand)
- [ ] Motion: Smooth, not jarring
- [ ] Readability: Text overlay remains readable
- [ ] Mobile: Looks good on small screens
- [ ] Performance: Loads quickly (<2 seconds)

---

## Troubleshooting

**Issue: Generated image doesn't match vision**
- Solution: Be more specific in prompts, include color codes
- Try: "Bright #00AFF0 blue sky" instead of "blue sky"

**Issue: Animation is too fast/slow**
- Solution: Currently fixed at 8 seconds by Veo 2
- Workaround: Use video editing software to adjust speed

**Issue: File size too large**
- Solution: Use compression tools (ImageOptim, ezgif)
- Alternative: Use MP4 instead of GIF (10x smaller)

**Issue: GIF not looping smoothly**
- Solution: Request "seamless loop" in prompt
- Workaround: Use CSS to hide loop transition

---

## Next Steps

1. ✅ Updated landing page with splash section
2. ✅ Added animated gradient and snow particles
3. ⏳ **Create GIF with Google Whisk** (follow this guide)
4. ⏳ Add GIF to `/apps/frontend/public/`
5. ⏳ Update landing page code with video/GIF element
6. ⏳ Test performance and optimize

---

## Sources

- [Google Whisk Official Site](https://labs.google/fx/tools/whisk)
- [Whisk AI Review 2026](https://filmora.wondershare.com/video-editor-review/google-whisk-ai.html)
- [Google Labs Blog: Whisk Announcement](https://blog.google/technology/google-labs/whisk/)
- [Whisk Animate Preview](https://www.aibase.com/news/16016)
- [Complete Whisk AI Guide](https://online.hitpaw.com/learn/ultimate-guide-to-whisk-ai.html)
