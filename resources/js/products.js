import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

function Products() {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        product_code: "",
        product_name: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
    });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [categories, setCategories] = useState([]);

    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async (shouldLoad = true) => {
        if (shouldLoad) setLoading(true);
        try {
            const response = await fetch("/api/products");
            const data = await response.json();
            const productList = data || [];
            setProducts(productList);
            const uniqueCategories = [
                ...new Set(productList.map((p) => p.category).filter(Boolean)),
            ];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        }
        if (shouldLoad) setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const action = editId ? "update" : "add";
        if (!confirm(`Are you sure you want to ${action} this product?`))
            return;

        try {
            if (editId) {
                await fetch(`/api/products/${editId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                alert("Product updated successfully!");
            } else {
                await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                alert("Product added successfully!");
            }

            setFormData({
                product_code: "",
                product_name: "",
                description: "",
                price: "",
                quantity: "",
                category: "",
            });
            setEditId(null);
            fetchProducts(false);
        } catch (error) {
            console.error("Error saving product:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        setLoading(true);
        try {
            await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });
            alert("Product deleted successfully!");
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
        }
        setLoading(false);
    };

    const handleEdit = (product) => {
        setFormData({
            product_code: product.product_code,
            product_name: product.product_name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            category: product.category,
        });
        setEditId(product.id);
    };

    const handleCancel = () => {
        setFormData({
            product_code: "",
            product_name: "",
            description: "",
            price: "",
            quantity: "",
            category: "",
        });
        setEditId(null);
    };

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.product_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesCategory =
            !categoryFilter || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="product-inventory-container">
            <h1 className="page-title">Product Inventory Management</h1>

            <div className="content-wrapper">
                <div className="form-section">
                    <div className="card">
                        <h2>{editId ? "Edit Product" : "Add New Product"}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Product Code </label>
                                    <input
                                        type="text"
                                        name="product_code"
                                        value={formData.product_code}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Product Name *</label>
                                    <input
                                        type="text"
                                        name="product_name"
                                        value={formData.product_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Price (₱) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Quantity *</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="2"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {editId ? "Update" : "Add"}
                                    </button>
                                    {editId && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="table-section">
                    <div className="card">
                        <h2>Product List</h2>
                        <div className="filters">
                            <div className="filter-group">
                                <input
                                    type="text"
                                    placeholder="Search by product name..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="search-input"
                                />
                            </div>
                            <div className="filter-group">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) =>
                                        setCategoryFilter(e.target.value)
                                    }
                                    className="category-filter"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading && <p>Loading...</p>}
                        {products.length === 0 && !loading && (
                            <p>
                                No products available. Add your first product
                                above.
                            </p>
                        )}
                        {products.length > 0 && (
                            <div className="table-wrapper">
                                <table className="product-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Product Code</th>
                                            <th>Product Name</th>
                                            <th>Description</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Category</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map((product) => (
                                            <tr key={product.id}>
                                                <td>{product.id}</td>
                                                <td>{product.product_code}</td>
                                                <td>{product.product_name}</td>
                                                <td>
                                                    {product.description || "-"}
                                                </td>
                                                <td>
                                                    ₱
                                                    {formatPrice(product.price)}
                                                </td>
                                                <td>{product.quantity}</td>
                                                <td>
                                                    {product.category || "-"}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-edit"
                                                        onClick={() =>
                                                            handleEdit(product)
                                                        }
                                                        disabled={loading}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-delete"
                                                        onClick={() =>
                                                            handleDelete(
                                                                product.id
                                                            )
                                                        }
                                                        disabled={loading}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Products;
