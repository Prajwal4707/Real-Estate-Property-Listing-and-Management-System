import express from 'express';
import { submitForm, getAllForms, deleteForm } from '../controller/formcontroller.js';

const router = express.Router();

router.post('/submit', submitForm);
router.get('/all', getAllForms);
router.delete('/:id', deleteForm);

export default router;