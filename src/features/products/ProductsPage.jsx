import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { money } from "../../components/Formatters";
import { StatusBadge } from "../../components/StatusBadge";
import { ResponsiveSelect } from "../../components/ResponsiveSelect";
import { deactivateProduct, deleteProduct, fetchProducts, saveProduct } from "./productsSlice";

const emptyProduct = {
  id: "",
  name: "",
  category: "",
  description: "",
  image_url: "",
  image_urls: [""],
  price: "",
  stock: 0,
  rating: 4,
  is_active: true,
};

const productStatusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const stockOptions = [
  { label: "All stock", value: "all" },
  { label: "In stock", value: "in-stock" },
  { label: "Low stock", value: "low-stock" },
  { label: "Out of stock", value: "out-of-stock" },
];

const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Name A-Z", value: "name" },
  { label: "Price low-high", value: "price-asc" },
  { label: "Price high-low", value: "price-desc" },
  { label: "Stock low-high", value: "stock-asc" },
];

const initialFilters = {
  search: "",
  category: "all",
  status: "all",
  stock: "all",
  sort: "newest",
};

function normalizeDraft(product) {
  const imageUrls = Array.isArray(product.image_urls) && product.image_urls.length
    ? product.image_urls
    : product.image_url
      ? [product.image_url]
      : [""];

  return {
    ...emptyProduct,
    ...product,
    image_url: imageUrls[0] || product.image_url || "",
    image_urls: imageUrls,
  };
}

