// Dữ liệu voucher tĩnh - được trích xuất từ Google Docs
const VOUCHERS_DATA = [
    // Dữ liệu tĩnh dự phòng khi không kết nối được với Google Apps Script
    {
        code: "GOFREE25425",
        title: "Freeship 15K",
        description: "Đơn hàng từ 0Đ",
        category: "freeship",
        type: "Freeship",
        validUntil: "30/04/2025"
    },
    {
        code: "GOFREE25424",
        title: "Freeship Extra",
        description: "Giảm 70K phí vận chuyển",
        category: "freeship",
        type: "Freeship",
        validUntil: "30/04/2025",
        minOrder: "150K"
    },
    {
        code: "CPNEW50",
        title: "Giảm 50K",
        description: "Dành cho người dùng mới",
        category: "discount",
        type: "Giảm giá",
        validUntil: "31/05/2025",
        minOrder: "150K"
    }
    // Các voucher khác có thể được thêm vào đây
];

// Hàm để lấy voucher từ Google Apps Script
async function fetchVouchers() {
    try {
        // Sử dụng Google Apps Script URL đã cung cấp
        const scriptUrl = "https://script.google.com/macros/s/AKfycbxGI2QD3mOc6ZvPuLxCuCcvb0-gbZ6t9hbYZRmt7rW7UvNyD1xDFV59FQ5n_cdCue_VsA/exec";
        const docId = '1KZCnfEoQ4zpFv9tqO5Z625kBiw5KGQfGKhVyoZeb13w';
        const fullUrl = `${scriptUrl}?docId=${docId}`;
        
        console.log("Đang tải dữ liệu từ Google Apps Script...");
        
        // Thêm timestamp để tránh cache
        const timestamp = new Date().getTime();
        const response = await fetch(`${fullUrl}&t=${timestamp}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
            
        if (response.ok) {
            const data = await response.json();
            
            if (data && Array.isArray(data) && data.length > 0) {
                console.log('Tải thành công từ Google Apps Script:', data.length, 'vouchers');
                return data;
            } else if (data && data.error) {
                console.error('Lỗi từ Google Apps Script:', data.error);
            }
        } else {
            console.error('Không thể kết nối với Google Apps Script:', response.status);
        }
    } catch (e) {
        console.error('Lỗi khi tải từ Google Apps Script:', e);
    }
    
    // Nếu không thành công, sử dụng dữ liệu tĩnh
    console.log('Sử dụng dữ liệu tĩnh thay thế');
    return VOUCHERS_DATA;
}

// Để thêm voucher thủ công từ Google Docs
function parseDocContent(text) {
    // Hướng dẫn cách sử dụng:
    // 1. Mở Google Docs bằng app trên điện thoại hoặc trình duyệt
    // 2. Chọn toàn bộ văn bản (Ctrl+A)
    // 3. Copy
    // 4. Mở console của trình duyệt (F12)
    // 5. Dán văn bản vào trong dấu ngoặc kép: parseDocContent("dán văn bản ở đây")
    // 6. Copy kết quả JSON để cập nhật biến VOUCHERS_DATA

    const vouchers = [];
    const lines = text.split('\n');
    
    let currentVoucher = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) continue;
        
        // Kiểm tra nếu dòng chứa mã voucher (chữ hoa và số, ít nhất 5 kí tự)
        if (/^[A-Z0-9_-]{5,}$/.test(line)) {
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
                category: 'other'
            };
        } 
        // Xử lý thông tin khác của voucher
        else if (currentVoucher) {
            if (!currentVoucher.title) {
                currentVoucher.title = line;
                // Phân loại voucher dựa trên tiêu đề
                if (line.toLowerCase().includes('freeship') || line.toLowerCase().includes('miễn phí vận chuyển') || line.toLowerCase().includes('free ship')) {
                    currentVoucher.category = 'freeship';
                    currentVoucher.type = 'Freeship';
                } else if (line.toLowerCase().includes('giảm') || line.toLowerCase().includes('giá')) {
                    currentVoucher.category = 'discount';
                    currentVoucher.type = 'Giảm giá';
                } else if (line.toLowerCase().includes('hoàn') || line.toLowerCase().includes('xu')) {
                    currentVoucher.category = 'cashback';
                    currentVoucher.type = 'Hoàn xu';
                }
            } 
            else if (line.toLowerCase().includes('hạn') && !currentVoucher.validUntil) {
                const match = line.match(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/);
                if (match) {
                    currentVoucher.validUntil = match[0];
                }
            }
            else if ((line.toLowerCase().includes('đơn') || line.toLowerCase().includes('tối thiểu')) && !currentVoucher.minOrder) {
                const match = line.match(/\d+(\.\d+)?\s*(K|k|nghìn|triệu|tr|đ|đồng|vnd)/i);
                if (match) {
                    currentVoucher.minOrder = match[0];
                }
            }
            else if (!currentVoucher.description) {
                currentVoucher.description = line;
            }
        }
    }
    
    // Thêm voucher cuối cùng nếu có
    if (currentVoucher) {
        vouchers.push(currentVoucher);
    }
    
    console.log(JSON.stringify(vouchers, null, 2));
    return vouchers;
}
