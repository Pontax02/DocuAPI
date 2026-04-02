import sharp from 'sharp';

export const getImageMetadata = async (filePath) => {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    return metadata
};


export const validateImage = async (filePath, minResolution) => {
    const errors = [];

    let metadata;
    try {
        metadata = await getImageMetadata(filePath);
    } catch  {
        return { errors: ["corrupted_file"], metadata: null };
    }   
    

    if (metadata.width < minResolution || metadata.height < minResolution) {
        errors.push("resolution_too_low");
    }

    // Detect image completely black or white

    const stats = await sharp(filePath).stats();
    const channels = stats.channels;
    const isBlank = channels.every(ch => ch.std < 5);
    if (isBlank) errors.push("blank_or_black_image");


    return { errors, metadata: { width: metadata.width, height: metadata.height , format: metadata.format } };
}