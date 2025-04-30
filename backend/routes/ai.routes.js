import { Router } from "express";
import * as aiContoller  from "../controllers/ai.controller.js";
const router = Router();


router.get("/get-result", aiContoller.getResult);

export default router;