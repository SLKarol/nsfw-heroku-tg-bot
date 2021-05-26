import { Router } from "express";

import * as filesController from "../controllers/files";
const router = Router();

router.get("/reddit", filesController.getRedditVideo);

export default router;
