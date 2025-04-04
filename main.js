document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

async function initApp() {
    try {
        // Fetch voucher data
        const vouchers = await fetchVouchers();
        
        // Display vouchers
        displayVouchers(vouchers);
        
        // Set up search and filtering
        setupSearchAndFilter(vouchers);
    } catch (error) {
        console.error('Error initializing app:', error);
        document.getElementById('loading').innerHTML = `
            <p>Error loading vouchers. Please try again later.</p>
            <p>Error: ${error.message}</p>
        `;
    }
}

function displayVouchers(vouchers) {
    const vouchersContainer = document.getElementById('vouchers');
    const loadingElement = document.getElementById('loading');
    
    // Hide loading indicator
    loadingElement.style.display = 'none';
    
    // Clear any existing content
    vouchersContainer.innerHTML = '';
    
    if (vouchers.length === 0) {
        vouchersContainer.innerHTML = '<p>Không tìm thấy voucher nào.</p>';
        return;
    }
    
    // Create and append voucher cards
    vouchers.forEach(voucher => {
        const voucherCard = createVoucherCard(voucher);
        vouchersContainer.appendChild(voucherCard);
    });
    
    // Set up copy buttons
    setupCopyButtons();
}

function createVoucherCard(voucher) {
    const card = document.createElement('div');
    card.className = 'voucher-card';
    card.setAttribute('data-category', voucher.category || 'other');
    
    card.innerHTML = `
        <div class="voucher-header">${voucher.type || 'Voucher'}</div>
        <div class="voucher-body">
            <h2 class="voucher-title">${voucher.title}</h2>
            <p class="voucher-description">${voucher.description || 'Không có mô tả'}</p>
            
            ${voucher.code ? `
            <div class="copy-code">
                <div class="code">${voucher.code}</div>
                <button class="copy-btn" data-code="${voucher.code}">Copy</button>
            </div>
            ` : ''}
            
            <div class="voucher-meta">
                ${voucher.validUntil ? `<span>Hết hạn: ${voucher.validUntil}</span>` : ''}
                ${voucher.minOrder ? `<span>Đơn tối thiểu: ${voucher.minOrder}</span>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

function setupCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            navigator.clipboard.writeText(code)
                .then(() => {
                    // Change button text temporarily
                    const originalText = this.textContent;
                    this.textContent = 'Đã copy!';
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 1500);
                })
                .catch(err => {
                    console.error('Failed to copy code:', err);
                });
        });
    });
}

function setupSearchAndFilter(allVouchers) {
    const searchInput = document.getElementById('search');
    const filterSelect = document.getElementById('filter');
    
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filterValue = filterSelect.value;
        
        let filteredVouchers = allVouchers;
        
        // Apply category filter
        if (filterValue !== 'all') {
            filteredVouchers = filteredVouchers.filter(voucher => 
                voucher.category && voucher.category.toLowerCase() === filterValue
            );
        }
        
        // Apply search term
        if (searchTerm) {
            filteredVouchers = filteredVouchers.filter(voucher => 
                (voucher.title && voucher.title.toLowerCase().includes(searchTerm)) ||
                (voucher.description && voucher.description.toLowerCase().includes(searchTerm)) ||
                (voucher.code && voucher.code.toLowerCase().includes(searchTerm))
            );
        }
        
        displayVouchers(filteredVouchers);
    }
    
    searchInput.addEventListener('input', applyFilters);
    filterSelect.addEventListener('change', applyFilters);
}