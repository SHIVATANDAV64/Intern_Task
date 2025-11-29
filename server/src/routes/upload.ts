import { Router, Request, Response } from 'express';
import { uploadImage, uploadToCloudinary } from '../config/cloudinary';
import { uploadLimiter } from '../middleware/rateLimit';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/upload/image
 * @desc    Upload an image to Cloudinary
 * @access  Private
 */
router.post(
  '/image',
  authenticate,
  uploadLimiter,
  uploadImage.single('image'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No image file provided' });
        return;
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        `formgen/users/${req.userId}`,
        'image'
      );

      res.json({
        message: 'Image uploaded successfully',
        url: result.url,
        publicId: result.publicId,
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  }
);

/**
 * @route   POST /api/upload/public
 * @desc    Upload an image for public form submission (no auth required)
 * @access  Public
 */
router.post(
  '/public',
  uploadLimiter,
  uploadImage.single('image'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No image file provided' });
        return;
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        'formgen/public-submissions',
        'image'
      );

      res.json({
        message: 'Image uploaded successfully',
        url: result.url,
        publicId: result.publicId,
      });
    } catch (error) {
      console.error('Public image upload error:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  }
);

export default router;
