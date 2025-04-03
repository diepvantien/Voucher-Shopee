document.addEventListener('DOMContentLoaded', () => {

    // --- Chức năng ẩn nút copy khi không có mã ---
    function hideEmptyCopyButtons() {
        const copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach(button => {
            const textToCopy = button.getAttribute('data-clipboard-text');
            // Ẩn nút nếu data-clipboard-text không tồn tại, rỗng, hoặc chỉ chứa khoảng trắng
            if (!textToCopy || textToCopy.trim() === "") {
                button.classList.add('hidden'); // Thêm class CSS để ẩn nút
            }
        });
    }

    // Gọi hàm ẩn nút ngay khi DOM tải xong
    hideEmptyCopyButtons();

    // --- Chức năng sao chép mã ---
    const allCopyButtons = document.querySelectorAll('.copy-btn'); // Lấy lại tất cả nút để gắn listener
    allCopyButtons.forEach(button => {
        // Chỉ gắn listener nếu nút KHÔNG bị ẩn (tối ưu)
        if (!button.classList.contains('hidden')) {
            button.addEventListener('click', () => {
                const textToCopy = button.getAttribute('data-clipboard-text');
                const originalText = button.textContent;
                const originalBgColor = button.style.backgroundColor;

                // Kiểm tra mã hợp lệ trước khi sao chép (không rỗng, không phải placeholder)
                if (navigator.clipboard && textToCopy && textToCopy.trim() !== "" && !textToCopy.startsWith('[')) {
                    navigator.clipboard.writeText(textToCopy)
                        .then(() => {
                            // Thành công: đổi text và màu nút
                            button.textContent = 'Đã sao chép!';
                            button.style.backgroundColor = '#198754'; // Xanh lá
                            // Đặt lại sau 2 giây
                            setTimeout(() => {
                                button.textContent = originalText;
                                button.style.backgroundColor = originalBgColor || ''; // Trả lại màu gốc hoặc mặc định
                            }, 2000);
                        })
                        .catch(err => {
                            // Lỗi: đổi text và màu nút
                            console.error('Lỗi sao chép: ', err);
                            button.textContent = 'Lỗi!';
                            button.style.backgroundColor = '#dc3545'; // Đỏ
                             // Đặt lại sau 2 giây
                            setTimeout(() => {
                                button.textContent = originalText;
                                button.style.backgroundColor = originalBgColor || '';
                            }, 2000);
                        });
                } else if (textToCopy && textToCopy.startsWith('[')) {
                     // Thông báo nếu bấm vào nút có mã placeholder
                     alert('Mã này chưa được cập nhật. Vui lòng kiểm tra lại sau!');
                 } else {
                    // Trường hợp khác (API không hỗ trợ, mã không hợp lệ đã bị ẩn nhưng vẫn click được?)
                    console.error('Clipboard API không được hỗ trợ hoặc mã không hợp lệ.');
                    // Không cần alert vì nút gần như chắc chắn đã bị ẩn
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
                    hour12: false, // Định dạng 24 giờ
                    timeZone: 'Asia/Ho_Chi_Minh' // Đặt múi giờ Việt Nam
                };
                // Định dạng ngày giờ theo chuẩn Việt Nam và múi giờ đã chọn
                const formattedDateTime = now.toLocaleString('vi-VN', options);
                dateTimeElement.textContent = formattedDateTime;
            } catch (error) {
                // Fallback nếu trình duyệt không hỗ trợ timeZone hoặc có lỗi khác
                console.error("Lỗi định dạng thời gian:", error);
                const now = new Date();
                 const fallbackOptions = { // Options cơ bản hơn
                    year: 'numeric', month: 'numeric', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric',
                    hour12: false
                };
                dateTimeElement.textContent = now.toLocaleString('vi-VN', fallbackOptions) + " (Local)"; // Ghi chú là giờ local
            }
        }
    }

    // Gọi hàm cập nhật ngày giờ ngay khi DOM tải xong
    updateDateTime();

    // Optional: Cập nhật thời gian mỗi phút (thường không cần thiết cho trang tĩnh)
    // setInterval(updateDateTime, 60000);

}); // Kết thúc của addEventListener('DOMContentLoaded', ...)
