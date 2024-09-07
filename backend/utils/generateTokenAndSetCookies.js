import jwt from "jsonwebtoken";

export const generateTokenAndSetCookies = (res, userId) => {

    const token = jwt.sign({userId}, process.env.JWT_SECRETE, {
        expiresIn : "7d"
    })

    res.cookie("token", token, {
        httpOnly : true, //xss attack
        secure: process.env.NODE_ENV === "production",
        sameSite : "strict", //csrf
        maxAge : 7 * 24 * 60 * 60 * 1000
    })

    return token;
}