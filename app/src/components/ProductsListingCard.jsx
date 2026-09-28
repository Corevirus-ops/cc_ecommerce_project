
import { Link } from 'react-router-dom';

export default function ProductsListingCard({ product, onAdd, adding }) {
    return (
        <article className="product-card">
            <div className="product-card-topline">
                <span className="product-index">#{String(product.id).padStart(2, '0')}</span>
                <span className="product-dot" aria-hidden="true" />
            </div>
            <div className="product-card-body">
                <h2>{product.name}</h2>
                <p>{product.description || 'A considered addition to your everyday setup.'}</p>
            </div>
            <footer className="product-card-footer">
                <span className="product-price">${Number(product.price || 0).toFixed(2)}</span>
                <div className="product-card-actions">
                    <Link to={`/products/${product.id}`}>View details</Link>
                    <button type="button" onClick={onAdd} disabled={adding}>
                        {adding ? 'Adding...' : 'Add to cart'}
                    </button>
                </div>
            </footer>
        </article>
    );
}