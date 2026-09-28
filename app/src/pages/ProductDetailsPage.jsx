import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { fetchProductById, clearProductDetails } from '../tools/productDetailsSlice';
import './ProductDetailsPage.css';

export default function ProductDetailsPage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const product = useSelector(state => state.productDetails.item);
    const status = useSelector(state => state.productDetails.status);
    const error = useSelector(state => state.productDetails.error);

    useEffect(() => {
        dispatch(fetchProductById(id));
        return () => {
            dispatch(clearProductDetails());
        };
    }, [dispatch, id]);

    if (status === 'loading' || status === 'idle') {
        return <main className="product-details-state" role="status">Loading product...</main>;
    }

    if (status === 'failed') {
        return (
            <main className="product-details-state" role="alert">
                <strong>We could not find that product.</strong>
                <span>{error}</span>
                <Link to="/products">Back to products</Link>
            </main>
        );
    }

    return (
        <main className="product-details-page">
            <Link className="product-details-back" to="/products">← Back to products</Link>
            <section className="product-details-panel">
                <div className="product-details-mark" aria-hidden="true">#{String(product.id).padStart(2, '0')}</div>
                <div className="product-details-copy">
                    <p className="product-details-eyebrow">Product details</p>
                    <h1>{product.name}</h1>
                    <p className="product-details-description">
                        {product.description || 'A considered addition to your everyday setup.'}
                    </p>
                    <div className="product-details-purchase">
                        <span className="product-details-price">${Number(product.price || 0).toFixed(2)}</span>
                        <span className="product-details-availability">Available now</span>
                    </div>
                </div>
            </section>
        </main>
    );
}