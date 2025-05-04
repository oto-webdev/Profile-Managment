import express from "express"
import { protect } from "../middleware/auth.js"
import { 
    deactivate, 
    deleteAccaunt, 
    login, 
    logout,
    me, 
    signup,
    updateProfile, 
    verifyOtp
} from "../controllers/auth.controller.js"
const router = express.Router()

router.get("/me", protect, me)

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

router.post("/verify-otp", verifyOtp)

router.put("/update-profile", protect, updateProfile)
router.put("/deactivate", protect, deactivate)

router.delete("/delete-account/:id", protect, deleteAccaunt)

export default router;