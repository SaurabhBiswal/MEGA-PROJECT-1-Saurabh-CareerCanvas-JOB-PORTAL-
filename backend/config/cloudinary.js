import { v2 as cloudinary } from 'cloudinary'

const connectCloudinary = async () => {
    // Yahan variables ke naam wahi hone chahiye jo .env file mein hain
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLIENT_NAME, 
        api_key: process.env.CLOUDINARY_CLIENT_API, 
        api_secret: process.env.CLOUDINARY_CLIENT_SECRET, 
    });
    console.log("Cloudinary Configured"); // Check karne ke liye
}

export default connectCloudinary