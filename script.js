const STORAGE_KEY = "shubhamSportsProducts";
const SESSION_KEY = "shubhamSportsAdminSession";

const DEFAULT_PRODUCTS = [
  {
    id: crypto.randomUUID(),
    name: "Cricket Bat Pro",
    category: "Cricket",
    price: 2499,
    description: "Balanced English willow style bat for practice and regular matches.",
    availability: "in-stock",
    featured: true,
    image: "https://images.unsplash.com/photo-1622279457486-62dcc4a4310b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: crypto.randomUUID(),
    name: "Tournament Football",
    category: "Football",
    price: 999,
    description: "Durable stitched football suitable for turf and ground play.",
    availability: "in-stock",
    featured: false,
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: crypto.randomUUID(),
    name: "Badminton Combo Set",
    category: "Badminton",
    price: 1499,
    description: "Two lightweight rackets with shuttle box for beginners and family play.",
    availability: "out-of-stock",
    featured: true,
    image: "https://images.unsplash.com/photo-1611251135345-18f8d2df7f64?auto=format&fit=crop&w=1200&q=80"
  }
];

function loadProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });
}

function getEnquiryText(product) {
  return `Hello Shubham Sports, I want to enquire about ${product.name} for ${formatPrice(product.price)}.`;
}

function renderStorePage() {
  const template = document.getElementById("productCardTemplate");
  const grid = document.getElementById("productGrid");
  if (!template || !grid) {
    return;
  }

  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const availabilityFilter = document.getElementById("availabilityFilter");
  const sortFilter = document.getElementById("sortFilter");
  const resultsSummary = document.getElementById("resultsSummary");
  const heroPreview = document.getElementById("heroPreview");

  const products = loadProducts();

  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];
  categoryFilter.innerHTML = '<option value="all">All categories</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const featuredProduct = products.find((product) => product.featured) || products[0];
  if (featuredProduct) {
    heroPreview.src = featuredProduct.image;
    heroPreview.alt = featuredProduct.name;
  }

  document.getElementById("statProducts").textContent = String(products.length);
  document.getElementById("statAvailable").textContent = String(
    products.filter((product) => product.availability === "in-stock").length
  );

  function renderProducts() {
    const searchValue = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedAvailability = availabilityFilter.value;
    const selectedSort = sortFilter.value;

    let filtered = [...loadProducts()].filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue);
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesAvailability =
        selectedAvailability === "all" || product.availability === selectedAvailability;

      return matchesSearch && matchesCategory && matchesAvailability;
    });

    filtered.sort((a, b) => {
      if (selectedSort === "price-low") {
        return a.price - b.price;
      }
      if (selectedSort === "price-high") {
        return b.price - a.price;
      }
      if (selectedSort === "name") {
        return a.name.localeCompare(b.name);
      }
      return Number(b.featured) - Number(a.featured);
    });

    grid.innerHTML = "";

    if (!filtered.length) {
      grid.innerHTML = '<div class="empty-state">No products match your search right now.</div>';
      resultsSummary.textContent = "0 products found";
      return;
    }

    filtered.forEach((product) => {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector(".product-card");
      const image = clone.querySelector(".product-image");
      const badge = clone.querySelector(".product-badge");
      const category = clone.querySelector(".product-category");
      const title = clone.querySelector(".product-title");
      const description = clone.querySelector(".product-description");
      const price = clone.querySelector(".product-price");
      const status = clone.querySelector(".product-status");
      const enquiryButton = clone.querySelector(".product-enquiry");

      image.src = product.image;
      image.alt = product.name;
      badge.textContent = product.featured ? "Featured" : "Popular";
      category.textContent = product.category;
      title.textContent = product.name;
      description.textContent = product.description || "Quality sports item for your daily needs.";
      price.textContent = formatPrice(product.price);
      status.textContent = product.availability === "in-stock" ? "In stock" : "Out of stock";
      status.classList.toggle("out", product.availability !== "in-stock");

      enquiryButton.addEventListener("click", () => {
        const message = encodeURIComponent(getEnquiryText(product));
        window.location.href = `https://wa.me/919876543210?text=${message}`;
      });

      card.dataset.id = product.id;
      grid.appendChild(clone);
    });

    resultsSummary.textContent = `${filtered.length} product${filtered.length === 1 ? "" : "s"} found`;
  }

  [searchInput, categoryFilter, availabilityFilter, sortFilter].forEach((element) => {
    element.addEventListener("input", renderProducts);
    element.addEventListener("change", renderProducts);
  });

  renderProducts();
}

