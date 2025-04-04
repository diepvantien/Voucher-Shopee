document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Set current date on footer
    const today = new Date();
    document.getElementById('last-updated').textContent = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
});

async function initApp() {
    try {
        // Fetch voucher data
        const vouchers = await fetchVouchers();
        
        // Save vouchers for filtering
        window.allVouchers = vouchers;
        
        // Display vouchers
        displayVouchers(vouchers);
        
        // Set up search and filtering
        setupSearchAndFilter();
        
        // Set up filter tabs
        setupFilterTabs();
    } catch (error) {
        console.error('Error initializing app:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('status-message').textContent = `Lỗi tải mã voucher: ${error.message}`;
        document.getElementById('status-message').style.display = 'block';
    }
}

function displayVouchers(vouchers) {
    const vouchersContainer = document.getElementById('vouchers');
    const loadingElement = document.getElementById('loading');
    const statusElement = document.getElementById('status-message');
    
    // Hide loading indicator
    loadingElement.style.display = 'none';
    
    // Clear any existing content
    vouchersContainer.innerHTML = '';
    
    if (vouchers.length === 0) {
        statusElement.textContent = 'Không tìm thấy voucher nào phù hợp.';
        statusElement.style.display = 'block';
        return;
    } else {
        statusElement.style.display = 'none';
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
            <h2 class="voucher-title">${escapeHTML(voucher.title)}</h2>
            ${voucher.description ? `<p class="voucher-description">${escapeHTML(voucher.description)}</p>` : ''}
            
            ${voucher.code ? `
            <div class="copy-code">
                <div class="code">${voucher.code}</div>
                <button class="copy-btn" data-code="${voucher.code}">Copy</button>
            </div>
            ` : ''}
            
            <div class="voucher-meta">
                ${voucher.validUntil ? `<span>Hết hạn: ${voucher.validUntil}</span>` : '<span>Không thời hạn</span>'}
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
                    // Show success message
                    const successMessage = document.getElementById('success-message');
                    successMessage.style.animation = 'none';
                    successMessage.offsetHeight; // Trigger reflow
                    successMessage.style.animation = 'fadeInOut 2s forwards';
                    
                    // Change button text temporarily
                    const originalText = this.textContent;
                    this.textContent = 'Đã copy!';
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 1500);
                })
                .catch(err => {
                    console.error('Failed to copy code:', err);
                    alert(`Không thể copy mã: ${code}\nVui lòng copy thủ công.`);
                });
        });
    });
}

function setupSearchAndFilter() {
    const searchInput = document.getElementById('search');
    
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const activeCategory = document.querySelector('.filter-tab.active').getAttribute('data-category');
        
        let filteredVouchers = window.allVouchers;
        
        // Apply category filter
        if (activeCategory !== 'all') {
            filteredVouchers = filteredVouchers.filter(voucher => 
                voucher.category && voucher.category === activeCategory
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
}

function setupFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Apply filters
            const searchInput = document.getElementById('search');
            const event = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(event);
        });
    });
}

// Helper function to escape HTML to prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    
    return str.replace(/[&<>"']/g, function(match) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match];
    });
}
