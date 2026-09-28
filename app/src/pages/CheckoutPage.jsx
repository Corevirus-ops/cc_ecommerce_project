import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { checkout, syncCart } from '../tools/cartSlice';
import url from '../tools/url';
import './CheckoutPage.css';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

async function getPaymentIntent() {
	const response = await fetch(`${url}/payments/create-intent`, {
		method: 'POST',
		credentials: 'include'
	});
	const data = await response.json();
	if (!response.ok) throw new Error(data.message || 'Unable to prepare payment');
	return data;
}

function PaymentForm({ amount }) {
	const stripe = useStripe();
	const elements = useElements();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [message, setMessage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!stripe || !elements) return;

		setIsSubmitting(true);
		setMessage('');
		const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });

		if (error) {
			setMessage(error.message || 'Payment could not be completed.');
			setIsSubmitting(false);
			return;
		}

		if (paymentIntent?.status !== 'succeeded') {
			setMessage('Payment needs another step before the order can be placed.');
			setIsSubmitting(false);
			return;
		}

		const result = await dispatch(checkout());
		if (checkout.fulfilled.match(result)) {
			navigate('/checkout/success');
			return;
		}

		setMessage(result.error?.message || 'Payment succeeded, but the order could not be created. Contact support.');
		setIsSubmitting(false);
	};

	return (
		<form className="checkout-form" onSubmit={handleSubmit}>
			<PaymentElement />
			{message && <p className="checkout-error" role="alert">{message}</p>}
			<button className="checkout-submit" type="submit" disabled={!stripe || !elements || isSubmitting}>
				{isSubmitting ? 'Forging your order...' : `Pay $${(amount / 100).toFixed(2)}`}
			</button>
		</form>
	);
}

export default function CheckoutPage({ success = false }) {
	const dispatch = useDispatch();
	const user = useSelector(state => state.auth.user);
	const cartItems = useSelector(state => state.cart.items);
	const cartStatus = useSelector(state => state.cart.status);
	const pendingChanges = useSelector(state => state.cart.pendingChanges);
	const [clientSecret, setClientSecret] = useState('');
	const [amount, setAmount] = useState(0);
	const [error, setError] = useState('');
	const [isPreparing, setIsPreparing] = useState(false);

	useEffect(() => {
		if (!user || success || cartStatus !== 'succeeded' || cartItems.length === 0 || clientSecret) return;
		if (!publishableKey) return;

		const preparePayment = async () => {
			setIsPreparing(true);
			try {
				if (Object.keys(pendingChanges).length > 0) await dispatch(syncCart()).unwrap();
				const payment = await getPaymentIntent();
				setClientSecret(payment.clientSecret);
				setAmount(payment.amount);
			} catch (prepareError) {
				setError(prepareError.message || 'Unable to prepare checkout');
			} finally {
				setIsPreparing(false);
			}
		};

		preparePayment();
	}, [cartItems.length, cartStatus, clientSecret, dispatch, pendingChanges, success, user]);

	if (!user) {
		return <main className="checkout-page checkout-state"><p className="checkout-eyebrow">The final mile</p><h1>Sign in to check out.</h1><Link to="/login">Return to sign in</Link></main>;
	}

	if (success) {
		return <main className="checkout-page checkout-state"><p className="checkout-eyebrow">Order complete</p><h1>Your order is bound for the road.</h1><p>Payment confirmed. Thank you for choosing with intent.</p><Link className="checkout-link-button" to="/products">Return to the collection</Link></main>;
	}

	if (cartStatus === 'loading' || isPreparing) {
		return <main className="checkout-page checkout-state" role="status">Preparing your secure checkout...</main>;
	}

	if (cartItems.length === 0 || cartStatus !== 'succeeded') {
		return <main className="checkout-page checkout-state"><p className="checkout-eyebrow">The final mile</p><h1>Nothing to check out yet.</h1><Link to="/products">Browse the collection</Link></main>;
	}

	return (
		<main className="checkout-page">
			<header className="checkout-header">
				<div><p className="checkout-eyebrow">The final mile</p><h1>Secure checkout.</h1><p>Payment is encrypted and handled by Stripe.</p></div>
				<Link className="checkout-back-link" to="/cart">Back to cart</Link>
			</header>
			{error ? <div className="checkout-error checkout-prep-error" role="alert">{error}</div> : clientSecret && stripePromise ? (
				<section className="checkout-panel">
					<div className="checkout-panel-heading"><span>Card details</span><span className="checkout-lock">SECURE / STRIPE</span></div>
					<Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'flat' } }}><PaymentForm amount={amount} /></Elements>
				</section>
			) : <div className="checkout-error checkout-prep-error" role="alert">{publishableKey ? 'Unable to initialize secure payment.' : 'Add VITE_STRIPE_PUBLISHABLE_KEY to app/.env.local to enable Stripe.'}</div>}
		</main>
	);
}

