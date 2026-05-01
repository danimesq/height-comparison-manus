🌈 # Design Reference - Height Comparison App 🌈

## Key Styling from Reference HTML

### Comparison Box Background
- **Color**: Light blue background (appears to be `#e6f2f9` or similar light cyan)
- **Purpose**: Creates visual separation and focus for the comparison area
- **Effect**: Makes silhouettes stand out with good contrast

### Silhouette Colors (from URL parameters)
Each person gets a unique color represented as hex codes in the URL:
- Format: `#RRGGBB` (standard hex color)
- Examples from reference: `#EF51F5`, `#D4CD18`, `#52F764`, `#AA6490`, `#5BF92A`, `#8271A8`, `#D8B041`

### Layout Structure
1. **Top Section**: Title + Add/Edit buttons
2. **Main Comparison Area**: 
   - Light blue background container
   - Height scale on left (0cm - 220cm+)
   - Silhouettes rendered as SVG with dynamic heights
   - Names and heights displayed above each silhouette
3. **Bottom Section**: Additional info/sharing

### SVG Silhouette Rendering
- Each person is rendered as an SVG path
- Height is scaled proportionally (e.g., 173cm = 349.896px height)
- Color is applied via `fill` attribute
- Names and measurements displayed in text elements

### Key Colors to Preserve
- Light blue background: Essential for the comparison box
- Vibrant silhouette colors: Rainbow palette for visual appeal
- Dark text: For readability on light background

## Implementation Notes
- Keep the light blue background for the comparison container
- Use vibrant, saturated colors for silhouettes (not muted)
- Maintain the scale visualization with height markers
- Ensure responsive design for mobile devices
