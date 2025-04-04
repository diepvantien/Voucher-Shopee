// Dữ liệu voucher tĩnh - được trích xuất từ Google Docs
const VOUCHERS_DATA = [
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
    },
    {
        code: "CPNEW25",
        title: "Giảm 25K",
        description: "Dành cho người dùng mới",
        category: "discount",
        type: "Giảm giá",
        validUntil: "31/05/2025",
        minOrder: "50K"
    },
    {
        code: "ELMTCB10",
        title: "Hoàn 10% xu",
        description: "Áp dụng cho đơn hàng Shopee Mall",
        category: "cashback",
        type: "Hoàn xu",
        validUntil: "15/04/2025",
        minOrder: "500K"
    },
    {
        code: "SPPCOINELM",
        title: "Hoàn 100K xu",
        description: "Lần đầu thanh toán qua ví SPayLater",
        category: "cashback",
        type: "Hoàn xu",
        validUntil: "10/04/2025"
    },
    {
        code: "NEWMALL25",
        title: "Giảm 25K đơn Shopee Mall",
        description: "Áp dụng cho sản phẩm tại Shopee Mall",
        category: "discount",
        type: "Giảm giá",
        validUntil: "30/04/2025",
        minOrder: "250K"
    },
    {
        code: "SPPCOIN88",
        title: "Hoàn 15% xu",
        description: "Tối đa 70K, đơn tối thiểu 300K",
        category: "cashback",
        type: "Hoàn xu",
        validUntil: "30/04/2025",
        minOrder: "300K"
    },
    {
        code: "MALLCT100",
        title: "Giảm 100K đơn Shopee Mall",
        description: "Áp dụng cho sản phẩm tại Shopee Mall",
        category: "discount",
        type: "Giảm giá",
        validUntil: "15/04/2025",
        minOrder: "1000K"
    },
    {
        code: "SPPFOOD40",
        title: "Giảm 40K ShopeeFood",
        description: "Đặt món từ ShopeeFood",
        category: "discount",
        type: "Giảm giá",
        validUntil: "15/04/2025",
        minOrder: "120K"
    },
    {
        code: "TOANCAU8K4",
        title: "Giảm 8K đơn hàng quốc tế",
        description: "Áp dụng cho đơn hàng quốc tế",
        category: "discount",
        type: "Giảm giá",
        validUntil: "10/04/2025",
        minOrder: "50K"
    },
    {
        code: "NEWTOALL",
        title: "Voucher toàn sàn",
        description: "Giảm 10% tối đa 100K",
        category: "discount",
        type: "Giảm giá",
        validUntil: "20/04/2025",
        minOrder: "500K"
    }
];

// Hàm để thêm voucher từ Google Docs một cách an toàn tránh CORS
async function fetchVouchers() {
    try {
        // Thử tải dữ liệu từ Google Docs Web App (nếu đã cài đặt)
        const docId = '1KZCnfEoQ4zpFv9tqO5Z625kBiw5KGQfGKhVyoZeb13w';
        const scriptUrl = `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?docId=${docId}`;
        
        try {
            const response = await fetch(scriptUrl);
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    console.log('Loaded data from Google Apps Script');
                    return data;
                }
            }
        } catch (e) {
            console.log('Could not load from Google Apps Script, using static data');
        }
        
        // Nếu không thành công, sử dụng dữ liệu tĩnh
        return VOUCHERS_DATA;
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        return VOUCHERS_DATA;
    }
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
                if (line.toLowerCase().includes('freeship') || line.toLowerCase().includes('miễn phí vận chuyển')) {
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
