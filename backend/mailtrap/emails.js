import { mailtrapClient, sender } from "./mailtrap.config.js";
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplates.js";
export const sendVerificationEmail = async(email, verificationToken) => {
    const recipient = [{email}];

    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })
        console.log("verification email was sent successfully: ", response);
    }catch(error){
        console.log("Error sending verification email: ", error.message);
        throw new Error(`Error sending verification email: ${error}`);
    }
    
}

export const sendWelcomeEmail = async(email, name) => {
    const recipient = [{email}]

    try{
        const response =await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "1c66061a-01de-4549-944d-ee2042296605",
            template_variables: {
                company_info_name: "Auth Company",
                name: name
            }
        })

        console.log("Welcome email was sent successfully", response);


    }catch(error){
        console.log("Error sending welcome email: ", error.message);
        throw new Error(`Error sending welcome email: ${error}`);
    }
}


export const sendResetPasswordEmail = async(email, resetURL) => {

    const recipient = [{email}];
    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset"
        })

        console.log("Password reset email was sent successfully: ", response);

    }catch(error){
        console.log("Error sending reset password email: ", error.message);
        throw new Error(`Error sending reset password email: ${error}`);
    }

    
}

export const sendResetSuccessEmail = async (email) => {
    const recipient = [ {email} ]
    try{

        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Reset Successfuly",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset"
        })

        console.log("Password reset successfully", response)

    }catch(error){
        console.log("Error sending password reset email ", error)

        throw new Error("Error sending password reset email: ", error.message)

    }
}