// src/pages/PlansPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const PlansPage = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/payment/plans`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res.data);
        setPlans(res.data?.plans || []);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [BASE_URL]);

  const handleBuy = async (planId, amount) => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        "http://localhost:5002/payment/create-order",
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId: order_id, amount: orderAmount, currency } = data;
      console.log("Data:", data);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency,
        name: "MailFlow",
        description: "Plan Purchase",
        order_id: data.orderId,
        handler: async function (response) {
          try {
            await axios.post(
              "http://localhost:5002/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Payment Successful 🎉");
          } catch (err) {
            alert("Payment verification failed ❌");
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error during payment:", err);
      alert("Payment failed ❌");
    }
  };

  if (loading) return <p className="text-center p-4">Loading Plans...</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Choose Your Plan</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center"
          >
            <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
            <p className="text-gray-600 mb-2">{plan.description}</p>
            <p className="text-lg font-bold mb-4">₹{plan.price}</p>
            <p className="text-sm text-gray-500 mb-4">
              Credits: {plan.credits} emails
            </p>
            <button
              onClick={() => handleBuy(plan._id, plan.price)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansPage;
