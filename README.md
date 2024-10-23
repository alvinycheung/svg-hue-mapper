# SVG Hue Modifier

## Overview

This script modifies the hue of SVG files within the current directory. It is designed to adjust the colors of elements in SVG graphics, allowing for a uniform color scheme change. The modified SVG files are saved in an `updated` directory with altered filenames (removing any initial hash or identifier).

The script is especially useful for updating color schemes in batch, for example, for maintaining a consistent brand color across multiple SVG assets.

## Features

- Changes the hue of specified colors in SVG files.
- Maps adjusted colors to the closest colors from a defined palette to maintain consistency.
- Processes SVG files concurrently for improved performance.
- Removes hash prefixes from the output filenames for easier management.
- Handles elements with both `fill` attributes and inline `style` attributes.

## Requirements

- Node.js environment
- Dependencies:
  - `fs` (native Node.js module for filesystem operations)
  - `path` (native Node.js module for working with file paths)
  - `node-html-parser` (to parse and manipulate the SVG XML structure)

## Installation

1. Clone or download this repository to your local machine.
2. Install the necessary Node.js dependencies by running the following command in your terminal:
   ```sh
   npm install fs path node-html-parser
   ```

## Usage

1. Place the SVG files that you want to modify in the same directory as the script.
2. Run the script using Node.js:
   ```sh
   node svg-hue-modifier.js
   ```
3. The script will process all `.svg` files in the current directory and save the modified versions to an `updated` directory.

## How it Works

- The script reads all `.svg` files in the directory and parses the XML structure using `node-html-parser`.
- It adjusts the hue of all elements with `fill` attributes and updates their color based on a target color hue (`#0a465b` - Dark Cyan Blue).
- Additionally, it maps the new color to the closest color from a predefined color palette.
- Elements with `style` attributes containing `fill` properties are also processed to change their color.
- The modified SVG files are saved in an `updated` folder with the filename cleaned of any hash prefixes.

## Configuration

- **Target Hue**: The target hue is currently set to `#0a465b` (Dark Cyan Blue). This can be adjusted by modifying the `targetHexColor` variable in the script.
- **Color Palette**: The script uses a predefined color palette to ensure that colors remain consistent. This palette can be updated or customized in the `colorPalette` object.

## Performance

The script processes multiple SVG files concurrently using `Promise.all` for improved performance, especially useful when working with a large number of SVG files.

## Known Limitations

- The regex used for removing hash numbers from the filenames may need adjustments if the filenames vary significantly in structure.
- The color adjustment only affects elements with `fill` properties and certain inline styles. If additional attributes need to be targeted (e.g., `stroke`), the script would require further modification.

## Example

If your directory contains SVG files like:

```
6700b1003622e22dbd310e84_icon-example.svg
6700b1003622e22dbd310e99_logo-example.svg
```

After running the script, you will find modified versions in the `updated` directory, with filenames like:

```
icon-example.svg
logo-example.svg
```

## Error Handling

- The script includes basic error handling for reading and writing files.
- If a particular file cannot be processed, an error message is logged, and the script continues with other files.

## Contributing

Feel free to submit issues or pull requests for improvements or new features.

## License

This project is open-source and available under the MIT License.
