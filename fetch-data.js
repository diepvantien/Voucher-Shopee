// Function to fetch vouchers from Google Docs
async function fetchVouchers() {
    try {
        // Lấy dữ liệu từ Google Docs
        const docId = '1KZCnfEoQ4zpFv9tqO5Z625kBiw5KGQfGKhVyoZeb13w';
        const response = await fetch(`https://docs.google.com/document/d/${docId}/export?format=txt`);
        
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu từ Google Docs');
        }
        
        const text = await response.text();
        return parseVouchersFromText(text);
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        throw new Error('Không thể tải mã voucher từ Google Docs');
    }
}

// Parse text content from Google Docs into voucher objects
function parseVouchersFromText(text) {
    const vouchers = [];
    const lines = text.split('\n');
    
    let currentVoucher = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Bỏ qua dòng trống
        if (!line) continue;
        
        // Kiểm tra nếu dòng chứa mã voucher (VD: SHOPEE50K)
        if (line.match(/^[A-Z0-9]{5,}$/)) {
            // Nếu đã có voucher trước đó, thêm vào danh sách
            if (currentVoucher) {
                vouchers.push(currentVoucher);
            }
            
            // Bắt đầu voucher mới
            currentVoucher = {
                code: line,
                title: '',
                description: '',
                type: 'Voucher',
                category: detectCategory(lines[i-1] || '', lines[i+1] || '')
            };
        } 
        // Nếu dòng chứa "giảm" hoặc "freeship" và chưa có title
        else if (currentVoucher && !currentVoucher.title && 
                 (line.toLowerCase().includes('giảm') || 
                  line.toLowerCase().includes('freeship') || 
                  line.toLowerCase().includes('hoàn'))) {
            currentVoucher.title = line;
            
            // Phân loại voucher dựa trên tiêu đề
            if (!currentVoucher.category) {
                if (line.toLowerCase().includes('freeship')) {
                    currentVoucher.category = 'freeship';
                    currentVoucher.type = 'Freeship';
                } else if (line.toLowerCase().includes('giảm')) {
                    currentVoucher.category = 'discount';
                    currentVoucher.type = 'Giảm giá';
                } else if (line.toLowerCase().includes('hoàn')) {
                    currentVoucher.category = 'cashback';
                    currentVoucher.type = 'Hoàn tiền';
                }
            }
        } 
        // Nếu dòng chứa "hạn" hoặc "hết hạn"
        else if (currentVoucher && line.toLowerCase().includes('hạn')) {
            currentVoucher.validUntil = extractDate(line);
        }
        // Nếu dòng chứa "đơn tối thiểu" hoặc "tối thiểu"
        else if (currentVoucher && (line.toLowerCase().includes('đơn tối thiểu') || line.toLowerCase().includes('tối thiểu'))) {
            currentVoucher.minOrder = extractAmount(line);
        }
        // Các dòng khác được coi là mô tả
        else if (currentVoucher && line) {
            if (currentVoucher.description) {
                currentVoucher.description += ' ' + line;
            } else {
                currentVoucher.description = line;
            }
        }
    }
    
    // Thêm voucher cuối cùng nếu có
    if (currentVoucher) {
        vouchers.push(currentVoucher);
    }
    
    // Nếu không tìm thấy voucher nào, trả về dữ liệu mẫu
    if (vouchers.length === 0) {
        return getMockVouchers();
    }
    
    return vouchers;
}

// Helper function to detect voucher category from context
function detectCategory(prevLine, nextLine) {
    const text = (prevLine + ' ' + nextLine).toLowerCase();
    
    if (text.includes('freeship') || text.includes('miễn phí vận chuyển')) {
        return 'freeship';
    } else if (text.includes('giảm') || text.includes('giá')) {
        return 'discount';
    } else if (text.includes('hoàn') || text.includes('xu')) {
        return 'cashback';
    }
    
    return 'other';
}

// Helper function to extract date
function extractDate(text) {
    // Try to find date patterns like DD/MM/YYYY or D/M/YYYY
    const match = text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
    if (match) {
        return match[0];
    }
    return '';
}

// Helper function to extract amount
function extractAmount(text) {
    // Try to find amount patterns like 50K, 100K, 1 triệu, etc.
    const match = text.match(/\d+(\.\d+)?\s*(K|k|nghìn|triệu|tr)/);
    if (match) {
        return match[0];
    }
    return '';
}

// Dữ liệu mẫu cho trường hợp không parse được từ Google Docs
function getMockVouchers() {
    return [
        {
            title: "Giảm 50K cho đơn hàng từ 300K",
            description: "Áp dụng cho tất cả sản phẩm trên Shopee",
            code: "SHOPEE50K",
            type: "Giảm giá",
            category: "discount",
            validUntil: "30/04/2025",
            minOrder: "300K"
        },
        {
            title: "Freeship Xtra cho đơn từ 0Đ",
            description: "Áp dụng cho tất cả sản phẩm có gắn mác Freeship Xtra",
            code: "FREESHIP0D",
            type: "Freeship",
            category: "freeship",
            validUntil: "15/04/2025"
        },
        {
            title: "Hoàn 10% xu cho đơn hàng",
            description: "Hoàn tối đa 100.000 xu cho mỗi đơn hàng",
            code: "HOANXU10",
            type: "Hoàn xu",
            category: "cashback",
            validUntil: "10/04/2025",
            minOrder: "100K"
        }
    ];
}