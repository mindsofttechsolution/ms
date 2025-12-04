// --- DATA & STATE ---
const data = {
    services: [
        { title: "Network Installation", desc: "Professional structured cabling and Wi-Fi setup for offices.", price: "From Rs. 200", image: "https://images.unsplash.com/photo-1558494949-ef526b0042a0?w=500&q=80" },
        { title: "CCTV & Security", desc: "Advanced surveillance systems with remote monitoring.", price: "From Rs. 350", image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&q=80" },
        { title: "IT Troubleshooting", desc: "24/7 on-site and remote support for hardware/software issues.", price: "Rs. 50/hr", image: "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=500&q=80" },
        { title: "IT Consultancy", desc: "Strategic technology planning for business growth.", price: "Free Quote", image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500&q=80" }
    ],
    courses: [
        { title: "Python Masterclass", category: "Programming", duration: "8 Weeks", price: "Rs. 199", image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=500&q=80" },
        { title: "Junior Robotics", category: "Robotics", duration: "4 Weeks", price: "Rs. 149", image: "https://images.unsplash.com/photo-1581092921461-eab62e97a783?w=500&q=80" },
        { title: "AL ICT Support", category: "Academic", duration: "Ongoing", price: "Rs. 50/mo", image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500&q=80" }
    ],
    products: [
        { id: 1, name: "Arduino Uno R3", category: "Robotics", price: 25.00, stock: true, image: "https://images.unsplash.com/photo-1555449363-15a91f170c30?w=500&q=80" },
        { id: 2, name: "Sensor Starter Kit", category: "Sensors", price: 45.50, stock: true, image: "https://images.unsplash.com/photo-1517055248174-e5ea909e845e?w=500&q=80" },
        { id: 3, name: "USB 3.0 Hub", category: "Accessories", price: 15.99, stock: true, image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&q=80" },
        { id: 4, name: "Precision Tool Set", category: "Tools", price: 35.00, stock: false, image: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&q=80" },
        { id: 5, name: "Raspberry Pi 4", category: "Robotics", price: 75.00, stock: true, image: "https://images.unsplash.com/photo-1550041473-d296a3a8a18a?w=500&q=80" }
    ]
};

// Load from LocalStorage or use defaults
const loadStored = (key, defaultVal) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultVal;
};

const state = {
    currentPage: 'home',
    cart: loadStored('mindsoft_cart', []),
    adminLoggedIn: false,
    products: loadStored('mindsoft_products', [...data.products]),
    orders: loadStored('mindsoft_orders', [
        { id: 101, customer: "John Doe", total: 70.50, status: "Pending" },
        { id: 102, customer: "Jane Smith", total: 25.00, status: "Shipped" }
    ]),
    shopFilter: 'All',
    adminSort: { field: 'name', asc: true },
    adminSearch: ''
};

const saveData = () => {
    localStorage.setItem('mindsoft_products', JSON.stringify(state.products));
    localStorage.setItem('mindsoft_cart', JSON.stringify(state.cart));
    localStorage.setItem('mindsoft_orders', JSON.stringify(state.orders));
};

// --- ROUTER & RENDERERS ---
const router = {
    navigate: (page) => {
        state.currentPage = page;
        window.scrollTo(0, 0);
        ui.closeMobileMenu();
        app.render();
    }
};

const ui = {
    toggleMobileMenu: () => {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    },
    closeMobileMenu: () => {
        document.getElementById('mobile-menu').classList.add('hidden');
    },
    toggleChat: () => {
        document.getElementById('chat-window').classList.toggle('hidden');
    },
    toggleCart: () => {
        alert(`Cart contains ${state.cart.length} items.\nTotal: Rs. ${state.cart.reduce((a, b) => a + b.price, 0).toFixed(2)}`);
    },
    openModal: (id) => {
        document.getElementById(id).classList.remove('hidden');
    },
    closeModal: (id) => {
        document.getElementById(id).classList.add('hidden');
    }
};

const app = {
    init: () => {
        lucide.createIcons();

        // Restore cart badge
        if (state.cart.length > 0) {
            const badge = document.getElementById('cart-count');
            badge.innerText = state.cart.length;
            badge.classList.remove('hidden');
        }

        app.render();

        // Event Listeners
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') app.sendMessage();
        });

        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            app.handleProductSave();
        });
    },

    sendMessage: () => {
        const input = document.getElementById('chat-input');
        const msg = input.value.trim();
        if (!msg) return;

        const chatContainer = document.getElementById('chat-messages');
        chatContainer.innerHTML += `
            <div class="flex justify-end">
                <div class="bg-blue-600 text-white rounded-2xl rounded-tr-none py-2 px-4 text-sm max-w-[85%] shadow-sm">${msg}</div>
            </div>`;
        input.value = '';
        chatContainer.scrollTop = chatContainer.scrollHeight;

        setTimeout(() => {
            chatContainer.innerHTML += `
                <div class="flex justify-start">
                    <div class="bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none py-2 px-4 text-sm max-w-[85%] shadow-sm">
                        Thanks for reaching out! A MindSoft agent will be with you shortly.
                    </div>
                </div>`;
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 1000);
    },

    addToCart: (productId) => {
        const prod = state.products.find(p => p.id === productId);
        if (prod && prod.stock) {
            state.cart.push(prod);
            saveData();
            const badge = document.getElementById('cart-count');
            badge.innerText = state.cart.length;
            badge.classList.remove('hidden');

            // Simple toast
            const btn = document.getElementById(`btn-add-${productId}`);
            const originalHTML = btn.innerHTML;
            const originalClasses = btn.className;

            btn.innerHTML = `<i data-lucide="check" class="h-5 w-5"></i>`;
            btn.className = "p-3 rounded-full bg-green-500 text-white shadow-lg transition-all scale-110";
            lucide.createIcons();

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.className = originalClasses;
                lucide.createIcons();
            }, 1500);
        }
    },

    // Admin Actions
    handleLogin: (e) => {
        e.preventDefault();
        const pin = document.getElementById('admin-pin').value;
        if (pin === '1978') {
            state.adminLoggedIn = true;
            app.render();
        } else {
            alert('Invalid PIN');
        }
    },

    deleteProduct: (id) => {
        if (confirm('Are you sure?')) {
            state.products = state.products.filter(p => p.id !== id);
            saveData();
            app.render();
        }
    },

    editProduct: (id) => {
        const prod = state.products.find(p => p.id === id);
        if (!prod) return;
        document.getElementById('modal-title').innerText = 'Edit Product';
        document.getElementById('prod-id').value = prod.id;
        document.getElementById('prod-name').value = prod.name;
        document.getElementById('prod-category').value = prod.category;
        document.getElementById('prod-price').value = prod.price;
        document.getElementById('prod-stock').value = prod.stock.toString();
        document.getElementById('prod-image').value = prod.image;
        ui.openModal('product-modal');
    },

    openAddProduct: () => {
        document.getElementById('modal-title').innerText = 'Add Product';
        document.getElementById('prod-id').value = '';
        document.getElementById('product-form').reset();
        ui.openModal('product-modal');
    },

    handleProductSave: () => {
        const id = document.getElementById('prod-id').value;
        const newProd = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('prod-name').value,
            category: document.getElementById('prod-category').value,
            price: parseFloat(document.getElementById('prod-price').value),
            stock: document.getElementById('prod-stock').value === 'true',
            image: document.getElementById('prod-image').value || 'https://via.placeholder.com/150'
        };

        if (id) {
            const idx = state.products.findIndex(p => p.id == id);
            if (idx !== -1) state.products[idx] = newProd;
        } else {
            state.products.push(newProd);
        }
        saveData();
        ui.closeModal('product-modal');
        app.render();
    },

    handleContactSubmit: (e) => {
        e.preventDefault();
        const form = e.target;
        form.innerHTML = `
            <div class="bg-green-50 border border-green-200 text-green-700 p-8 rounded-2xl text-center">
                <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="check" class="h-8 w-8 text-green-600"></i>
                </div>
                <h4 class="font-bold text-xl mb-2">Message Sent!</h4>
                <p class="text-slate-600">We will get back to you soon.</p>
            </div>
        `;
        lucide.createIcons();
    },

    // RENDER LOGIC
    render: () => {
        const root = document.getElementById('app-root');
        root.innerHTML = '';

        switch (state.currentPage) {
            case 'home': root.innerHTML = renderHome(); break;
            case 'services': root.innerHTML = renderServices(); break;
            case 'education': root.innerHTML = renderEducation(); break;
            case 'shop': root.innerHTML = renderShop(); break;
            case 'contact': root.innerHTML = renderContact(); break;
            case 'admin': root.innerHTML = renderAdmin(); break;
        }
        lucide.createIcons();
    }
};

