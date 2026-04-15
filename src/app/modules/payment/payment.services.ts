import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env.config";
import AppError from "../../errorHelpers/appError";
import status from "http-status";
import { PaymentStatus } from "../../../../generated/prisma/enums";

const initiatePayment = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tutor: {
        include: {
          user: true,
        },
      },
      student: true,
    },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  const amount = booking.tutor.pricePerHour; // Assuming 1 hour for now, or calculate based on duration
  const currency = "bdt";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: currency,
          product_data: {
            name: `Tutoring Session with ${booking.tutor.user.name}`,
            description: `Session from ${booking.scheduledStart.toLocaleString()} to ${booking.scheduledEnd.toLocaleString()}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${envVars.APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.APP_URL}/payment/cancel`,
    metadata: {
      bookingId: booking.id,
      userId: booking.studentId,
      tutorId: booking.tutorId,
    },
  });

  // Create payment record in PENDING status
  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: {
      stripeSessionId: session.id,
      amount: amount,
      currency: currency,
      status: PaymentStatus.PENDING,
    },
    create: {
      bookingId: booking.id,
      userId: booking.studentId,
      tutorId: booking.tutorId,
      amount: amount,
      currency: currency,
      stripeSessionId: session.id,
      status: PaymentStatus.PENDING,
    },
  });

  return { checkoutUrl: session.url };
};

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        console.error("Missing bookingId in session metadata");
        return { message: "Missing bookingId in session metadata" };
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        console.error(`Booking with id ${bookingId} not found`);
        return { message: `Booking with id ${bookingId} not found` };
      }

      await prisma.$transaction(async (tx) => {
        // Update booking payment status
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: session.payment_status === "paid" ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
          },
        });

        // Update payment record
        await tx.payment.update({
          where: { bookingId: bookingId },
          data: {
            stripePaymentIntent: session.payment_intent as string,
            status: session.payment_status === "paid" ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
          },
        });
      });

      console.log(`Processed checkout.session.completed for booking ${bookingId}`);
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await prisma.payment.update({
          where: { bookingId },
          data: { status: PaymentStatus.FAILED },
        });
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntent: intent.id },
      });
      if (payment) {
        await prisma.$transaction([
            prisma.payment.update({
                where: { id: payment.id },
                data: { status: PaymentStatus.FAILED },
            }),
            prisma.booking.update({
                where: { id: payment.bookingId },
                data: { paymentStatus: PaymentStatus.FAILED },
            })
        ]);
      }
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { message: `Webhook Event ${event.id} processed successfully` };
};

export const paymentServices = {
  initiatePayment,
  handlerStripeWebhookEvent,
};