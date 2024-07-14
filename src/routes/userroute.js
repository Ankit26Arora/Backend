import { Router } from "express";
import { registerUser } from "../controller/usercontroller.js";
import {upload} from '../midleware/multermidleware.js'
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )


    export default router
