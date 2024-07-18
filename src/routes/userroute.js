import { Router } from "express";
import { loginuser,  logout,  refreshacesstoken,  registerUser } from "../controller/usercontroller.js";
import {upload} from '../midleware/multermidleware.js'
import { verifyJWT } from "../midleware/authmidleware.js";
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

   router.route("/login").post(loginuser)

   router.route("/logout").post( verifyJWT,logout)

   router.route("refresh-token").post(refreshacesstoken)

    export default router
