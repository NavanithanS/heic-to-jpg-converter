// HEIC to JPG Converter
// Requirements: 
// npm install heic-convert fs path

const fs = require('fs').promises;
const path = require('path');
const heicConvert = require('heic-convert');

async function convertHeicToJpg(inputPath, outputPath, quality = 90) {
  try {
    // Read the HEIC file
    const inputBuffer = await fs.readFile(inputPath);
    
    // Convert HEIC to JPEG
    const jpegBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: quality // 1-100, higher is better quality but larger file
    });
    
    // If no output path is specified, create one based on the input path
    if (!outputPath) {
      outputPath = inputPath.replace(/\.heic$/i, '.jpg');
    }
    
    // Write the JPEG file
    await fs.writeFile(outputPath, jpegBuffer);
    
    console.log(`Successfully converted ${inputPath} to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error converting file: ${error.message}`);
    throw error;
  }
}

// Example usage for a single file
// convertHeicToJpg('path/to/your/image.heic', 'path/to/output/image.jpg');

// Batch conversion of all HEIC files in a directory
async function convertAllHeicInDirectory(directoryPath, outputDirectory = null) {
  try {
    // If no output directory is specified, use the input directory
    if (!outputDirectory) {
      outputDirectory = directoryPath;
    }
    
    // Create output directory if it doesn't exist
    try {
      await fs.mkdir(outputDirectory, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }
    
    // Get all files in the directory
    const files = await fs.readdir(directoryPath);
    
    // Filter for HEIC files
    const heicFiles = files.filter(file => 
      file.toLowerCase().endsWith('.heic') || file.toLowerCase().endsWith('.heif')
    );
    
    if (heicFiles.length === 0) {
      console.log('No HEIC files found in the directory.');
      return;
    }
    
    console.log(`Found ${heicFiles.length} HEIC files. Starting conversion...`);
    
    // Convert each HEIC file
    const conversionPromises = heicFiles.map(file => {
      const inputPath = path.join(directoryPath, file);
      const outputFileName = path.basename(file, path.extname(file)) + '.jpg';
      const outputPath = path.join(outputDirectory, outputFileName);
      
      return convertHeicToJpg(inputPath, outputPath);
    });
    
    // Wait for all conversions to complete
    await Promise.all(conversionPromises);
    
    console.log('All conversions completed successfully!');
  } catch (error) {
    console.error(`Error in batch conversion: ${error.message}`);
    throw error;
  }
}

// Example usage for batch conversion
// convertAllHeicInDirectory('/path/to/your/heic/files', '/path/to/output/directory');

module.exports = {
  convertHeicToJpg,
  convertAllHeicInDirectory
};

// Simple command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage:');
    console.log('  Single file: node script.js input.heic [output.jpg]');
    console.log('  Directory: node script.js --dir input_directory [output_directory]');
    process.exit(1);
  }
  
  if (args[0] === '--dir') {
    convertAllHeicInDirectory(args[1], args[2]);
  } else {
    convertHeicToJpg(args[0], args[1]);
  }
}
