import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDirectory =
  "./public/images";

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage =
  multer.diskStorage({
    destination: function (
      req,
      file,
      cb
    ) {
      cb(
        null,
        uploadDirectory
      );
    },

    filename: function (
      req,
      file,
      cb
    ) {
      const extension =
        path.extname(
          file.originalname
        );

      const baseName =
        path
          .basename(
            file.originalname,
            extension
          )
          .replace(
            /[^a-zA-Z0-9-_]/g,
            "-"
          );

      cb(
        null,
        `${Date.now()}-${baseName}${extension}`
      );
    },
  });

export const upload =
  multer({
    storage,
    limits: {
      fileSize: 1000000,
    },
  });