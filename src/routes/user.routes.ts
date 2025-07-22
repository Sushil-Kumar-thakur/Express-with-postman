import { Router } from 'express';
import { getAllUsers } from '../controllers/user.controller.js'; // 👈 .js again

const router = Router();

router.get('/', getAllUsers);

export default router;
