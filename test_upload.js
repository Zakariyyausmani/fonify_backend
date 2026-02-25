const cloudinary = require('./src/config/cloudinary');

async function testUpload() {
  console.log('Testing Cloudinary upload...');
  try {
    const result = await cloudinary.uploader.upload('https://res.cloudinary.com/demo/image/upload/sample.jpg', {
      folder: 'fonify_test'
    });
    console.log('Upload successful!');
    console.log('URL:', result.secure_url);
    process.exit(0);
  } catch (error) {
    console.error('Upload failed:');
    console.error(error);
    process.exit(1);
  }
}

testUpload();
