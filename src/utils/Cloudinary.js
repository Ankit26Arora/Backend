import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_KEY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_KEY_PASSWORD
});

const Uploadimage = async (localfilepath) => {
    try {
        if (!localfilepath) return null;
        const upload = await cloudinary.uploader.upload(
            localfilepath,
            {
                resource_type: "auto"
            }
        );
        console.log("Image uploaded to Cloudinary:", upload.url);
        fs.unlinkSync(localfilepath);
        return upload;
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }
        return null;
    }
};

export default Uploadimage;
