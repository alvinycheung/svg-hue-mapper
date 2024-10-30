const fs = require("fs");
const path = require("path");
const { parse } = require("node-html-parser");

// Define your color palettes
// prettier-ignore
const colors = {
  main: {
    mint: { 50: '#e6f7f1', 100: '#c0ecd8', 200: '#9ce2c0', 300: '#74d7a9', 400: '#63d694', 500: '#48c182', 600: '#3aa36b', 700: '#2d8654', 800: '#206a3f', 900: '#145028' },
    aqua: { 50: '#e3fcfc', 100: '#b8f5f5', 200: '#8dedee', 300: '#65e5e6', 400: '#56e6d7', 500: '#2dc7bc', 600: '#22a19b', 700: '#187c7a', 800: '#0f5759', 900: '#08363a' },
    'Dark Cyan Blue': { 50: '#d7e4ec', 100: '#aec7d6', 200: '#85abc0', 300: '#5b8faa', 400: '#327493', 500: '#0a5a7b', 600: '#0a465b', 700: '#08384d', 800: '#052a3c', 900: '#021b2a' },
    'Off-White': { 50: '#f8f9f9', 100: '#f4f5f6', 200: '#f1f2f2', 300: '#daddde', 400: '#b5babc', 500: '#8f9798', 600: '#6b7374', 700: '#50595a', 800: '#343d3e', 900: '#1a2021' },
    blush: { 50: '#fdf4f8', 100: '#fce9f1', 200: '#f9cfe3', 300: '#f4a8cd', 400: '#ed77b0', 500: '#e04593', 600: '#c53375', 700: '#a1205c', 800: '#7c1748', 900: '#5e1237' },
    sand: { 50: '#faf9f8', 100: '#f3f1ef', 200: '#e4dfda', 300: '#d4c9b8', 400: '#b8a893', 500: '#8f7f6c', 600: '#6f6250', 700: '#5a4f40', 800: '#423b31', 900: '#2f2a24' },
    sunset: { 50: '#fff7f2', 100: '#ffe8d8', 200: '#ffd1af', 300: '#ffb884', 400: '#ff914b', 500: '#ff6e1c', 600: '#e4540e', 700: '#b63e0c', 800: '#90310a', 900: '#662308' },
    lavender: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87' }
  }
};

// Select the palette and shade you want to use
const selectedPalette = "sunset";
const selectedShade = 600;

// Use the selected color
const targetHexColor = colors.main[selectedPalette][selectedShade];
const colorPalette = colors.main[selectedPalette];

const currentDirectory = __dirname;
const sourceDirectory = path.join(currentDirectory, "SVGs");
const outputDirectory = path.join(currentDirectory, "updated");

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

function modifyHue(hexColor) {
  const targetRgb = hexToRgb(targetHexColor);
  if (!targetRgb) return hexColor;
  const targetHsv = rgbToHsv(...targetRgb);

  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;
  const hsv = rgbToHsv(...rgb);

  // Use the hue from the target color
  hsv[0] = targetHsv[0];

  const [newR, newG, newB] = hsvToRgb(hsv[0], hsv[1], hsv[2]);
  const newHex = rgbToHex(newR, newG, newB);
  return mapToClosestColor(newHex);
}

function mapToClosestColor(hexColor) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;

  let closestColor = null;
  let minDistance = Infinity;

  for (const shade in colorPalette) {
    const paletteColor = colorPalette[shade];
    const paletteRgb = hexToRgb(paletteColor);
    if (!paletteRgb) continue;

    const distance = colorDistance(rgb, paletteRgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = paletteColor;
    }
  }

  return closestColor || hexColor;
}

function colorDistance(rgb1, rgb2) {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, v];
}

function hsvToRgb(h, s, v) {
  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

fs.readdir(sourceDirectory, (err, files) => {
  if (err) {
    console.error("Error reading the directory:", err);
    return;
  }

  files
    .filter((file) => path.extname(file) === ".svg")
    .forEach((file) => {
      const filePath = path.join(sourceDirectory, file);
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading the file:", err);
          return;
        }

        const root = parse(data);
        const elements = root.querySelectorAll("*");

        elements.forEach((element) => {
          // Update 'fill' attribute
          const fillColor = element.getAttribute("fill");
          if (fillColor && fillColor.startsWith("#")) {
            const newFill = modifyHue(fillColor);
            element.setAttribute("fill", newFill);
          }

          // Update 'stroke' attribute
          const strokeColor = element.getAttribute("stroke");
          if (strokeColor && strokeColor.startsWith("#")) {
            const newStroke = modifyHue(strokeColor);
            element.setAttribute("stroke", newStroke);
          }

          // Update styles that include 'fill' or 'stroke'
          const style = element.getAttribute("style");
          if (style) {
            const newStyle = style.replace(
              /(fill|stroke):\s*(#[a-fA-F0-9]{6})/g,
              (match, prop, color) => {
                const newColor = modifyHue(color);
                return `${prop}: ${newColor}`;
              }
            );
            element.setAttribute("style", newStyle);
          }
        });

        // Remove hash numbers from the beginning of the file name
        const outputFileName = file.replace(/^.*?_/, "");
        const outputFilePath = path.join(outputDirectory, outputFileName);

        fs.writeFile(outputFilePath, root.toString(), "utf8", (err) => {
          if (err) {
            console.error("Error writing the file:", err);
          } else {
            console.log(`Updated colors for ${file}`);
          }
        });
      });
    });
});
