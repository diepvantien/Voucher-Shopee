document.addEventListener('DOMContentLoaded', () => {

    // --- Chức năng sao chép mã ---
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const textToCopy = button.getAttribute('data-clipboard-text');
            const originalText = button.textContent; // Lưu lại text gốc
            const originalBgColor = button.style.backgroundColor; // Lưu màu nền gốc (nếu có)

            if (navigator.clipboard && textToCopy && textToCopy !== '[NHẬP MÃ VÀO ĐÂY]') { // Thêm kiểm tra placeholder
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        // Thông báo thành công (thay đổi text nút và màu)
                        button.textContent = 'Đã sao chép!';
                        button.style.backgroundColor = '#198754'; // Màu xanh lá cây

                        // Quay lại text và màu gốc sau 2 giây
                        setTimeout(() => {
                            button.textContent = originalText;
                            button.style.backgroundColor = originalBgColor || ''; // Trả lại màu gốc hoặc mặc định
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Không thể sao chép: ', err);
                        button.textContent = 'Lỗi!';
                         button.style.backgroundColor = '#dc3545'; // Màu đỏ lỗi
                         setTimeout(() => {
                            button.textContent = originalText;
                            button.style.backgroundColor = originalBgColor || '';
                        }, 2000);
                    });
            } else if (textToCopy === '[NHẬP MÃ VÀO ĐÂY]') {
                 // Thông báo nếu người dùng bấm nút chưa có mã
                 alert('Mã này chưa được cập nhật. Vui lòng quay lại sau!');
            }
             else {
                console.error('Clipboard API không được hỗ trợ hoặc không có mã để sao chép.');
                alert('Trình duyệt của bạn không hỗ trợ sao chép tự động hoặc không có mã để sao chép.');
            }
        });
    });

    // --- Chức năng cập nhật ngày giờ hiện tại ---
    function updateDateTime() {
        const dateTimeElement = document.getElementById('current-datetime');
        if (dateTimeElement) {
            const now = new Date();
            const options = {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false // Sử dụng định dạng 24 giờ
            };
            // Định dạng ngày giờ theo chuẩn Việt Nam
            const formattedDateTime = now.toLocaleString('vi-VN', options);
            dateTimeElement.textContent = formattedDateTime;
        }
    }

    // Gọi hàm cập nhật ngày giờ ngay khi DOM tải xong
    updateDateTime();

    // Optional: Cập nhật thời gian mỗi phút nếu muốn (thường không cần thiết cho trang tĩnh)
    // setInterval(updateDateTime, 60000);

}); // Kết thúc của addEventListener('DOMContentLoaded', ...)
