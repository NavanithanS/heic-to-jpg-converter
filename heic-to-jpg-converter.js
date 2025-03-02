// HEIC to JPG Converter
// Requirements: 
// npm install heic-convert

const fs = require('fs').promises;
const path = require('path');
const heicConvert = require('heic-convert');

/**
 * Converts a HEIC/HEIF image to JPG format
 * @param {string} inputPath - Path to the HEIC file
 * @param {string} outputPath - Path for the output JPG file (optional)
 * @param {number} quality - JPEG quality (1-100, default: 90)
 * @returns {Promise<string>} - Path to the converted file
 */
async function convertHeicToJpg(inputPath, outputPath, quality = 90) {
  try {
    // Validate input file exists before processing
    try {
      await fs.access(inputPath);
    } catch (error) {
      throw new Error(`Input file not found: ${inputPath}`);
    }
    
    // Read the HEIC file
    const inputBuffer = await fs.readFile(inputPath);
    
    // If no output path is specified, create one based on the input path
    if (!outputPath) {
      outputPath = inputPath.replace(/\.heic$/i, '.jpg');
    }
    
    // Check if output file already exists
    let fileExists = false;
    try {
      await fs.access(outputPath);
      fileExists = true;
    } catch (error) {
      // File doesn't exist, which is fine
    }
    
    if (fileExists) {
      console.log(`Warning: Output file ${outputPath} already exists and will be overwritten.`);
    }
    
    // Convert HEIC to JPEG
    const jpegBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: quality // 1-100, higher is better quality but larger file
    });
    
    // Get original file stats to preserve creation/modification dates
    const stats = await fs.stat(inputPath);
    
    // Write the JPEG file
    await fs.writeFile(outputPath, jpegBuffer);
    
    // Preserve the original file's modification time
    try {
      await fs.utimes(outputPath, stats.atime, stats.mtime);
    } catch (error) {
      console.warn(`Could not preserve file timestamps: ${error.message}`);
    }
    
    console.log(`Successfully converted ${inputPath} to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error converting file: ${error.message}`);
    throw error;
  }
}

/**
 * Converts all HEIC/HEIF files in a directory to JPG format
 * @param {string} directoryPath - Path to directory containing HEIC files
 * @param {string} outputDirectory - Path for output JPG files (optional)
 * @param {number} quality - JPEG quality (1-100, default: 90)
 * @param {boolean} recursive - Whether to process subdirectories (default: false)
 * @returns {Promise<void>}
 */
async function convertAllHeicInDirectory(directoryPath, outputDirectory = null, quality = 90, recursive = false) {
  try {
    // Validate the input directory exists
    try {
      const stats = await fs.stat(directoryPath);
      if (!stats.isDirectory()) {
        throw new Error(`${directoryPath} is not a directory`);
      }
    } catch (error) {
      throw new Error(`Input directory not found or not accessible: ${directoryPath}`);
    }
    
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
    const files = await fs.readdir(directoryPath, { withFileTypes: true });
    
    // Filter for HEIC files (case insensitive)
    const heicFiles = files.filter(file => 
      !file.isDirectory() && /\.(heic|heif)$/i.test(file.name)
    ).map(file => file.name);
    
    // Process subdirectories if recursive is true
    if (recursive) {
      const subdirectories = files.filter(file => file.isDirectory());
      
      for (const subdir of subdirectories) {
        const subdirPath = path.join(directoryPath, subdir.name);
        const subdirOutputPath = path.join(outputDirectory, subdir.name);
        
        // Process subdirectory recursively
        await convertAllHeicInDirectory(subdirPath, subdirOutputPath, quality, true);
      }
    }
    
    if (heicFiles.length === 0) {
      console.log(`No HEIC files found in ${directoryPath}`);
      return;
    }
    
    console.log(`Found ${heicFiles.length} HEIC files in ${directoryPath}. Starting conversion...`);
    
    // Convert each HEIC file with progress tracking
    let completed = 0;
    let failed = 0;
    
    for (const file of heicFiles) {
      const inputPath = path.join(directoryPath, file);
      const outputFileName = path.basename(file, path.extname(file)) + '.jpg';
      const outputPath = path.join(outputDirectory, outputFileName);
      
      try {
        await convertHeicToJpg(inputPath, outputPath, quality);
        completed++;
        console.log(`Progress: ${completed + failed}/${heicFiles.length} (${Math.round((completed + failed)/heicFiles.length*100)}%)`);
      } catch (error) {
        console.error(`Failed to convert ${file}: ${error.message}`);
        failed++;
        // Continue with other files despite this error
      }
    }
    
    if (failed > 0) {
      console.log(`Conversion completed with issues. Successfully converted: ${completed}/${heicFiles.length} files. Failed: ${failed} files.`);
    } else {
      console.log(`Conversion completed successfully. Converted: ${completed}/${heicFiles.length} files.`);
    }
  } catch (error) {
    console.error(`Error in batch conversion: ${error.message}`);
    throw error;
  }
}

// Simple command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Display help
  if (args.length < 1 || args.includes('--help') || args.includes('-h')) {
    console.log('HEIC to JPG Converter');
    console.log('=====================\n');
    console.log('Usage:');
    console.log('  Single file: node heic-to-jpg-converter.js input.heic [output.jpg] [--quality=90]');
    console.log('  Directory:   node heic-to-jpg-converter.js --dir input_directory [output_directory] [--quality=90] [--recursive]');
    console.log('\nOptions:');
    console.log('  --quality=N    Set JPEG quality (1-100, default: 90)');
    console.log('  --recursive    Process subdirectories (for directory mode)');
    console.log('  --help, -h     Show this help');
    console.log('\nExamples:');
    console.log('  node heic-to-jpg-converter.js photo.heic');
    console.log('  node heic-to-jpg-converter.js --dir ~/Pictures/iPhone --quality=95');
    console.log('  node heic-to-jpg-converter.js --dir ~/Pictures --recursive');
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }
  
  // Parse quality option
  let quality = 90;
  const qualityArg = args.find(arg => arg.startsWith('--quality='));
  if (qualityArg) {
    const qualityValue = parseInt(qualityArg.split('=')[1], 10);
    if (!isNaN(qualityValue) && qualityValue >= 1 && qualityValue <= 100) {
      quality = qualityValue;
      // Remove the quality arg from args to not interfere with path parsing
      args.splice(args.indexOf(qualityArg), 1);
    } else {
      console.error('Invalid quality value. Please use a number between 1 and 100.');
      process.exit(1);
    }
  }
  
  // Parse recursive option
  const recursive = args.includes('--recursive');
  if (recursive) {
    // Remove the recursive arg from args
    args.splice(args.indexOf('--recursive'), 1);
  }
  
  try {
    if (args[0] === '--dir') {
      if (!args[1]) {
        console.error('Error: Input directory is required');
        process.exit(1);
      }
      convertAllHeicInDirectory(args[1], args[2], quality, recursive)
        .catch(error => {
          console.error(`Fatal error: ${error.message}`);
          process.exit(1);
        });
    } else {
      convertHeicToJpg(args[0], args[1], quality)
        .catch(error => {
          console.error(`Fatal error: ${error.message}`);
          process.exit(1);
        });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  convertHeicToJpg,
  convertAllHeicInDirectory
};