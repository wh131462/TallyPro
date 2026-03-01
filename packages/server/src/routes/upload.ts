/**
 * File Upload Route
 * POST /api/upload  - Upload a single image file
 */
import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authRequired } from '../middlewares/auth';
import { success, fail } from '../utils/response';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
    if (allowed.test(path.extname(file.originalname)) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('仅支持上传图片文件'));
    }
  },
});

const router = Router();

router.use(authRequired);

/**
 * POST /api/upload
 * Upload a single image, returns the URL
 */
router.post('/', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json(fail('请选择要上传的图片'));
    return;
  }

  const url = `/uploads/${req.file.filename}`;
  res.json(success({ url }));
});

export default router;
