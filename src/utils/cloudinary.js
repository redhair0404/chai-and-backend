import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


//method to upload the files on cloudinary

const uploadOnCloudinary = async (localfilePath) => {

    try {
    if(!localfilePath) return console.log('No file to upload on cloudinary')

    // Upload a file on cloudinary
    const uploadResponse = await cloudinary.uploader.upload(localfilePath, {
        resource_type: "auto"
    })
    //file has been successfully uploaded

    fs.unlinkSync(localfilePath)  //once the file is uploaded, just delete it or remove it from the server
    // console.log(uploadResponse.url)
    return uploadResponse

    } catch (error) {
        fs.unlinkSync(localfilePath)  // remove the locally saved temporary file as the upload operation got failed
        console.log(`File Upload Unsuccessfull: ${error}`) 
        return null 
    }

}


export {uploadOnCloudinary}