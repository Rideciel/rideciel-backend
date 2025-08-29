const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Tarifs simples pour test
const TARIFFS = { berline: 1.2, van: 1.8, electrique: 1.0 };

app.get('/', (req, res) => {
  res.send('Rideciel API is running');
});

// Estimation prix
app.post('/estimate', (req, res) => {
  const { vehicle, distanceKm } = req.body;
  const rate = TARIFFS[vehicle] || 1.5;
  const price = (distanceKm || 10) * rate + 10;
  res.json({ price });
});

// Stripe Checkout
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
app.post('/checkout', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Course Rideciel' },
          unit_amount: Math.round(req.body.amount * 100),
        },
        quantity: 1,
      }],
      success_url: process.env.BASE_FRONTEND_URL + '/success.html',
      cancel_url: process.env.BASE_FRONTEND_URL + '/index.html',
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stripe error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Rideciel API running on port ${PORT}`));
