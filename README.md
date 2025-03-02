# HEIC to JPG Converter

A simple, efficient Node.js utility for converting HEIC/HEIF image files to JPEG format.

![License](https://img.shields.io/github/license/your-username/heic-to-jpg-converter)
![Node Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)

## Features

- Convert single HEIC files to JPG
- Batch convert entire directories of HEIC files
- Maintain image quality with adjustable compression settings
- Simple command-line interface
- Lightweight with minimal dependencies

## Installation

### Prerequisites

- Node.js (v14 or newer)
- npm (comes with Node.js)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/heic-to-jpg-converter.git
cd heic-to-jpg-converter

# Install dependencies
npm install
```

## Usage

### Command Line Interface

```bash
# Convert a single file
node heic-to-jpg-converter.js path/to/image.heic [path/to/output.jpg]

# Convert all HEIC files in a directory
node heic-to-jpg-converter.js --dir path/to/directory [path/to/output/directory]
```

If you don't specify an output path, the converted JPG will be saved in the same location as the original HEIC file.

### Examples

```bash
# Convert a single file
node heic-to-jpg-converter.js ~/Pictures/photo.heic ~/Downloads/photo.jpg

# Convert all HEIC files in the current directory
node heic-to-jpg-converter.js --dir . .

# Convert all HEIC files from one directory to another
node heic-to-jpg-converter.js --dir ~/Pictures/iPhone ~/Pictures/Converted
```

### Using as a Module

You can also use the converter in your own Node.js scripts:

```javascript
const converter = require('./heic-to-jpg-converter');

// Convert a single file
converter.convertHeicToJpg('input.heic', 'output.jpg')
  .then(outputPath => console.log(`File converted successfully: ${outputPath}`))
  .catch(err => console.error(`Error: ${err.message}`));

// Convert a directory
converter.convertAllHeicInDirectory('/path/to/heic/files', '/path/to/output')
  .then(() => console.log('All files converted successfully'))
  .catch(err => console.error(`Error: ${err.message}`));
```

## Why Use This Tool?

HEIC (High Efficiency Image File Format) is used by default on newer iPhones and other devices but isn't universally supported. This tool helps you convert these files to the widely-compatible JPG format while:

- Preserving image quality
- Batch processing multiple files
- Avoiding the need for online converters that might compromise privacy
- Working on all major operating systems (Windows, macOS, Linux)

## Performance

- Single conversion: ~1-2 seconds per image
- Batch conversion: Processes files in parallel for maximum efficiency

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [heic-convert](https://github.com/catdad-experiments/heic-convert) - The underlying library used for conversion
