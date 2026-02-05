import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TABBY_SECRET_KEY = process.env.TABBY_SECRET_KEY;
const MERCHANT_CODE = process.env.TABBY_MERCHANT_CODE || "default";

// Create payment
app.post("/create-payment", async (req, res) => {
  try {
    const { amount, phone, order_id } = req.body;

    const response = await fetch("https://api.tabby.ai/api/v2/checkout", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TABBY_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        merchant_code: MERCHANT_CODE,
        payment: {
          amount,
          currency: "AED",
          buyer: { phone },
          order: {
            reference_id: order_id,
            items: [
              {
                title: "Service Payment",
                quantity: 1,
                unit_price: amount,
                category: "Services"
              }
            ]
          }
        }
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Send SMS payment link
app.post("/send-link/:session_id", async (req, res) => {
  try {
    const { session_id } = req.params;

    const response = await fetch(
      `https://api.tabby.ai/api/v2/checkout/${session_id}/send_hpp_link`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${TABBY_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Webhook
app.post("/tabby-webhook", (req, res) => {
  console.log("Tabby webhook:", req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
