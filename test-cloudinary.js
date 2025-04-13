const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dxlpwkhxm',
  api_key: '912142586999847',
  api_secret: 'VDwjyQu9MuuyvCh0KUqzY54XofQ'
});

cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/sample.jpg", 
  function(error, result) {
    if (error) {
      console.error("❌ Upload failed:", error.message);
    } else {
      console.log("✅ Upload success:", result.secure_url);
    }
});