export function ProductsPage() {
  const dispatch = useDispatch();
  const { items, status, saving, error } = useSelector((state) => state.products);
  const [draft, setDraft] = useState(emptyProduct);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [imageUploadError, setImageUploadError] = useState("");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const categories = useMemo(() => {
    return [...new Set(items.map((product) => product.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filteredItems = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return items
      .filter((product) => {
        const stock = Number(product.stock || 0);
        const matchesSearch =
          !search ||
          [product.name, product.category, product.description]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(search));
        const matchesCategory = filters.category === "all" || product.category === filters.category;
        const matchesStatus =
          filters.status === "all" ||
          (filters.status === "active" && product.is_active) ||
          (filters.status === "inactive" && !product.is_active);
        const matchesStock =
          filters.stock === "all" ||
          (filters.stock === "in-stock" && stock > 10) ||
          (filters.stock === "low-stock" && stock > 0 && stock <= 10) ||
          (filters.stock === "out-of-stock" && stock === 0);

        return matchesSearch && matchesCategory && matchesStatus && matchesStock;
      })
      .sort((a, b) => {
        if (filters.sort === "name") return a.name.localeCompare(b.name);
        if (filters.sort === "price-asc") return Number(a.price || 0) - Number(b.price || 0);
        if (filters.sort === "price-desc") return Number(b.price || 0) - Number(a.price || 0);
        if (filters.sort === "stock-asc") return Number(a.stock || 0) - Number(b.stock || 0);
        return Number(b.id || 0) - Number(a.id || 0);
      });
  }, [filters, items]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setDraft((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function openAddModal() {
    setDraft(emptyProduct);
    setIsModalOpen(true);
  }

  function openEditModal(product) {
    setDraft(normalizeDraft(product));
    setIsModalOpen(true);
  }

  function closeProductModal() {
    setDraft(emptyProduct);
    setImageUploadError("");
    setIsModalOpen(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const imageUrls = draft.image_urls.map((url) => url.trim()).filter(Boolean);
    dispatch(
      saveProduct({
        ...draft,
        image_url: imageUrls[0] || "",
        image_urls: imageUrls,
        price: Number(draft.price),
        stock: Number(draft.stock),
        rating: Number(draft.rating),
      })
    ).then((result) => {
      if (!result.error) closeProductModal();
    });
  }

  function updateImageUrl(index, value) {
    setDraft((current) => {
      const imageUrls = [...current.image_urls];
      imageUrls[index] = value;
      return {
        ...current,
        image_url: imageUrls[0] || "",
        image_urls: imageUrls,
      };
    });
  }

  function addImageField() {
    setDraft((current) => ({
      ...current,
      image_urls: [...current.image_urls, ""],
    }));
  }

  function removeImageField(index) {
    setDraft((current) => {
      const imageUrls = current.image_urls.filter((_, currentIndex) => currentIndex !== index);
      const nextImages = imageUrls.length ? imageUrls : [""];
      return {
        ...current,
        image_url: nextImages[0] || "",
        image_urls: nextImages,
      };
    });
  }

  function handleImageUpload(event) {
    const files = Array.from(event.target.files || []);
    setImageUploadError("");

    const validFiles = files.filter((file) => ["image/jpeg", "image/png"].includes(file.type));
    if (validFiles.length !== files.length) {
      setImageUploadError("Only JPEG and PNG images can be uploaded.");
    }

    if (!validFiles.length) {
      event.target.value = "";
      return;
    }

    Promise.all(
      validFiles.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Could not read image file."));
            reader.readAsDataURL(file);
          })
      )
    )
      .then((uploadedImages) => {
        setDraft((current) => {
          const existingImages = current.image_urls.map((url) => url.trim()).filter(Boolean);
          const imageUrls = [...existingImages, ...uploadedImages];
          return {
            ...current,
            image_url: imageUrls[0] || "",
            image_urls: imageUrls.length ? imageUrls : [""],
          };
        });
      })
      .catch((uploadError) => setImageUploadError(uploadError.message));

    event.target.value = "";
  }

  const previewImages = draft.image_urls.map((url) => url.trim()).filter(Boolean);
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => value !== initialFilters[key]);

  function requestDeactivate(product) {
    setConfirmAction({
      title: "Deactivate product?",
      message: `${product.name} will be hidden from the customer catalog but kept for admin history.`,
      confirmLabel: "Deactivate",
      tone: "default",
      action: () => dispatch(deactivateProduct(product.id)).then(() => setDetailProduct(null)),
    });
  }

  function requestDelete(product) {
    setConfirmAction({
      title: "Delete product permanently?",
      message: `${product.name} will be permanently removed if it has no order history. This action cannot be undone.`,
      confirmLabel: "Delete Product",
      tone: "danger",
      action: () => dispatch(deleteProduct(product.id)).then(() => setDetailProduct(null)),
    });
  }

  function confirmSelectedAction() {
    confirmAction.action();
    setConfirmAction(null);
  }

  return (
    <div className="grid gap-2">
      <section className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Catalog Management</p>
          <h3 className="text-xl font-extrabold tracking-normal">Products</h3>
        </div>
        <button className="btn-primary" onClick={openAddModal} type="button">
          Add Product
        </button>
      </section>

      {error ? <p className="font-bold text-red-700">{error}</p> : null}
      {status === "loading" && !items.length ? <p className="font-bold text-muted">Loading products...</p> : null}

      <section className="panel grid gap-1  p-5 mb-1">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
          <label className="label">
            Search
            <input
              className="field"
              name="search"
              onChange={handleFilterChange}
              placeholder="Name, category, description"
              value={filters.search}
            />
          </label>
          <label className="label">
            Category
            <ResponsiveSelect name="category" onChange={handleFilterChange} value={filters.category} options={[{ label: "All categories", value: "all" }, ...categories.map((category) => ({ label: category, value: category }))]} />
          </label>
          <label className="label">
            Status
            <ResponsiveSelect name="status" onChange={handleFilterChange} options={productStatusOptions} value={filters.status} />
          </label>
          <label className="label">
            Stock
            <ResponsiveSelect name="stock" onChange={handleFilterChange} options={stockOptions} value={filters.stock} />
          </label>
          <label className="label">
            Sort
            <ResponsiveSelect name="sort" onChange={handleFilterChange} options={sortOptions} value={filters.sort} />
          </label>
          <button
            className="btn-ghost self-end"
            disabled={!hasActiveFilters}
            onClick={() => setFilters(initialFilters)}
            type="button"
          >
            Reset
          </button>
        </div>
        <p className="text-sm font-bold text-muted">
          Showing {filteredItems.length} of {items.length} products
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((product) => (
          <article className="panel min-w-0 overflow-hidden" key={product.id}>
            <img className="aspect-[16/10] w-full bg-slate-200 object-cover" src={product.image_urls?.[0] || product.image_url} alt={product.name} />
            <div className="grid gap-3 p-4">
              <div className="min-w-0">
                <h3 className="break-words text-lg font-extrabold tracking-normal">{product.name}</h3>
                <p className="break-words text-sm font-bold text-muted">
                  {product.category || "Uncategorized"} / {money(product.price)} / {product.stock || 0} in stock
                </p>
              </div>
              <StatusBadge tone={product.is_active ? "default" : "danger"}>
                {product.is_active ? "Active" : "Inactive"}
              </StatusBadge>
              <div className="flex flex-wrap gap-2">
                <button className="btn-ghost" onClick={() => setDetailProduct(product)} type="button">
                  Details
                </button>
                <button className="btn-ghost" onClick={() => openEditModal(product)} type="button">
                  Edit
                </button>
                <button className="btn-ghost" onClick={() => requestDeactivate(product)} type="button">
                  Deactivate
                </button>
                <button className="btn bg-red-700 text-white hover:bg-red-800" onClick={() => requestDelete(product)} type="button">
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
      {!filteredItems.length && status !== "loading" ? (
        <section className="panel p-6 text-center font-bold text-muted">No products match the selected filters.</section>
      ) : null}

      {detailProduct ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
          <section className="panel max-h-[92vh] w-full max-w-5xl overflow-hidden shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div>
                <p className="eyebrow">Product Detail</p>
                <h3 className="text-2xl font-extrabold tracking-normal">{detailProduct.name}</h3>
              </div>
              <button className="btn-ghost" onClick={() => setDetailProduct(null)} type="button">
                Close
              </button>
            </header>
            <div className="grid max-h-[calc(92vh-88px)] gap-5 overflow-y-auto p-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-3">
                <img
                  className="aspect-[16/10] w-full rounded-lg border border-line bg-slate-100 object-cover"
                  src={detailProduct.image_urls?.[0] || detailProduct.image_url}
                  alt={detailProduct.name}
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  {(detailProduct.image_urls?.length ? detailProduct.image_urls : [detailProduct.image_url]).map((url, index) => (
                    <img
                      className="aspect-[4/3] rounded-lg border border-line bg-slate-100 object-cover"
                      src={url}
                      alt={`${detailProduct.name} ${index + 1}`}
                      key={`${url}-${index}`}
                    />
                  ))}
                </div>
              </div>
              <aside className="grid content-start gap-4">
                <StatusBadge tone={detailProduct.is_active ? "default" : "danger"}>
                  {detailProduct.is_active ? "Active" : "Inactive"}
                </StatusBadge>
                <div className="grid gap-3 rounded-lg border border-line p-4">
                  <div className="flex justify-between gap-4">
                    <span className="font-bold text-muted">Category</span>
                    <span className="font-extrabold">{detailProduct.category || "Uncategorized"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-bold text-muted">Price</span>
                    <span className="font-extrabold">{money(detailProduct.price)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-bold text-muted">Stock</span>
                    <span className="font-extrabold">{detailProduct.stock || 0}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-bold text-muted">Rating</span>
                    <span className="font-extrabold">{detailProduct.rating}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-bold text-muted">Images</span>
                    <span className="font-extrabold">{detailProduct.image_urls?.length || 1}</span>
                  </div>
                </div>
                <p className="rounded-lg border border-line p-4 text-sm font-semibold leading-6 text-muted">
                  {detailProduct.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-primary" onClick={() => { setDetailProduct(null); openEditModal(detailProduct); }} type="button">
                    Edit Product
                  </button>
                  <button className="btn-ghost" onClick={() => requestDeactivate(detailProduct)} type="button">
                    Deactivate
                  </button>
                  <button className="btn bg-red-700 text-white hover:bg-red-800" onClick={() => requestDelete(detailProduct)} type="button">
                    Delete
                  </button>
                </div>
              </aside>
            </div>
          </section>
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
          <section className="panel max-h-[92vh] w-full max-w-4xl overflow-hidden shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div>
                <p className="eyebrow">{draft.id ? "Edit Product" : "New Product"}</p>
                <h3 className="text-2xl font-extrabold tracking-normal">
                  {draft.id ? draft.name : "Add Product"}
                </h3>
              </div>
              <button className="btn-ghost" onClick={closeProductModal} type="button">
                Close
              </button>
            </header>

            <form className="grid max-h-[calc(92vh-88px)] gap-5 overflow-y-auto p-5" onSubmit={handleSubmit}>
              <input name="id" type="hidden" value={draft.id} />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="label md:col-span-2">
                  Name
                  <input className="field" name="name" value={draft.name} onChange={handleChange} required />
                </label>
                <label className="label">
                  Category
                  <input className="field" name="category" value={draft.category || ""} onChange={handleChange} />
                </label>
                <label className="label">
                  Price
                  <input className="field" min="0" name="price" step="0.01" type="number" value={draft.price} onChange={handleChange} required />
                </label>
                <label className="label">
                  Stock
                  <input className="field" min="0" name="stock" step="1" type="number" value={draft.stock} onChange={handleChange} />
                </label>
                <label className="label">
                  Rating
                  <input className="field" max="5" min="0" name="rating" step="0.1" type="number" value={draft.rating} onChange={handleChange} />
                </label>
                <label className="label md:col-span-2 xl:col-span-4">
                  Description
                  <textarea className="field" name="description" rows="4" value={draft.description} onChange={handleChange} required />
                </label>
              </div>

              <section className="grid gap-3 rounded-lg border border-line bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-extrabold tracking-normal">Product Images</h4>
                    <p className="text-sm font-semibold text-muted">The first image is used as the primary catalog image.</p>
                  </div>
                  <button className="btn-ghost" onClick={addImageField} type="button">
                    Add URL
                  </button>
                </div>

                <label className="label rounded-lg border border-dashed border-line bg-white p-4">
                  Upload JPEG or PNG
                  <input
                    accept="image/jpeg,image/png"
                    className="field bg-white"
                    multiple
                    onChange={handleImageUpload}
                    type="file"
                  />
                </label>
                {imageUploadError ? <p className="text-sm font-bold text-red-700">{imageUploadError}</p> : null}

                <div className="grid gap-3">
                  {draft.image_urls.map((url, index) => (
                    <div className="grid gap-2 md:grid-cols-[1fr_auto]" key={index}>
                      <label className="label">
                        {index === 0 ? "Primary Image URL" : `Image URL ${index + 1}`}
                        <input
                          className="field"
                          value={url}
                          onChange={(event) => updateImageUrl(index, event.target.value)}
                          placeholder="https://example.com/product-image.jpg"
                          required={index === 0}
                        />
                      </label>
                      <button
                        className="btn-ghost self-end"
                        disabled={draft.image_urls.length === 1}
                        onClick={() => removeImageField(index)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {previewImages.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {previewImages.map((url, index) => (
                      <figure className="overflow-hidden rounded-lg border border-line bg-white" key={`${url}-${index}`}>
                        <img className="aspect-[4/3] w-full object-cover" src={url} alt={`Product preview ${index + 1}`} />
                        <figcaption className="px-3 py-2 text-xs font-extrabold text-muted">
                          {index === 0 ? "Primary image" : `Image ${index + 1}`}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : null}
              </section>

              <footer className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex min-h-10 items-center gap-3 text-sm font-bold text-ink">
                  <input className="h-4 w-4" checked={draft.is_active} name="is_active" onChange={handleChange} type="checkbox" />
                  Active product
                </label>
                <div className="flex flex-wrap gap-3">
                  <button className="btn-ghost" onClick={closeProductModal} type="button">
                    Cancel
                  </button>
                  <button className="btn-primary" disabled={saving} type="submit">
                    {saving ? "Saving..." : draft.id ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </footer>
            </form>
          </section>
        </div>
      ) : null}

      {confirmAction ? (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          tone={confirmAction.tone}
          onCancel={() => setConfirmAction(null)}
          onConfirm={confirmSelectedAction}
        />
      ) : null}
    </div>
  );
}
