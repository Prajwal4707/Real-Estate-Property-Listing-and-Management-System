import React from "react";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/stripe-js";
import { motion } from "framer-motion";

const PaymentForm = ({
  clientSecret,
  onSuccess,
  onError,
  amount,
  propertyTitle,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      }
    );

    if (error) {
      onError(error.message);
    } else if (paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Payment Summary
        </h3>
        <p className="text-gray-600">Property: {propertyTitle}</p>
        <p className="text-gray-600">Token Amount: ₹{amount}</p>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        Pay ₹{amount}
      </button>
    </form>
  );
};

const StripePaymentForm = ({
  clientSecret,
  onSuccess,
  onError,
  amount,
  propertyTitle,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <Elements stripe={stripePromise}>
        <PaymentForm
          clientSecret={clientSecret}
          onSuccess={onSuccess}
          onError={onError}
          amount={amount}
          propertyTitle={propertyTitle}
        />
      </Elements>
    </motion.div>
  );
};

export default StripePaymentForm;
