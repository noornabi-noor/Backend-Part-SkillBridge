import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { paymentServices } from "./payment.services";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { envVars } from "../../config/env.config";
import { stripe } from "../../config/stripe.config";

const handleStripeWebhookEvent = catchAsync(async (req : Request, res : Response) => {
    const signature = req.headers['stripe-signature'] as string
    const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;

    if(!signature || !webhookSecret){
        console.error("Missing Stripe signature or webhook secret");
        return res.status(status.BAD_REQUEST).json({message : "Missing Stripe signature or webhook secret"})
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error : any) {
        console.error("Error processing Stripe webhook:", error);
        return res.status(status.BAD_REQUEST).json({message : "Error processing Stripe webhook"})
    }

    try {
        const result = await paymentServices.handlerStripeWebhookEvent(event);

        sendResponse(res, {
            httpStatusCode : status.OK,
            success : true,
            message : "Stripe webhook event processed successfully",
            data : result
        })
    } catch (error) {
        console.error("Error handling Stripe webhook event:", error);
        sendResponse(res, {
            httpStatusCode : status.INTERNAL_SERVER_ERROR,
            success : false,
            message : "Error handling Stripe webhook event"
        })
    }
})

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const result = await paymentServices.initiatePayment(bookingId as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Payment initiated successfully",
        data: result,
    });
});

export const paymentController = {
    handleStripeWebhookEvent,
    initiatePayment
}