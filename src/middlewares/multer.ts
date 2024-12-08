import multer from "multer";

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    if(allowedMimeTypes.includes(file.mimetype)){
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = "./uploads";
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        const timeStamp = Date.now();
        const sanitizedFileName = file.originalname.replace(/\s/g,"-");
        cb(null, `${timeStamp}-${sanitizedFileName}`);
    }
})

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
});

export const avatar = upload.single("avatar");

export const attachments = upload.array("files", 5);