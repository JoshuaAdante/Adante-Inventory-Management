import React, { Component } from "react";
import axios from "axios";

class Products extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products: [],
            filteredProducts: [],
            searchTerm: "",
            categoryFilter: "",
            categories: [],
            editingId: null,
            formData: {
                product_code: "",
                product_name: "",
                description: "",
                price: "",
                quantity: "",
                category: "",
            },
            errors: {},
        };
    }

    componentDidMount() {
        this.fetchProducts();
    }

    fetchProducts = async () => {
        try {
            const response = await axios.get("/api/products");
            const products = response.data;
            const categories = [
                ...new Set(products.map((p) => p.category).filter(Boolean)),
            ];

            this.setState({
                products,
                filteredProducts: products,
                categories,
            });
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            formData: {
                ...prevState.formData,
                [name]: value,
            },
            errors: {
                ...prevState.errors,
                [name]: null,
            },
        }));
    };

    handleSearchChange = (e) => {
        const searchTerm = e.target.value;
        this.setState({ searchTerm }, this.filterProducts);
    };

    handleCategoryFilterChange = (e) => {
        const categoryFilter = e.target.value;
        this.setState({ categoryFilter }, this.filterProducts);
    };

    filterProducts = () => {
        const { products, searchTerm, categoryFilter } = this.state;

        let filtered = products.filter((product) => {
            const matchesSearch = product.product_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesCategory =
                !categoryFilter || product.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        this.setState({ filteredProducts: filtered });
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        const { editingId, formData } = this.state;

        try {
            if (editingId) {
                await axios.put(`/api/products/${editingId}`, formData);
            } else {
                await axios.post("/api/products", formData);
            }

            this.resetForm();
            this.fetchProducts();
        } catch (error) {
            if (error.response && error.response.data.errors) {
                this.setState({ errors: error.response.data.errors });
            }
        }
    };

    handleEdit = (product) => {
        this.setState({
            editingId: product.id,
            formData: {
                product_code: product.product_code,
                product_name: product.product_name,
                description: product.description || "",
                price: product.price,
                quantity: product.quantity,
                category: product.category || "",
            },
            errors: {},
        });
    };

    handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`/api/products/${id}`);
                this.fetchProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        }
    };

    handleCancel = () => {
        this.resetForm();
    };

    resetForm = () => {
        this.setState({
            editingId: null,
            formData: {
                product_code: "",
                product_name: "",
                description: "",
                price: "",
                quantity: "",
                category: "",
            },
            errors: {},
        });
    };

    formatPrice = (price) => {
        return (
            "₱" +
            parseFloat(price).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
        );
    };

    render() {
        const {
            filteredProducts,
            searchTerm,
            categoryFilter,
            categories,
            editingId,
            formData,
            errors,
        } = this.state;

        return (
            <div className="product-inventory-container">
                <h1 className="page-title">Product Inventory Management</h1>

                <div className="content-wrapper">
                    <div className="form-section">
                        <div className="card">
                            <h2>
                                {editingId ? "Edit Product" : "Add New Product"}
                            </h2>
                            <form onSubmit={this.handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Product Code *</label>
                                        <input
                                            type="text"
                                            name="product_code"
                                            value={formData.product_code}
                                            onChange={this.handleInputChange}
                                            className={
                                                errors.product_code
                                                    ? "error"
                                                    : ""
                                            }
                                        />
                                        {errors.product_code && (
                                            <span className="error-message">
                                                {errors.product_code[0]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Product Name *</label>
                                        <input
                                            type="text"
                                            name="product_name"
                                            value={formData.product_name}
                                            onChange={this.handleInputChange}
                                            className={
                                                errors.product_name
                                                    ? "error"
                                                    : ""
                                            }
                                        />
                                        {errors.product_name && (
                                            <span className="error-message">
                                                {errors.product_name[0]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Category</label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={formData.category}
                                            onChange={this.handleInputChange}
                                            className={
                                                errors.category ? "error" : ""
                                            }
                                        />
                                        {errors.category && (
                                            <span className="error-message">
                                                {errors.category[0]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Price (₱) *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={this.handleInputChange}
                                            step="0.01"
                                            className={
                                                errors.price ? "error" : ""
                                            }
                                        />
                                        {errors.price && (
                                            <span className="error-message">
                                                {errors.price[0]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Quantity *</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={this.handleInputChange}
                                            className={
                                                errors.quantity ? "error" : ""
                                            }
                                        />
                                        {errors.quantity && (
                                            <span className="error-message">
                                                {errors.quantity[0]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={this.handleInputChange}
                                            rows="2"
                                            className={
                                                errors.description
                                                    ? "error"
                                                    : ""
                                            }
                                        />
                                        {errors.description && (
                                            <span className="error-message">
                                                {errors.description[0]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                        >
                                            {editingId
                                                ? "Update Product"
                                                : "Add Product"}
                                        </button>
                                        {editingId && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={this.handleCancel}
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
                            <div className="filters">
                                <div className="filter-group">
                                    <input
                                        type="text"
                                        placeholder="Search by product name..."
                                        value={searchTerm}
                                        onChange={this.handleSearchChange}
                                        className="search-input"
                                    />
                                </div>
                                <div className="filter-group">
                                    <select
                                        value={categoryFilter}
                                        onChange={
                                            this.handleCategoryFilterChange
                                        }
                                        className="category-filter"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category, index) => (
                                            <option
                                                key={index}
                                                value={category}
                                            >
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

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
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map((product) => (
                                                <tr key={product.id}>
                                                    <td>{product.id}</td>
                                                    <td>
                                                        {product.product_code}
                                                    </td>
                                                    <td>
                                                        {product.product_name}
                                                    </td>
                                                    <td>
                                                        {product.description ||
                                                            "-"}
                                                    </td>
                                                    <td>
                                                        {this.formatPrice(
                                                            product.price
                                                        )}
                                                    </td>
                                                    <td>{product.quantity}</td>
                                                    <td>
                                                        {product.category ||
                                                            "-"}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-edit"
                                                            onClick={() =>
                                                                this.handleEdit(
                                                                    product
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-delete"
                                                            onClick={() =>
                                                                this.handleDelete(
                                                                    product.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="8"
                                                    className="no-data"
                                                >
                                                    No products found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Products;
