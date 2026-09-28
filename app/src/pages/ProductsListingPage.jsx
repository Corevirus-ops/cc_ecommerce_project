import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../tools/productSlice';
import { useEffect, useMemo, useState } from 'react';
import ProductsListingCard from '../components/ProductsListingCard';
import './ProductsListingPage.css';


export default function ProductsListingPage() {
    const dispatch = useDispatch();
    const products = useSelector(state => state.products.items);
    const productStatus = useSelector(state => state.products.status);
    const productError = useSelector(state => state.products.error);
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('featured');

    useEffect(() => {
        if (productStatus === 'idle') {
            dispatch(fetchProducts());
        }
    }, [productStatus, dispatch]);

    const visibleProducts = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const filtered = products.filter(product => {
            return !normalizedQuery ||
                product.name.toLowerCase().includes(normalizedQuery) ||
                product.description?.toLowerCase().includes(normalizedQuery);
        });

        return [...filtered].sort((first, second) => {
            if (sort === 'price-low') return Number(first.price) - Number(second.price);
            if (sort === 'price-high') return Number(second.price) - Number(first.price);
            return first.id - second.id;
        });
    }, [products, query, sort]);

    return (
        <main className="products-page">
            <header className="products-header">
                <div>
                    <p className="eyebrow">The everyday edit</p>
                    <h1>Find your next essential.</h1>
                    <p className="products-intro">Thoughtful tools for focused work, better spaces, and a smoother day.</p>
                </div>
                <div className="catalog-stat">
                    <strong>{products.length}</strong>
                    <span>products<br />available</span>
                </div>
            </header>

            <div className="products-toolbar">
                <label className="search-field">
                    <span className="search-icon" aria-hidden="true">/</span>
                    <span className="sr-only">Search products</span>
                    <input
                        type="search"
                        placeholder="Search the collection"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </label>
                <label className="sort-field">
                    <span>Sort by</span>
                    <select value={sort} onChange={(event) => setSort(event.target.value)}>
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: low to high</option>
                        <option value="price-high">Price: high to low</option>
                    </select>
                </label>
            </div>

            {productStatus === 'loading' && (
                <div className="products-state" role="status">Loading the collection...</div>
            )}
            {productStatus === 'failed' && (
                <div className="products-state products-state-error">
                    <strong>We could not load the collection.</strong>
                    <span>{productError}</span>
                    <button type="button" onClick={() => dispatch(fetchProducts())}>Try again</button>
                </div>
            )}
            {productStatus === 'succeeded' && (
                visibleProducts.length > 0 ? (
                    <ul className="products-grid">
                        {visibleProducts.map(product => (
                            <li key={product.id}>
                            <ProductsListingCard product={product} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="products-state">
                        <strong>No products found.</strong>
                        <span>Try a different search term.</span>
                    </div>
                )
            )}
        </main>
    );

}