// --- TEMPLATES ---
const renderHome = () => `
    <div class="relative bg-slate-900 overflow-hidden pt-16 pb-32">
        <!-- Aurora Background Effects -->
        <div class="aurora-blob bg-blue-600 w-96 h-96 top-0 left-1/4 -translate-y-1/2"></div>
        <div class="aurora-blob bg-purple-600 w-96 h-96 bottom-0 right-1/4 translate-y-1/2"></div>
        
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div class="text-center max-w-4xl mx-auto animate-fade-in">
                <span class="inline-block py-1 px-3 rounded-full bg-blue-900/50 border border-blue-700 text-blue-300 text-sm font-medium mb-6">
                    Next Gen Technology
                </span>
                <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8 leading-tight">
                    Future-Ready <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Robotics</span> & IT Solutions
                </h1>
                <p class="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Empowering businesses and students with cutting-edge technology, from network infrastructure to advanced robotics education.
                </p>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <button onclick="router.navigate('services')" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-blue-900/20 transition-all hover:scale-105 hover:shadow-blue-600/40">
                        Explore Services
                    </button>
                    <button onclick="router.navigate('education')" class="bg-transparent hover:bg-slate-800 text-white border border-slate-600 px-8 py-4 rounded-full font-bold transition-all hover:border-slate-500">
                        Start Learning
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Stats -->
    <div class="bg-slate-900 border-y border-slate-800 relative z-20">
        <div class="max-w-7xl mx-auto px-4 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div><div class="text-4xl font-extrabold text-white mb-2">500+</div><div class="text-slate-400 text-sm font-semibold uppercase tracking-widest">Projects</div></div>
            <div><div class="text-4xl font-extrabold text-white mb-2">1200+</div><div class="text-slate-400 text-sm font-semibold uppercase tracking-widest">Students</div></div>
            <div><div class="text-4xl font-extrabold text-white mb-2">98%</div><div class="text-slate-400 text-sm font-semibold uppercase tracking-widest">Satisfaction</div></div>
            <div><div class="text-4xl font-extrabold text-white mb-2">24/7</div><div class="text-slate-400 text-sm font-semibold uppercase tracking-widest">Support</div></div>
        </div>
    </div>

    <!-- Featured Services -->
    <div class="py-24 bg-slate-50">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Expertise</h2>
                <p class="text-slate-600 max-w-2xl mx-auto">Comprehensive technology solutions tailored for modern businesses and educational institutions.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                ${data.services.map(s => `
                    <div class="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                        <div class="h-14 w-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <i data-lucide="zap" class="h-7 w-7"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 mb-3">${s.title}</h3>
                        <p class="text-slate-600 text-sm mb-6 leading-relaxed">${s.desc}</p>
                        <span class="text-blue-600 font-semibold text-sm flex items-center gap-1">
                            ${s.price} <i data-lucide="arrow-right" class="h-4 w-4"></i>
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
`;

const renderServices = () => `
    <div class="max-w-7xl mx-auto px-4 py-20 animate-fade-in">
        <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-slate-900 mb-4">Professional Services</h2>
            <p class="text-slate-600">Delivering excellence in IT infrastructure and security.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            ${data.services.map(s => `
                <div class="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row h-full">
                    <div class="md:w-2/5 h-64 md:h-auto bg-cover bg-center" style="background-image: url('${s.image}')"></div>
                    <div class="p-8 flex-1 flex flex-col justify-center">
                        <h3 class="text-2xl font-bold text-slate-900 mb-3">${s.title}</h3>
                        <p class="text-slate-600 mb-6 leading-relaxed">${s.desc}</p>
                        <div class="flex items-center justify-between mt-auto">
                            <span class="text-2xl font-bold text-blue-600">${s.price}</span>
                            <button onclick="router.navigate('contact')" class="px-6 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-full font-medium transition-colors shadow-lg shadow-slate-900/20">Get Quote</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
`;

const renderEducation = () => `
    <div class="max-w-7xl mx-auto px-4 py-20 animate-fade-in">
        <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-slate-900 mb-4">Education & Courses</h2>
            <p class="text-slate-600">Empowering the next generation of innovators.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${data.courses.map(c => `
                <div class="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
                    <div class="h-56 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style="background-image: url('${c.image}')"></div>
                    <div class="p-8 relative bg-white">
                        <div class="flex justify-between items-start mb-4">
                            <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">${c.category}</span>
                            <span class="text-xs text-slate-500 flex items-center gap-1 font-medium"><i data-lucide="clock" class="h-3 w-3"></i> ${c.duration}</span>
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 mb-3">${c.title}</h3>
                        <div class="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                            <span class="text-2xl font-bold text-slate-900">${c.price}</span>
                            <button class="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">Enroll Now <i data-lucide="arrow-right" class="h-4 w-4"></i></button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
`;

const renderShop = () => {
    const filtered = state.shopFilter === 'All'
        ? state.products
        : state.products.filter(p => p.category === state.shopFilter);

    return `
    <div class="max-w-7xl mx-auto px-4 py-20 animate-fade-in">
        <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
                <h2 class="text-4xl font-bold text-slate-900 mb-2">Shop</h2>
                <p class="text-slate-600">Premium robotics components and tools.</p>
            </div>
            <div class="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                ${['All', 'Robotics', 'Sensors', 'Accessories', 'Tools'].map(cat => `
                    <button onclick="state.shopFilter = '${cat}'; app.render()" 
                        class="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${state.shopFilter === cat ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600'}">
                        ${cat}
                    </button>
                `).join('')}
            </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            ${filtered.map(p => `
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
                    <div class="aspect-square bg-slate-50 rounded-xl mb-5 bg-cover bg-center relative overflow-hidden" style="background-image: url('${p.image}')">
                        ${!p.stock ? '<span class="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">Out of Stock</span>' : ''}
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 mb-1">${p.name}</h3>
                    <p class="text-slate-500 text-sm mb-4 font-medium">${p.category}</p>
                    <div class="mt-auto flex items-center justify-between">
                        <span class="text-xl font-bold text-slate-900">Rs. ${p.price.toFixed(2)}</span>
                        <button id="btn-add-${p.id}" onclick="app.addToCart(${p.id})" ${!p.stock ? 'disabled' : ''} 
                            class="p-3 rounded-full ${p.stock ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:scale-105' : 'bg-slate-100 text-slate-400 cursor-not-allowed'} transition-all">
                            <i data-lucide="shopping-cart" class="h-5 w-5"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        ${filtered.length === 0 ? '<div class="text-center text-slate-500 py-12 bg-white rounded-2xl border border-slate-200">No products found in this category.</div>' : ''}
    </div>
`};

const renderContact = () => `
    <div class="max-w-3xl mx-auto px-4 py-20 animate-fade-in">
        <div class="text-center mb-12">
            <h2 class="text-4xl font-bold text-slate-900 mb-4">Get in Touch</h2>
            <p class="text-slate-600">We'd love to hear from you.</p>
        </div>
        <div class="bg-white rounded-2xl p-10 border border-slate-200 shadow-xl">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div class="flex items-center gap-4">
                    <div class="bg-blue-50 p-4 rounded-full text-blue-600"><i data-lucide="phone" class="h-6 w-6"></i></div>
                    <div><div class="text-xs font-bold text-slate-400 uppercase tracking-wide">Phone</div><div class="text-slate-900 font-medium">0117643404 / 0787515159</div></div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="bg-blue-50 p-4 rounded-full text-blue-600"><i data-lucide="mail" class="h-6 w-6"></i></div>
                    <div><div class="text-xs font-bold text-slate-400 uppercase tracking-wide">Email</div><div class="text-slate-900 font-medium">mindsofttechsolution@gmail.com</div></div>
                </div>
            </div>
            
            <form onsubmit="app.handleContactSubmit(event)" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Name</label>
                        <input type="text" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Email</label>
                        <input type="email" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2">Message</label>
                    <textarea rows="4" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"></textarea>
                </div>
                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-full shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]">Send Message</button>
            </form>
        </div>
    </div>
`;

const renderAdmin = () => {
    if (!state.adminLoggedIn) {
        return `
            <div class="min-h-[60vh] flex items-center justify-center px-4">
                <div class="bg-white p-10 rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm">
                    <div class="text-center mb-8">
                        <div class="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i data-lucide="lock" class="h-10 w-10 text-blue-600"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-slate-900">Admin Access</h2>
                        <p class="text-slate-500 text-sm mt-2">Please enter your secure PIN</p>
                    </div>
                    <form onsubmit="app.handleLogin(event)">
                        <input type="password" id="admin-pin" placeholder="PIN" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 mb-6 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-center tracking-[0.5em] font-bold text-xl">
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full shadow-lg shadow-blue-600/20 transition-all">Unlock Dashboard</button>
                    </form>
                </div>
            </div>
        `;
    }

    // Sort and Filter Logic for Admin Table
    let adminProducts = [...state.products];
    if (state.adminSearch) {
        adminProducts = adminProducts.filter(p => p.name.toLowerCase().includes(state.adminSearch.toLowerCase()));
    }
    adminProducts.sort((a, b) => {
        const valA = a[state.adminSort.field];
        const valB = b[state.adminSort.field];
        return state.adminSort.asc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    return `
        <div class="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
            <div class="flex justify-between items-center mb-10">
                <div>
                    <h2 class="text-3xl font-bold text-slate-900">Dashboard</h2>
                    <p class="text-slate-500">Manage your products and view performance.</p>
                </div>
                <button onclick="state.adminLoggedIn = false; app.render()" class="text-slate-500 hover:text-red-600 text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-full hover:bg-red-50 transition-colors">
                    <i data-lucide="log-out" class="h-4 w-4"></i> Logout
                </button>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Revenue</div>
                    <div class="text-3xl font-extrabold text-slate-900">Rs. 12,450.00</div>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Orders</div>
                    <div class="text-3xl font-extrabold text-slate-900">1,240</div>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div class="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Products in Stock</div>
                    <div class="text-3xl font-extrabold text-slate-900">${state.products.filter(p => p.stock).length}</div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="mb-8 border-b border-slate-200">
                <nav class="flex space-x-8">
                    <button class="border-b-2 border-blue-600 pb-4 px-1 text-blue-600 font-bold">Products Management</button>
                    <button class="border-b-2 border-transparent pb-4 px-1 text-slate-500 hover:text-slate-800 font-medium transition-colors">Recent Orders</button>
                </nav>
            </div>

            <!-- Product Actions -->
            <div class="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div class="relative">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"></i>
                    <input type="text" placeholder="Search products..." 
                        oninput="state.adminSearch = this.value; app.render()"
                        value="${state.adminSearch}"
                        class="bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none w-full md:w-72 shadow-sm">
                </div>
                <button onclick="app.openAddProduct()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-105">
                    <i data-lucide="plus" class="h-4 w-4"></i> Add Product
                </button>
            </div>

            <!-- Products Table -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm text-slate-600">
                        <thead class="bg-slate-50 text-slate-700 uppercase font-bold text-xs tracking-wider border-b border-slate-200">
                            <tr>
                                <th class="px-6 py-5 cursor-pointer hover:text-blue-600" onclick="state.adminSort = {field: 'name', asc: !state.adminSort.asc}; app.render()">Product</th>
                                <th class="px-6 py-5">Category</th>
                                <th class="px-6 py-5 cursor-pointer hover:text-blue-600" onclick="state.adminSort = {field: 'price', asc: !state.adminSort.asc}; app.render()">Price</th>
                                <th class="px-6 py-5">Status</th>
                                <th class="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${adminProducts.map(p => `
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="px-6 py-4 flex items-center gap-4">
                                        <img src="${p.image}" class="h-12 w-12 rounded-lg object-cover bg-slate-100 border border-slate-200">
                                        <span class="font-bold text-slate-900">${p.name}</span>
                                    </td>
                                    <td class="px-6 py-4"><span class="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">${p.category}</span></td>
                                    <td class="px-6 py-4 font-medium text-slate-900">Rs. ${p.price.toFixed(2)}</td>
                                    <td class="px-6 py-4">
                                        <span class="px-3 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1 ${p.stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                                            <span class="w-2 h-2 rounded-full ${p.stock ? 'bg-green-500' : 'bg-red-500'}"></span>
                                            ${p.stock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <button onclick="app.editProduct(${p.id})" class="text-slate-400 hover:text-blue-600 mr-3 transition-colors"><i data-lucide="edit-2" class="h-4 w-4"></i></button>
                                        <button onclick="app.deleteProduct(${p.id})" class="text-slate-400 hover:text-red-600 transition-colors"><i data-lucide="trash-2" class="h-4 w-4"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Mock Orders Section (Visual Only) -->
            <div class="mt-12">
                <h3 class="text-xl font-bold text-slate-900 mb-6">Recent Orders</h3>
                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table class="w-full text-left text-sm text-slate-600">
                        <thead class="bg-slate-50 text-slate-700 uppercase font-bold text-xs tracking-wider border-b border-slate-200">
                            <tr>
                                <th class="px-6 py-4">Order ID</th>
                                <th class="px-6 py-4">Customer</th>
                                <th class="px-6 py-4">Total</th>
                                <th class="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${state.orders.map(o => `
                                <tr class="hover:bg-slate-50">
                                    <td class="px-6 py-4 font-medium">#${o.id}</td>
                                    <td class="px-6 py-4">${o.customer}</td>
                                    <td class="px-6 py-4 font-bold text-slate-900">Rs. ${o.total.toFixed(2)}</td>
                                    <td class="px-6 py-4"><span class="text-blue-600 font-medium">${o.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

// Initialize
window.addEventListener('DOMContentLoaded', app.init);