function renderAdminPage() {
  const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");
  if (!loginSection || !dashboardSection) {
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");
  const logoutBtn = document.getElementById("logoutBtn");
  const productForm = document.getElementById("productForm");
  const adminProductList = document.getElementById("adminProductList");
  const productTemplate = document.getElementById("adminProductTemplate");
  const imageInput = document.getElementById("productImage");
  const imagePreview = document.getElementById("imagePreview");
  const productMessage = document.getElementById("productMessage");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  let draftImage = "";

  function isLoggedIn() {
    return localStorage.getItem(SESSION_KEY) === "true";
  }

  function setAuthState() {
    const authenticated = isLoggedIn();
    loginSection.classList.toggle("hidden", authenticated);
    dashboardSection.classList.toggle("hidden", !authenticated);
  }

  function resetForm() {
    productForm.reset();
    document.getElementById("productId").value = "";
    imagePreview.src = "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=80";
    draftImage = "";
    productMessage.textContent = "";
    cancelEditBtn.classList.add("hidden");
    document.getElementById("saveBtn").textContent = "Save product";
  }

  function renderAdminProducts() {
    const products = loadProducts();
    adminProductList.innerHTML = "";

    if (!products.length) {
      adminProductList.innerHTML = '<div class="empty-state">No products added yet. Use the form to add your first product.</div>';
      return;
    }

    products.forEach((product) => {
      const clone = productTemplate.content.cloneNode(true);
      const card = clone.querySelector(".admin-product-card");
      const image = clone.querySelector(".admin-product-image");
      const category = clone.querySelector(".product-category");
      const title = clone.querySelector(".product-title");
      const description = clone.querySelector(".product-description");
      const price = clone.querySelector(".product-price");
      const status = clone.querySelector(".product-status");
      const editButton = clone.querySelector(".edit-product");
      const deleteButton = clone.querySelector(".delete-product");

      card.dataset.id = product.id;
      image.src = product.image;
      image.alt = product.name;
      category.textContent = product.category;
      title.textContent = product.name;
      description.textContent = product.description || "No description added.";
      price.textContent = formatPrice(product.price);
      status.textContent = product.availability === "in-stock" ? "In stock" : "Out of stock";
      status.classList.toggle("out", product.availability !== "in-stock");

      editButton.addEventListener("click", () => {
        document.getElementById("productId").value = product.id;
        document.getElementById("productName").value = product.name;
        document.getElementById("productCategory").value = product.category;
        document.getElementById("productPrice").value = product.price;
        document.getElementById("productDescription").value = product.description;
        document.getElementById("productAvailability").value = product.availability;
        document.getElementById("productFeatured").checked = product.featured;
        imagePreview.src = product.image;
        draftImage = product.image;
        cancelEditBtn.classList.remove("hidden");
        document.getElementById("saveBtn").textContent = "Update product";
        productMessage.textContent = `Editing ${product.name}`;
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      deleteButton.addEventListener("click", () => {
        const confirmed = window.confirm(`Delete ${product.name}?`);
        if (!confirmed) {
          return;
        }

        const updatedProducts = loadProducts().filter((item) => item.id !== product.id);
        saveProducts(updatedProducts);
        renderAdminProducts();
        productMessage.textContent = `${product.name} deleted.`;
      });

      adminProductList.appendChild(clone);
    });
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const adminId = document.getElementById("adminId").value.trim();
    const password = document.getElementById("adminPassword").value;

    if (adminId === "aditya@123" && password === "Aditya01") {
      localStorage.setItem(SESSION_KEY, "true");
      loginMessage.textContent = "";
      setAuthState();
      renderAdminProducts();
      return;
    }

    loginMessage.textContent = "Invalid admin ID or password.";
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    setAuthState();
    resetForm();
  });

  imageInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      draftImage = await readFileAsDataUrl(file);
      imagePreview.src = draftImage;
      productMessage.textContent = "Image uploaded successfully.";
    } catch (error) {
      productMessage.textContent = error.message;
    }
  });

  cancelEditBtn.addEventListener("click", resetForm);

  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = document.getElementById("productId").value;
    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value.trim();
    const price = Number(document.getElementById("productPrice").value);
    const description = document.getElementById("productDescription").value.trim();
    const availability = document.getElementById("productAvailability").value;
    const featured = document.getElementById("productFeatured").checked;

    const products = loadProducts();
    const fallbackImage = "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=80";

    const productData = {
      id: id || crypto.randomUUID(),
      name,
      category,
      price,
      description,
      availability,
      featured,
      image: draftImage || fallbackImage
    };

    const updatedProducts = id
      ? products.map((product) => (product.id === id ? productData : product))
      : [productData, ...products];

    saveProducts(updatedProducts);
    renderAdminProducts();
    resetForm();
    productMessage.textContent = id ? `${name} updated successfully.` : `${name} added successfully.`;
  });

  setAuthState();
  if (isLoggedIn()) {
    renderAdminProducts();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "store") {
    renderStorePage();
  }
  if (page === "admin") {
    renderAdminPage();
  }
});
