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
    const sections = text.split(/\n\s*\n/); // Tách các đoạn văn bản riêng biệt
    
    for (let section of sections) {
        if (!section.trim()) continue;
        
        // Xử lý từng phần nội dung
        const lines = section.trim().split('\n');
        const voucherInfo = processVoucherSection(lines);
        
        if (voucherInfo && voucherInfo.code) {
            vouchers.push(voucherInfo);
        }
    }
    
    // Xử lý thêm lần cuối để tìm các voucher không thuộc section riêng biệt
    if (vouchers.length === 0) {
        const lines = text.split('\n');
        let i = 0;
        
        while (i < lines.length) {
            // Tìm dòng có thể là mã voucher
            if (isVoucherCode(lines[i])) {
                const code = lines[i].trim();
                let title = '';
                let description = '';
                let validUntil = '';
                let minOrder = '';
                let category = 'other';
                let type = 'Voucher';
                
                // Tìm thông tin từ dòng trước và sau mã voucher
                let prevIdx = i - 1;
                let nextIdx = i + 1;
                
                // Kiểm tra các dòng trước để tìm tiêu đề và phân loại
                while (prevIdx >= 0 && prevIdx > i - 5) {
                    if (lines[prevIdx] && lines[prevIdx].trim()) {
                        if (!title) {
                            title = lines[prevIdx].trim();
                            category = detectCategory(lines[prevIdx]);
                            type = getCategoryType(category);
                        } else if (!description) {
                            description = lines[prevIdx].trim();
                        }
                    }
                    prevIdx--;
                }
                
                // Kiểm tra các dòng sau để tìm mô tả và hạn sử dụng
                while (nextIdx < lines.length && nextIdx < i + 5) {
                    const line = lines[nextIdx] ? lines[nextIdx].trim() : '';
                    if (line) {
                        if (line.toLowerCase().includes('hạn')) {
                            validUntil = extractDate(line);
                        } else if (line.toLowerCase().includes('tối thiểu') || line.toLowerCase().includes('đơn')) {
                            minOrder = extractAmount(line);
                        } else if (!description) {
                            description = line;
                        }
                    }
                    nextIdx++;
                }
                
                // Nếu không có tiêu đề thì dùng code làm tiêu đề
                if (!title) {
                    title = `Mã voucher: ${code}`;
                }
                
                vouchers.push({
                    code,
                    title,
                    description,
                    validUntil,
                    minOrder,
                    category,
                    type
                });
            }
            i++;
        }
    }
    
    // Nếu vẫn không tìm thấy voucher, trả về dữ liệu mẫu
    if (vouchers.length === 0) {
        return getMockVouchers();
    }
    
    return vouchers;
}

// Kiểm tra một dòng có phải là mã voucher không
function isVoucherCode(line) {
    if (!line) return false;
    
    line = line.trim();
    // Mã voucher thường là chữ hoa và số, ít nhất 5 kí tự và không quá 20 kí tự
    return /^[A-Z0-9]{5,20}$/.test(line) || 
           // Hoặc có thể có gạch dưới, dấu gạch ngang
           /^[A-Z0-9_-]{5,20}$/.test(line) ||
           // Hoặc những định dạng phổ biến của mã Shopee
           /^(SHOPEE|SP|MALL|CB|FS|FOOD)[A-Z0-9_-]{2,18}$/.test(line);
}

// Xử lý một section văn bản có thể chứa voucher
function processVoucherSection(lines) {
    let code = '';
    let title = '';
    let description = '';
    let validUntil = '';
    let minOrder = '';
    let category = 'other';
    let type = 'Voucher';
    
    // Tìm mã voucher trước
    for (let line of lines) {
        if (isVoucherCode(line)) {
            code = line.trim();
            break;
        }
    }
    
    // Nếu không tìm thấy mã voucher, đây không phải là section chứa voucher
    if (!code) return null;
    
    // Tìm thông tin khác
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line === code) continue;
        
        if (!title && line && line.length > 3) {
            title = line;
            category = detectCategory(line);
            type = getCategoryType(category);
        } else if (line.toLowerCase().includes('hạn')) {
            validUntil = extractDate(line);
        } else if (line.toLowerCase().includes('tối thiểu') || line.toLowerCase().includes('đơn')) {
            minOrder = extractAmount(line);
        } else if (line && line.length > 3 && !description) {
            description = line;
        }
    }
    
    return {
        code,
        title: title || `Mã voucher: ${code}`,
        description,
        validUntil,
        minOrder,
        category,
        type
    };
}

// Helper function to detect voucher category from text
function detectCategory(text) {
    if (!text) return 'other';
    
    text = text.toLowerCase();
    
    if (text.includes('freeship') || text.includes('miễn phí vận chuyển') || text.includes('free ship')) {
        return 'freeship';
    } else if (text.includes('giảm') || text.includes('giá') || text.includes('sale') || text.match(/\d+k/i)) {
        return 'discount';
    } else if (text.includes('hoàn') || text.includes('xu') || text.includes('coin') || text.includes('cashback')) {
        return 'cashback';
    }
    
    return 'other';
}

// Get category display type
function getCategoryType(category) {
    switch(category) {
        case 'freeship':
            return 'Freeship';
        case 'discount':
            return 'Giảm giá';
        case 'cashback':
            return 'Hoàn xu';
        default:
            return 'Voucher';
    }
}

// Helper function to extract date
function extractDate(text) {
    if (!text) return '';
    
    // Try to find date patterns like DD/MM/YYYY or D/M/YYYY
    const dateMatch = text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
    if (dateMatch) {
        return dateMatch[0];
    }
    
    // Try to find date patterns like "đến ngày DD/MM" or "hết hạn DD/MM"
    const shortDateMatch = text.match(/\d{1,2}\/\d{1,2}/);
    if (shortDateMatch) {
        // Thêm năm hiện tại nếu không có
        const currentYear = new Date().getFullYear();
        return `${shortDateMatch[0]}/${currentYear}`;
    }
    
    return '';
}

// Helper function to extract amount
function extractAmount(text) {
    if (!text) return '';
    
    // Try to find amount patterns like 50K, 100K, 1 triệu, etc.
    const match = text.match(/\d+(\.\d+)?\s*(K|k|nghìn|triệu|tr)/);
    if (match) {
        return match[0];
    }
    
    // Try to find amount patterns like 50.000đ, 100.000đ, etc.
    const amountMatch = text.match(/\d+(\.\d+)?\s*(đ|đồng|vnd)/i);
    if (amountMatch) {
        return amountMatch[0];
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
