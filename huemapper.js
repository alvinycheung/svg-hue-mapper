// Dependencies: This script requires the 'fs' and 'resemble' libraries.
// To use this script, make sure to install them using npm:
// npm install fs node-html-parser

const fs = require("fs");
const path = require("path");
const { parse } = require("node-html-parser");

// Adjust the hue. Provide the target hex color
const targetHexColor = "#0a465b"; // Base color from Dark Cyan Blue palette
const currentDirectory = __dirname;
const outputDirectory = path.join(currentDirectory, "updated");

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

const colorPalette = {
  50: "#d7e4ec",
  100: "#aec7d6",
  200: "#85abc0",
  300: "#5b8faa",
  400: "#327493",
  500: "#0a5a7b",
  600: "#0a465b",
  700: "#08384d",
  800: "#052a3c",
  900: "#021b2a",
};

function modifyHue(hexColor) {
  const targetRgb = hexToRgb(targetHexColor);
  if (!targetRgb) return hexColor;
  const targetHsv = rgbToHsv(...targetRgb);

  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;
  const hsv = rgbToHsv(...rgb);

  // Use the hue from the target color, keep the saturation and value from the original color
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

  for (const key in colorPalette) {
    const paletteRgb = hexToRgb(colorPalette[key]);
    if (!paletteRgb) continue;

    const distance = colorDistance(rgb, paletteRgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorPalette[key];
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
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rgbToHsv(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);
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
        h = (g - b) / d + (g < b ? 6 : 0);
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

  return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

fs.readdir(currentDirectory, (err, files) => {
  if (err) {
    console.error("Error reading the directory:", err);
    return;
  }

  files
    .filter((file) => path.extname(file) === ".svg")
    .forEach((file) => {
      const filePath = path.join(currentDirectory, file);
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading the file:", err);
          return;
        }

        const root = parse(data);
        const elementsWithFill = root.querySelectorAll(
          "[fill], path, rect, circle, ellipse, polygon, line"
        );

        elementsWithFill.forEach((element) => {
          const fillColor = element.getAttribute("fill");
          if (fillColor && fillColor.startsWith("#")) {
            const newColor = modifyHue(fillColor);
            element.setAttribute("fill", newColor);
          }
        });

        // Update elements with style attribute that includes fill color
        const elementsWithStyle = root.querySelectorAll("[style]");
        elementsWithStyle.forEach((element) => {
          const style = element.getAttribute("style");
          const fillMatch = style.match(/fill:\s*(#[a-fA-F0-9]{6})/);
          if (fillMatch) {
            const originalColor = fillMatch[1];
            const newColor = modifyHue(originalColor);
            element.setAttribute(
              "style",
              style.replace(fillMatch[1], newColor)
            );
          }
        });

        // Remove hash numbers from the beginning of the file name
        const outputFileName = file.replace(/^.*?_/, "");
        const outputFilePath = path.join(outputDirectory, outputFileName);

        fs.writeFile(outputFilePath, root.toString(), "utf8", (err) => {
          if (err) {
            console.error("Error writing the file:", err);
          } else {
            console.log(`Updated hue for ${file}`);
          }
        });
      });
    });
});
