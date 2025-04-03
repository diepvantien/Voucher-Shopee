document.addEventListener('DOMContentLoaded', () => {

    // Danh sách các text không phải mã code thực tế cần ẩn nút copy
    const nonCodeTexts = [
        "Lưu trên Banner",
        "Có sẵn trong Ví",
        "Săn trên Live",
        "Lưu trong Ví/Banner", // Thêm các biến thể khác nếu có
        "Lưu tại mục Ưu đãi"
        // Thêm các cụm từ khác bạn dùng ở đây nếu cần
    ];

    // --- Chức năng ẩn nút copy dựa trên nội dung text của mã ---
    function hideNonCodeCopyButtons() {
        const voucherItems = document.querySelectorAll('.voucher-item');

        voucherItems.forEach(item => {
            const codeSpan = item.querySelector('.voucher-code');
            const copyButton = item.querySelector('.copy-btn');

            if (codeSpan && copyButton) {
                const codeText = codeSpan.textContent.trim();

                // Kiểm tra xem text có nằm trong danh sách nonCodeTexts không
                if (nonCodeTexts.includes(codeText)) {
                    copyButton.classList.add('hidden'); // Ẩn nút copy
                    codeSpan.classList.add('non-code'); // Thêm class để CSS style khác đi (tùy chọn)
                } else {
                     // Đảm bảo nút hiển thị và span không có class non-code nếu text là mã thật
                     copyButton.classList.remove('hidden');
                     codeSpan.classList.remove('non-code');
                }
            }
        });
    }

    // Gọi hàm ẩn nút ngay khi DOM tải xong
    hideNonCodeCopyButtons();

    // --- Chức năng sao chép mã ---
    const allCopyButtons = document.querySelectorAll('.copy-btn');
    allCopyButtons.forEach(button => {
        // Chỉ gắn listener nếu nút KHÔNG bị ẩn
        if (!button.classList.contains('hidden')) {
            button.addEventListener('click', () => {
                const textToCopy = button.getAttribute('data-clipboard-text');
                const originalText = button.textContent;
                const originalBgColor = button.style.backgroundColor;

                 // Kiểm tra mã hợp lệ (không rỗng, không phải placeholder, không phải non-code text)
                if (navigator.clipboard && textToCopy && textToCopy.trim() !== "" && !textToCopy.startsWith('[') && !nonCodeTexts.includes(textToCopy.trim())) {
                    navigator.clipboard.writeText(textToCopy)
                        .then(() => {
                            button.textContent = 'Đã sao chép!';
                            button.style.backgroundColor = '#198754';
                            setTimeout(() => {
                                button.textContent = originalText;
                                button.style.backgroundColor = originalBgColor || '';
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Lỗi sao chép: ', err);
                            button.textContent = 'Lỗi!';
                            button.style.backgroundColor = '#dc3545';
                            setTimeout(() => {
                                button.textContent = originalText;
                                button.style.backgroundColor = originalBgColor || '';
                            }, 2000);
                        });
                } else if (textToCopy && textToCopy.startsWith('[')) {
                     alert('Mã này chưa được cập nhật.');
                 } else {
                    // Mã không hợp lệ hoặc API không hỗ trợ (thường nút đã ẩn)
                    console.log('Hành động không hợp lệ cho nút này.');
                }
            });
        }
    });

    // --- Chức năng cập nhật ngày giờ hiện tại (Múi giờ Hà Nội GMT+7) ---
    function updateDateTime() {
        const dateTimeElement = document.getElementById('current-datetime');
        if (dateTimeElement) {
            try {
                const now = new Date();
                const options = {
                    year: 'numeric', month: 'numeric', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric',
                    hour12: false,
                    timeZone: 'Asia/Ho_Chi_Minh'
                };
                const formattedDateTime = now.toLocaleString('vi-VN', options);
                dateTimeElement.textContent = formattedDateTime;
            } catch (error) {
                console.error("Lỗi định dạng thời gian:", error);
                const now = new Date();
                 const fallbackOptions = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
                dateTimeElement.textContent = now.toLocaleString('vi-VN', fallbackOptions) + " (Local)";
            }
        }
    }

    // Gọi hàm cập nhật ngày giờ
    updateDateTime();

    // Optional: Cập nhật mỗi phút
    // setInterval(updateDateTime, 60000);

}); // Kết thúc DOMContentLoaded
