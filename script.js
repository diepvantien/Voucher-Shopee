document.addEventListener('DOMContentLoaded', () => {
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const textToCopy = button.getAttribute('data-clipboard-text');
            const originalText = button.textContent; // Lưu lại text gốc

            if (navigator.clipboard && textToCopy) {
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        // Thông báo thành công (thay đổi text nút)
                        button.textContent = 'Đã sao chép!';
                        button.style.backgroundColor = '#198754'; // Màu xanh lá cây

                        // Quay lại text gốc sau 2 giây
                        setTimeout(() => {
                            button.textContent = originalText;
                            button.style.backgroundColor = ''; // Xóa màu nền inline
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Không thể sao chép: ', err);
                        // Có thể thêm thông báo lỗi cho người dùng ở đây
                        button.textContent = 'Lỗi!';
                         setTimeout(() => {
                            button.textContent = originalText;
                        }, 2000);
                    });
            } else {
                // Fallback hoặc thông báo lỗi nếu clipboard API không được hỗ trợ
                console.error('Clipboard API không được hỗ trợ hoặc không có mã để sao chép.');
                alert('Trình duyệt của bạn không hỗ trợ sao chép tự động hoặc không có mã để sao chép.');
            }
        });
    });
});
