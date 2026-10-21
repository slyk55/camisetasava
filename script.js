(function () {

    "use strict";

    const WHATSAPP_NUMBER = "554788714125";

    const CART_KEY =
        "avastore_cart_v1";

    const CUSTOMER_KEY =
        "avastore_customer_v1";

    // Preços por tipo de produto e tamanho.
    const PRICES = {
        catalog: { standard: 89.90, plus: 99.90 },
        custom: { standard: 104.90, plus: 114.90 }
    };
    const PLUS_SIZES = ["G1", "G2", "G3"];
    const SHIPPING_OPTIONS = {
        seller: { label: "A combinar com o vendedor", price: null }
        // Futuro: adicionar modalidades com valores em reais.
    };

    function priceFor(size, isCustom) {
        const tier = PLUS_SIZES.includes(String(size).toUpperCase()) ? "plus" : "standard";
        return PRICES[isCustom ? "custom" : "catalog"][tier];
    }

    function updatePricesInCart() {
        cart.forEach(function (item) {
            item.price = priceFor(item.size, item.id === "CUSTOM");
        });
    }

    const READY_SIZES = [
        "M",
        "G",
        "GG",
        "G1"
    ];

    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const cartPanel =
        document.getElementById("cartPanel");

    const cartOverlay =
        document.getElementById("cartOverlay");

    const openCartButton =
        document.getElementById("openCartButton");

    const closeCartButton =
        document.getElementById("closeCartButton");

    const cartItems =
        document.getElementById("cartItems");

    const cartCount =
        document.getElementById("cartCount");

    const cartTotal =
        document.getElementById("cartTotal");

    const cartSubtotal =
        document.getElementById("cartSubtotal");

    const checkoutButton =
        document.getElementById("checkoutButton");

    const clearCartButton =
        document.getElementById("clearCartButton");

    const continueToDeliveryButton =
        document.getElementById(
            "continueToDeliveryButton"
        );

    const backToCartButton =
        document.getElementById(
            "backToCartButton"
        );

    const mobileStepCart =
        document.getElementById(
            "mobileStepCart"
        );

    const mobileStepDelivery =
        document.getElementById(
            "mobileStepDelivery"
        );

    const customerName =
        document.getElementById("customerName");

    const customerCep =
        document.getElementById("customerCep");

    const customerStreet =
        document.getElementById("customerStreet");

    const customerNumber =
        document.getElementById("customerNumber");

    const customerNeighborhood =
        document.getElementById(
            "customerNeighborhood"
        );

    const customerCity =
        document.getElementById("customerCity");

    const customerState =
        document.getElementById("customerState");

    const customerComplement =
        document.getElementById(
            "customerComplement"
        );

    const cepStatus =
        document.getElementById("cepStatus");

    const toast =
        document.getElementById("storeToast");

    const zoomModal =
        document.getElementById("zoomModal");

    const zoomModalImage =
        document.getElementById("zoomModalImage");

    const zoomModalCaption =
        document.getElementById("zoomModalCaption");

    const zoomModalClose =
        document.getElementById("zoomModalClose");

    /* ELEMENTOS DO PERSONALIZADOR */
    const customModal =
        document.getElementById("customModal");

    const btnOpenCustomizer =
        document.getElementById("btnOpenCustomizer");

    const btnCloseCustomizer =
        document.getElementById("btnCloseCustomizer");

    const customStage =
        document.getElementById("customStage");

    const customMockupBase =
        document.getElementById("customMockupBase");

    const customPrintBox =
        document.getElementById("customPrintBox");

    const customPlacedArt =
        document.getElementById("customPlacedArt");

    const customArtImg =
        document.getElementById("customArtImg");

    const customDesignSelect =
        document.getElementById("customDesignSelect");

    const customArtUpload =
        document.getElementById("customArtUpload");

    const sliderArtWidth =
        document.getElementById("sliderArtWidth");

    const lblArtWidth =
        document.getElementById("lblArtWidth");

    const lblArtSizeText =
        document.getElementById("lblArtSizeText");

    const customSelectedSize =
        document.getElementById("customSelectedSize");

    const btnConfirmCustomItem =
        document.getElementById("btnConfirmCustomItem");

    const lblSelectedColor =
        document.getElementById("lblSelectedColor");

    let currentView = "front";
    let activeSwatch = document.querySelector(".swatch-btn.active");
    let customColor = activeSwatch ? (activeSwatch.dataset.color || "Preto") : "Preto";
    let customArtTitle = "Cyber Core";
    let posX = 20;
    let posY = 15;

    // Sincronizado estritamente com o novo range HTML (7 a 17) e teto máximo de 39%
    const SLIDER_MIN = 5;
    const SLIDER_MAX = 12;
    const MIN_SCALE_REAL = 12; // Mínimo real em % da largura na tela
    const MAX_SCALE_REAL = 28; // Teto máximo restrito exatamente a 39%

    const customerFields = [
        customerName,
        customerCep,
        customerStreet,
        customerNumber,
        customerNeighborhood,
        customerCity,
        customerState,
        customerComplement
    ];

    let cart =
        loadCart();

    let toastTimer =
        null;

    let lastSearchedCep =
        "";

    /* =====================================================
       FORMATADORES
    ===================================================== */

    function formatCurrency(val) {
        return Number(val).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function isMobileCart() {
        return window.matchMedia(
            "(max-width: 768px)"
        ).matches;
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&","&amp;")
            .replaceAll("<","&lt;")
            .replaceAll(">","&gt;")
            .replaceAll('"',"&quot;")
            .replaceAll("'","&#039;");
    }

    function getScaleLabel(val) {
        if (val <= 10.3) return "Pequeno";
        if (val <= 13.6) return "Médio";
        return "Grande";
    }

    /* =====================================================
       CARRINHO
    ===================================================== */

    function loadCart() {
        try {
            const saved = localStorage.getItem(CART_KEY);
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Erro ao carregar carrinho:", error);
            return [];
        }
    }

    function saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCart();
    }

    /* =====================================================
       DADOS DO CLIENTE
    ===================================================== */

    function loadCustomer() {
        try {
            const saved = localStorage.getItem(CUSTOMER_KEY);
            if (!saved) return;
            const data = JSON.parse(saved);

            customerName.value = data.name || "";
            customerCep.value = data.cep || "";
            customerStreet.value = data.street || "";
            customerNumber.value = data.number || "";
            customerNeighborhood.value = data.neighborhood || "";
            customerCity.value = data.city || "";
            customerState.value = data.state || "";
            customerComplement.value = data.complement || "";
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    }

    function saveCustomer() {
        const data = {
            name: customerName.value.trim(),
            cep: customerCep.value.trim(),
            street: customerStreet.value.trim(),
            number: customerNumber.value.trim(),
            neighborhood: customerNeighborhood.value.trim(),
            city: customerCity.value.trim(),
            state: customerState.value.trim().toUpperCase(),
            complement: customerComplement.value.trim()
        };

        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(data));
    }

    customerFields.forEach(function (field) {
        field.addEventListener("change", saveCustomer);
        field.addEventListener("blur", saveCustomer);
    });

    customerState.addEventListener("input", function () {
        this.value = this.value.replace(/[^a-zA-Z]/g, "").slice(0,2).toUpperCase();
    });

    /* =====================================================
       CEP
    ===================================================== */

    function formatCep(value) {
        let numbers = String(value).replace(/\D/g,"").slice(0,8);
        if (numbers.length > 5) {
            return numbers.slice(0,5) + "-" + numbers.slice(5);
        }
        return numbers;
    }

    function getCepNumbers() {
        return customerCep.value.replace(/\D/g,"");
    }

    function setCepStatus(message, type) {
        cepStatus.textContent = message || "";
        cepStatus.className = "cep-status";
        if (type) {
            cepStatus.classList.add(type);
        }
    }

    async function searchCep() {
        const cep = getCepNumbers();
        if (cep.length !== 8) {
            lastSearchedCep = "";
            setCepStatus("");
            return;
        }

        if (cep === lastSearchedCep) return;
        lastSearchedCep = cep;

        setCepStatus("Buscando CEP...", "searching");

        try {
            const response = await fetch("https://viacep.com.br/ws/" + cep + "/json/");
            if (!response.ok) throw new Error("Falha na consulta.");
            const data = await response.json();

            if (data.erro) {
                setCepStatus("CEP não localizado. Preencha o endereço manualmente.", "error");
                return;
            }

            if (data.logradouro) customerStreet.value = data.logradouro;
            if (data.bairro) customerNeighborhood.value = data.bairro;
            if (data.localidade) customerCity.value = data.localidade;
            if (data.uf) customerState.value = data.uf;

            if (!data.logradouro || !data.bairro) {
                setCepStatus("CEP localizado. Complete manualmente os campos que não foram informados.", "warning");
            } else {
                setCepStatus("CEP localizado. Confira o endereço e informe o número.", "success");
            }

            saveCustomer();
        } catch (error) {
            console.error("Erro ao consultar CEP:", error);
            setCepStatus("Não foi possível consultar o CEP. Preencha o endereço manualmente.", "error");
        }
    }

    customerCep.addEventListener("input", function () {
        this.value = formatCep(this.value);
        const cep = getCepNumbers();
        if (cep.length < 8) {
            lastSearchedCep = "";
            setCepStatus("");
        }
        saveCustomer();
        if (cep.length === 8) searchCep();
    });

    customerCep.addEventListener("blur", function () {
        if (getCepNumbers().length === 8) searchCep();
    });

    /* =====================================================
       DISPONIBILIDADE
    ===================================================== */

    function getAvailability(card, size) {
        const hasInitialStock = card.dataset.stockModel === "true";
        if (hasInitialStock && READY_SIZES.includes(size)) {
            return "Pronta Entrega";
        }
        return "Sob Encomenda";
    }

    function updateSizeStatus(card) {
        const select = card.querySelector(".product-size");
        const statusBox = card.querySelector(".selected-size-status");
        if (!select || !statusBox) return;

        const size = select.value;
        const avail = getAvailability(card, size);
        const priceTag = card.querySelector(".shirt-price-tag");
        if (priceTag) {
            priceTag.textContent = formatCurrency(priceFor(size, false));
        }

        if (avail === "Pronta Entrega") {
            statusBox.className = "selected-size-status ready";
            statusBox.innerHTML = '<i class="fa-solid fa-bolt"></i> Tam. ' + size + ': Pronta Entrega';
        } else {
            statusBox.className = "selected-size-status order";
            statusBox.innerHTML = '<i class="fa-solid fa-clock"></i> Tam. ' + size + ': Sob Encomenda';
        }
    }

    /* =====================================================
       ADICIONAR
    ===================================================== */

    function addToCart(card) {
        const sizeSelect = card.querySelector(".product-size");
        const quantityInput = card.querySelector(".product-quantity");
        const size = sizeSelect.value;
        let quantity = parseInt(quantityInput.value, 10);

        if (!Number.isFinite(quantity) || quantity < 1) quantity = 1;
        if (quantity > 10) quantity = 10;
        quantityInput.value = quantity;

        const price = priceFor(size, false);

        const item = {
            id: card.dataset.id,
            name: card.dataset.name,
            color: card.dataset.color,
            price: price,
            size: size,
            quantity: quantity,
            availability: getAvailability(card, size)
        };

        const existing = cart.find(function (product) {
            return (
                product.id === item.id &&
                product.size === item.size &&
                product.color === item.color &&
                product.availability === item.availability &&
                !product.customDetails
            );
        });

        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push(item);
        }

        saveCart();
        showToast("Camiseta adicionada ao carrinho.");
    }

    /* =====================================================
       TOTAL & SUBTOTAL
    ===================================================== */

    function totalQuantity() {
        return cart.reduce(function (total,item) {
            return total + Number(item.quantity);
        }, 0);
    }

    function totalSubtotal() {
        updatePricesInCart();
        return cart.reduce(function (total,item) {
            return total + (Number(item.quantity) * Number(item.price || 0));
        }, 0);
    }

    /* =====================================================
       RENDER
    ===================================================== */

    function renderCart() {
        updatePricesInCart();
        const total = totalQuantity();
        const subtotal = totalSubtotal();

        cartCount.textContent = total;
        cartTotal.textContent = total + " camiseta(s)";
        cartSubtotal.textContent = formatCurrency(subtotal);

        if (!cart.length) {
            cartItems.innerHTML = `
                <div class="store-cart-empty">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <strong>Seu carrinho está vazio.</strong><br>
                    Escolha um modelo, tamanho e quantidade.
                </div>
            `;
            return;
        }

        cartItems.innerHTML = cart.map(function (item, index) {
            const isReady = item.availability === "Pronta Entrega";
            const statusClass = isReady ? "store-cart-ready" : "store-cart-order";
            const statusIcon = isReady ? '<i class="fa-solid fa-bolt"></i>' : '<i class="fa-solid fa-clock"></i>';
            const itemTotal = (item.price || 0) * item.quantity;

            return `
                <div class="store-cart-item">
                    <div class="store-cart-item-top">
                        <div>
                            <h4>${item.id === "CUSTOM" ? escapeHtml(item.name) : `Camiseta ${escapeHtml(item.id)}:${escapeHtml(item.name)}`}</h4>
                            <div class="store-cart-item-info">
                                Cor: <strong>${escapeHtml(item.color)}</strong><br>
                                Tamanho: <strong>${escapeHtml(item.size)}</strong><br>
                                Preço un.: <strong>${formatCurrency(item.price || 0)}</strong><br>
                                Quantidade: <strong>${Number(item.quantity)}</strong> (${formatCurrency(itemTotal)})<br>
                                ${item.customDetails ? `<small style="color:var(--cyan-accent, #00e5ff);">${escapeHtml(item.customDetails.summary)}</small><br>` : ''}
                                <span class="store-cart-badge ${statusClass}">
                                    ${statusIcon} ${escapeHtml(item.availability)}
                                </span>
                            </div>
                        </div>
                        <button type="button" class="store-cart-remove" data-index="${index}" aria-label="Remover item">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        cartItems.querySelectorAll(".store-cart-remove").forEach(function (button) {
            button.addEventListener("click", function () {
                const index = Number(button.dataset.index);
                cart.splice(index, 1);
                saveCart();
            });
        });
    }

    /* =====================================================
       ETAPAS MOBILE
    ===================================================== */

    function showCartStep() {
        cartPanel.classList.remove("mobile-delivery-mode");
        mobileStepCart.classList.add("active");
        mobileStepDelivery.classList.remove("active");
        cartItems.scrollTop = 0;
    }

    function showDeliveryStep() {
        if (!cart.length) {
            showToast("Seu carrinho está vazio.");
            return;
        }

        cartPanel.classList.add("mobile-delivery-mode");
        mobileStepCart.classList.remove("active");
        mobileStepDelivery.classList.add("active");
        document.getElementById("cartStepDelivery").scrollTop = 0;
    }

    continueToDeliveryButton.addEventListener("click", showDeliveryStep);
    backToCartButton.addEventListener("click", showCartStep);

    /* =====================================================
       ABRIR / FECHAR CARRINHO
    ===================================================== */

    function openCart() {
        if (isMobileCart()) {
            showCartStep();
        }
        cartPanel.classList.add("active");
        cartOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeCart() {
        cartPanel.classList.remove("active");
        cartOverlay.classList.remove("active");
        cartPanel.classList.remove("mobile-delivery-mode");
        document.body.style.overflow = "";
    }

    openCartButton.addEventListener("click", function (event) {
        event.preventDefault();
        openCart();
    });

    closeCartButton.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);

    /* =====================================================
       ZOOM MODAL
    ===================================================== */

    function openZoomModal(imgSrc, title, desc) {
        zoomModalImage.src = imgSrc;
        zoomModalCaption.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(desc)}</span><span style="color:var(--purple-accent);font-size:.78rem;margin-top:4px;"><i class="fa-solid fa-circle-check"></i> Impressão DTF em Altíssima Resolução</span>`;
        zoomModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeZoomModal() {
        zoomModal.classList.remove("active");
        zoomModalImage.src = "";
        if (!cartPanel.classList.contains("active") && !customModal.classList.contains("active")) {
            document.body.style.overflow = "";
        }
    }

    zoomModalClose.addEventListener("click", closeZoomModal);
    zoomModal.addEventListener("click", function(e) {
        if (e.target === zoomModal) {
            closeZoomModal();
        }
    });

    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener("resize", function () {
        if (!isMobileCart()) {
            cartPanel.classList.remove("mobile-delivery-mode");
            mobileStepCart.classList.add("active");
            mobileStepDelivery.classList.remove("active");
        }
    });

    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("active");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toast.classList.remove("active");
        }, 2200);
    }

    /* =====================================================
       NÚMERO DO PEDIDO
    ===================================================== */

    function generateOrderNumber() {
        const now = new Date();
        const year = String(now.getFullYear()).slice(-2);
        const month = String(now.getMonth() + 1).padStart(2,"0");
        const day = String(now.getDate()).padStart(2,"0");
        const hour = String(now.getHours()).padStart(2,"0");
        const minute = String(now.getMinutes()).padStart(2,"0");
        const random = Math.floor(1000 + Math.random() * 9000);

        return "AV-" + year + month + day + "-" + hour + minute + "-" + random;
    }

    /* =====================================================
       VALIDAÇÃO
    ===================================================== */

    function validateCustomerData() {
        if (!customerName.value.trim()) {
            showToast("Informe seu nome.");
            customerName.focus();
            return false;
        }

        if (getCepNumbers().length !== 8) {
            showToast("Informe um CEP válido com 8 números.");
            customerCep.focus();
            return false;
        }

        if (!customerStreet.value.trim()) {
            showToast("Informe a rua ou logradouro.");
            customerStreet.focus();
            return false;
        }

        if (!customerNumber.value.trim()) {
            showToast("Informe o número do endereço.");
            customerNumber.focus();
            return false;
        }

        if (!customerNeighborhood.value.trim()) {
            showToast("Informe o bairro.");
            customerNeighborhood.focus();
            return false;
        }

        if (!customerCity.value.trim()) {
            showToast("Informe a cidade.");
            customerCity.focus();
            return false;
        }

        if (customerState.value.trim().length !== 2) {
            showToast("Informe a UF com 2 letras.");
            customerState.focus();
            return false;
        }

        return true;
    }

    /* =====================================================
       MENSAGEM WHATSAPP
    ===================================================== */

    function buildWhatsAppMessage() {
        const order = generateOrderNumber();
        const complement = customerComplement.value.trim();

        let message = `Olá! Gostaria de fazer um pedido na Ava Store.\n\nPEDIDO ${order}\n\n`;

        cart.forEach(function (item, index) {
            const itemSubtotal = (item.price || 0) * item.quantity;

            message += `${index + 1}) ${item.quantity}x ${item.id === "CUSTOM" ? item.name : `Camiseta ${item.id}:${item.name}`}\n` +
                       `Cor: ${item.color}\n` +
                       `Tamanho: ${item.size}\n` +
                       `Preço unitário: ${formatCurrency(item.price || 0)}\n` +
                       `Subtotal: ${formatCurrency(itemSubtotal)}\n` +
                       `Status: [${item.availability.toUpperCase()}]\n`;

            if (item.customDetails) {
                message += `» Configuração da Estampa: ${item.customDetails.view} | Tamanho: ${item.customDetails.scale} | Posição: ${item.customDetails.position}\n`;
            }

            message += `\n`;
        });

        message += `Quantidade total: ${totalQuantity()} camiseta(s)\n` +
                   `Valor dos produtos: ${formatCurrency(totalSubtotal())}\n` +
                   `Frete: ${SHIPPING_OPTIONS[document.getElementById("shippingMethod")?.value || "seller"]?.label || SHIPPING_OPTIONS.seller.label} (valor a confirmar)\n` +
                   `Total final: a confirmar após definição do frete\n\n` +
                   `DADOS PARA ENTREGA\n\n` +
                   `Nome: ${customerName.value.trim()}\n` +
                   `CEP: ${customerCep.value.trim()}\n` +
                   `Endereço: ${customerStreet.value.trim()}, ${customerNumber.value.trim()}\n` +
                   `Bairro: ${customerNeighborhood.value.trim()}\n` +
                   `Cidade/UF: ${customerCity.value.trim()}/${customerState.value.trim().toUpperCase()}`;

        if (complement) {
            message += `\nComplemento: ${complement}`;
        }

        message += `\n\nGostaria de confirmar a disponibilidade, o frete/prazo e os dados de pagamento.`;

        return message;
    }

    /* =====================================================
       VINCULAR PRODUTOS & CONTROLES
    ===================================================== */

    document.querySelectorAll(".shirt-card").forEach(function (card) {
        const addBtn = card.querySelector(".btn-add-cart");
        const qtyInput = card.querySelector(".product-quantity");
        const btnMinus = card.querySelector(".btn-minus");
        const btnPlus = card.querySelector(".btn-plus");
        const sizeSelect = card.querySelector(".product-size");
        const thumb = card.querySelector(".shirt-thumb");

        updateSizeStatus(card);

        if (sizeSelect) {
            sizeSelect.addEventListener("change", function() {
                updateSizeStatus(card);
            });
        }

        if (thumb) {
            thumb.addEventListener("click", function() {
                const img = thumb.querySelector("img");
                const name = card.dataset.name || "Estampa Ava Store";
                const desc = card.querySelector(".desc") ? card.querySelector(".desc").textContent.trim() : "";
                openZoomModal(img.src, name, desc);
            });
        }

        if (btnMinus && qtyInput) {
            btnMinus.addEventListener("click", function () {
                let val = parseInt(qtyInput.value, 10) || 1;
                if (val > 1) qtyInput.value = val - 1;
            });
        }

        if (btnPlus && qtyInput) {
            btnPlus.addEventListener("click", function () {
                let val = parseInt(qtyInput.value, 10) || 1;
                if (val < 10) qtyInput.value = val + 1;
            });
        }

        if (addBtn) {
            addBtn.addEventListener("click", function () {
                addToCart(card);
            });
        }
    });

    /* =====================================================
       LÓGICA DO PERSONALIZADOR
    ===================================================== */
    function updateMockupSource() {
        if (!activeSwatch || !customMockupBase) return;
        const src = currentView === "front" ? activeSwatch.dataset.front : activeSwatch.dataset.back;
        if (src) customMockupBase.src = src;
    }

    if (btnOpenCustomizer) {
        btnOpenCustomizer.addEventListener("click", function () {
            customModal.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    }

    function closeCustomizer() {
        customModal.classList.remove("active");
        if (!cartPanel.classList.contains("active")) {
            document.body.style.overflow = "";
        }
    }

    if (btnCloseCustomizer) {
        btnCloseCustomizer.addEventListener("click", closeCustomizer);
    }

    // Seleção de Frente / Costas
    document.querySelectorAll(".btn-toggle-view").forEach(function (btn) {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".btn-toggle-view").forEach(function (b) {
                b.classList.remove("active");
            });
            btn.classList.add("active");
            currentView = btn.dataset.view;
            updateMockupSource();
        });
    });

    // Seleção de Cores do Fornecedor
    document.querySelectorAll(".swatch-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".swatch-btn").forEach(function (b) {
                b.classList.remove("active");
            });
            btn.classList.add("active");
            activeSwatch = btn;
            customColor = btn.dataset.color || "Preto";
            if (lblSelectedColor) lblSelectedColor.textContent = customColor;
            updateMockupSource();
        });
    });

    // Troca de Estampa
    if (customDesignSelect) {
        customDesignSelect.addEventListener("change", function (e) {
            if (e.target.value === "custom_upload") {
                if (customArtUpload) {
                    customArtUpload.style.display = "block";
                    customArtUpload.click();
                }
            } else {
                if (customArtUpload) customArtUpload.style.display = "none";
                if (customArtImg) customArtImg.src = e.target.value;
                const opt = e.target.options[e.target.selectedIndex];
                customArtTitle = opt.dataset.name || "Estampa Ava";
            }
        });
    }

    // Upload Próprio
    if (customArtUpload) {
        customArtUpload.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    if (customArtImg) customArtImg.src = evt.target.result;
                    customArtTitle = "Arte do Cliente (" + file.name + ")";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Escala Proporcional Visual com base estrita nos limites min=5 e max=12, travado em 39% max
    function updateArtScale(sliderVal) {
        const val = parseFloat(sliderVal);
        const description = getScaleLabel(val);

        if (lblArtSizeText) {
            lblArtSizeText.textContent = description;
        }

        // Mapeia linearmente o slider de 5 a 12 para o tamanho visual de 15% até 39%
        const t = (val - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN);
        const visualWidthPercent = MIN_SCALE_REAL + (t * (MAX_SCALE_REAL - MIN_SCALE_REAL));

        if (customPlacedArt) {
            customPlacedArt.style.width = visualWidthPercent.toFixed(1) + "%";
        }
    }

    if (sliderArtWidth) {
        sliderArtWidth.addEventListener("input", function (e) {
            updateArtScale(e.target.value);
        });

        updateArtScale(sliderArtWidth.value || 12);
    }

    // Arrasto Livre em 100% da imagem da camiseta
    let isDragging = false;
    let startX = 0, startY = 0, origLeft = 0, origTop = 0;

    function getBoundsContainer() {
        return customPrintBox || customStage || customMockupBase;
    }

    function startDrag(clientX, clientY) {
        isDragging = true;
        startX = clientX;
        startY = clientY;
        origLeft = customPlacedArt.offsetLeft;
        origTop = customPlacedArt.offsetTop;
    }

    function moveDrag(clientX, clientY) {
        const container = getBoundsContainer();
        if (!isDragging || !container || !customPlacedArt) return;

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        const stageW = container.clientWidth;
        const stageH = container.clientHeight;
        const artW = customPlacedArt.clientWidth;
        const artH = customPlacedArt.clientHeight;

        let newLeftPx = origLeft + deltaX;
        let newTopPx = origTop + deltaY;

        newLeftPx = Math.max(0, Math.min(newLeftPx, stageW - artW));
        newTopPx = Math.max(0, Math.min(newTopPx, stageH - artH));

        posX = Math.round((newLeftPx / stageW) * 100);
        posY = Math.round((newTopPx / stageH) * 100);

        customPlacedArt.style.left = posX + "%";
        customPlacedArt.style.top = posY + "%";
    }

    function stopDrag() {
        isDragging = false;
    }

    if (customPlacedArt) {
        customPlacedArt.addEventListener("mousedown", function (e) {
            e.preventDefault();
            startDrag(e.clientX, e.clientY);
        });

        window.addEventListener("mousemove", function (e) {
            moveDrag(e.clientX, e.clientY);
        });

        window.addEventListener("mouseup", stopDrag);

        customPlacedArt.addEventListener("touchstart", function (e) {
            if (e.touches.length === 1) {
                startDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        window.addEventListener("touchmove", function (e) {
            if (isDragging && e.touches.length === 1) {
                if (e.cancelable) e.preventDefault();
                moveDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        window.addEventListener("touchend", stopDrag);
        window.addEventListener("touchcancel", stopDrag);
    }

    function updateCustomPriceLabel() {
        const label = document.getElementById("customSizePrice");
        if (label && customSelectedSize) {
            label.textContent = formatCurrency(priceFor(customSelectedSize.value, true));
        }
    }
    if (customSelectedSize) {
        customSelectedSize.addEventListener("change", updateCustomPriceLabel);
        updateCustomPriceLabel();
    }

    // Confirmar e adicionar ao carrinho
    if (btnConfirmCustomItem) {
        btnConfirmCustomItem.addEventListener("click", function () {
            const size = customSelectedSize ? customSelectedSize.value : "M";
            const viewLabel = currentView === "front" ? "Frente" : "Costas";
            
            const currentSliderVal = sliderArtWidth ? parseFloat(sliderArtWidth.value) : 12;
            const sizeDescription = getScaleLabel(currentSliderVal);
            
            // Calcula com precisão a porcentagem exata de 0% a 100% baseada no range 5 a 12
            let percentVal = Math.round(((currentSliderVal - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100);
            if (percentVal < 0) percentVal = 0;
            if (percentVal > 100) percentVal = 100;

            const customProduct = {
                id: "CUSTOM",
                name: "Camiseta Personalizada: " + customArtTitle,
                color: customColor,
                size: size,
                price: priceFor(size, true),
                quantity: 1,
                availability: "Sob Encomenda (3 a 5 dias úteis)",
                customDetails: {
                    view: viewLabel,
                    scale: `${sizeDescription} (${percentVal}%)`,
                    position: `X: ${posX}% | Y: ${posY}%`,
                    summary: `[${viewLabel}] Tam: ${size} | Estampa: ${sizeDescription} (${percentVal}%) | Posição: ${posX}%, ${posY}%`
                }
            };

            cart.push(customProduct);
            saveCart();
            closeCustomizer();
            openCart();
            showToast("Camiseta personalizada adicionada ao carrinho!");
        });
    }

    /* =====================================================
       CHECKOUT
    ===================================================== */

    checkoutButton.addEventListener("click", function () {
        if (!cart.length) {
            showToast("Seu carrinho está vazio.");
            if (isMobileCart()) {
                showCartStep();
            }
            return;
        }

        if (!validateCustomerData()) {
            return;
        }

        saveCustomer();

        const message = buildWhatsAppMessage();
        const url = "https://api.whatsapp.com/send?phone=" + WHATSAPP_NUMBER + "&text=" + encodeURIComponent(message);

        window.open(url, "_blank", "noopener");

        cart = [];
        saveCart();
        closeCart();
        showToast("Pedido gerado! Carrinho finalizado.");
    });

    /* =====================================================
       LIMPAR CARRINHO
    ===================================================== */

    clearCartButton.addEventListener("click", function () {
        if (!cart.length) return;

        const confirmation = window.confirm("Deseja realmente esvaziar o carrinho?");
        if (!confirmation) return;

        cart = [];
        saveCart();
        showToast("Carrinho esvaziado.");
    });

    /* =====================================================
       ESC
    ===================================================== */

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            if (zoomModal.classList.contains("active")) {
                closeZoomModal();
            } else if (customModal.classList.contains("active")) {
                closeCustomizer();
            } else {
                closeCart();
            }
        }
    });

    /* =====================================================
       INICIAR
    ===================================================== */

    loadCustomer();
    renderCart();

})();
