const express = require("express");
const Stripe = require("stripe");
const {Order} = require('../4-Models/sales');

require("dotenv").config();

// const stripe = Stripe(process.env.STRIPE_KEY);
const router = express.Router();
const stripe = require('stripe')("sk_test_51Prp1mP6sejyhIpTVFWIKYShBfILrpeg85uRUKPTVab3nTaLdQwcpkuvgRvGkV5OVwRIv12l2iG6Sv1u8TuvqAGQ00NVzAWS3k");

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { cartItems, userId } = req.body;

    // Prepare metadata and line items
    let metaDatas = {};
    const itemsList = cartItems.map((item, index) => {
      metaDatas[`cartItem_${index}`] = JSON.stringify(item);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.productName,
            description: "Buy Products",
            metadata: {
              id: item._id,
            },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.cartQuantity,
      };
    });

    const customer = await stripe.customers.create({
      metadata: {
        userId,
        ...metaDatas,
      },
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: itemsList,
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: userId,
      success_url: `${process.env.CLIENT_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      shipping_address_collection: {
        allowed_countries: ["US", "GB"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "usd",
            },
            display_name: "Free shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
      ],
      metadata: metaDatas,
    });

    // Respond with the session URL
    res.status(201).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});


// Create order function

const createOrder = async (customer, data) => {
  const Items = JSON.parse(customer.metadata.cart);

  const products = Items.map((item) => {
    return {
      productId: item._id,
      quantity: item.cartQuantity,
    };
  });

  const newOrder = new Order({
    userId: customer.metadata.userId,
    customerId: data.customer,
    paymentIntentId: data.payment_intent,
    products,
    subtotal: data.amount_subtotal,
    total: data.amount_total,
    shipping: data.customer_details,
    payment_status: data.payment_status,
  });

  try {
    const savedOrder = await newOrder.save();
    console.log("Processed Order:", savedOrder);
  } catch (err) {
    console.log(err);
  }
};

// Stripe webhoook

router.post(
  "/webhook",
  express.json({ type: "application/json" }),
  async (req, res) => {
    let data;
    let eventType;
    // Check if webhook signing is configured.
    let webhookSecret;
    // webhookSecret = process.env.STRIPE_WEB_HOOK;

    if (webhookSecret) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      let signature = req.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed:  ${err}`);
        return res.sendStatus(400);
      }
      // Extract the object from the event.
      data = event.data.object;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = req.body.data.object;
      eventType = req.body.type;
    }

    // Handle the checkout.session.completed event
    if (eventType === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then(async (customer) => {
          try {
            // CREATE ORDER
            createOrder(customer, data);
          } catch (err) {
            console.log(typeof createOrder);
            console.log(err);
          }
        })
        .catch((err) => console.log(err.message));
    }

    res.status(200).end();
  }
);

module.exports = router;