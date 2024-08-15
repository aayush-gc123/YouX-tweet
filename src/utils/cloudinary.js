import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure cloudinary with your credentials directly
cloudinary.config({
  cloud_name: 'dq9z4qd9p',
  api_key: '143566541255323',
  api_secret: 'BMWg7_y6O27pRvPf1Pldokyk_Yw',
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    // Log the response from Cloudinary
    console.log('File is uploaded on Cloudinary:', response.url);

    // Remove the file from the local server after upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Upload to Cloudinary failed');
  }
};

export { uploadToCloudinary };
