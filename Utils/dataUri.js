import DataUriParser from "datauri/parser.js";
import path from "path";

const getDataUri = (file) => {
    const parser = new DataUriParser();
    
    if (file && file.originalname) {
        const extName = path.extname(file.originalname).toString();
        return parser.format(extName, file.buffer);
    } else {
        console.error("File or originalname is undefined");
        return null;
    }
}

export default getDataUri;
