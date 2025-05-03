import express from "express"
import { protect } from "../middleware/auth.js"
const router = express.Router()

router.get("/me", protect, )

router.post("/signup", )
router.post("/login", )
router.post("/logout", )
router.post("/forgot-password", )
router.post("/reset-password", protect, )

router.post("/verify-otp", )

router.put("/deactivate", protect, )

router.delete("/delete-account/:id", protect, )

export default router;