import jwt from "jsonwebtoken"

const generateToken = (id, res) => {
    const token = jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: "15m"
    })

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    })

    return token;
}

const generateRefreshToken = (id, res) => {
    const refreshToken = jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie("refresh_jwt", refreshToken, {
        httpOnly: true,  
        secure: process.env.NODE_ENV === "production",  
        sameSite: "strict", 
        maxAge: 7 * 24 * 60 * 60 * 1000  
    });

    return refreshToken;
}

export {
    generateToken,
    generateRefreshToken
}