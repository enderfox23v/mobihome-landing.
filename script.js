document.addEventListener('DOMContentLoaded', () => {
    // ================= SCROLL-DRIVEN CANVAS ANIMATION =================
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const context = canvas.getContext('2d');
        const scrollHero = document.getElementById('scroll-hero');
        const frameCount = 184; // Tổng số frame
        const currentFrame = index => (
            `frames/ezgif-frame-${index.toString().padStart(3, '0')}.png`
        );

        const images = [];
        let imagesLoaded = 0;

        // Preload toàn bộ hình ảnh
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            images.push(img);
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === 1) {
                    // Vẽ frame đầu tiên ngay khi tải xong
                    drawFrame(1);
                }
            };
        }

        const drawFrame = (index) => {
            if (!images[index - 1] || !images[index - 1].complete) return;
            
            // Xử lý object-fit: cover cho canvas
            const img = images[index - 1];
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;
            
            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            let drawX = 0;
            let drawY = 0;

            if (canvasRatio > imgRatio) {
                drawHeight = canvas.width / imgRatio;
                drawY = (canvas.height - drawHeight) / 2;
            } else {
                drawWidth = canvas.height * imgRatio;
                drawX = (canvas.width - drawWidth) / 2;
            }

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        };

        const updateCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Vẽ lại frame hiện tại khi resize
            const scrollTop = window.scrollY;
            const heroOffsetTop = scrollHero.offsetTop;
            const maxScroll = scrollHero.scrollHeight - window.innerHeight;
            let scrollProgress = (scrollTop - heroOffsetTop) / maxScroll;
            scrollProgress = Math.max(0, Math.min(1, scrollProgress));
            const frameIndex = Math.min(
                frameCount - 1,
                Math.floor(scrollProgress * frameCount)
            );
            drawFrame(frameIndex + 1);
        };

        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize(); // Cập nhật kích thước lần đầu

        // Animation Loop tối ưu với requestAnimationFrame
        let lastKnownScrollPosition = 0;
        let ticking = false;

        window.addEventListener('scroll', () => {
            lastKnownScrollPosition = window.scrollY;

            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const heroOffsetTop = scrollHero.offsetTop;
                    const maxScroll = scrollHero.scrollHeight - window.innerHeight;
                    
                    if (lastKnownScrollPosition >= heroOffsetTop && lastKnownScrollPosition <= heroOffsetTop + maxScroll) {
                        let scrollProgress = (lastKnownScrollPosition - heroOffsetTop) / maxScroll;
                        scrollProgress = Math.max(0, Math.min(1, scrollProgress));
                        
                        const frameIndex = Math.min(
                            frameCount - 1,
                            Math.floor(scrollProgress * frameCount)
                        );
                        
                        drawFrame(frameIndex + 1);
                        
                        // Thêm hiệu ứng cho text (tùy chọn)
                        const overlayContent = document.querySelector('.hero-overlay-content');
                        if (overlayContent) {
                            const opacity = Math.max(0, 1 - scrollProgress * 1.5);
                            const translateY = scrollProgress * 100;
                            overlayContent.style.opacity = opacity;
                            overlayContent.style.transform = `translateY(${translateY}px)`;
                        }
                    }
                    
                    ticking = false;
                });

                ticking = true;
            }
        });
    }

    // ================= FAQ ACCORDION =================
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const isActive = faqItem.classList.contains('active');

            // Close all other items (optional, remove if you want multiple open)
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-answer').style.maxHeight = null;
            });

            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // ================= SMOOTH SCROLLING =================
    const ctaBtn = document.getElementById('ctaBtn');
    const bookingSection = document.getElementById('booking-section');

    if (ctaBtn && bookingSection) {
        ctaBtn.addEventListener('click', () => {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ================= WEB SHARE API / COPY LINK =================
    const shareBtn = document.getElementById('shareBtn');
    const toast = document.getElementById('toast');

    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareData = {
                title: 'Mobihome KTPM Nhóm 1 - Dịch vụ Thuê Xe RV/Motorhome',
                text: 'Cùng khám phá thế giới theo cách riêng của bạn với dịch vụ cho thuê xe nhà lưu động (RV/Motorhome) đẳng cấp.',
                url: window.location.href
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    console.error('Lỗi khi chia sẻ:', err);
                }
            } else {
                // Fallback: Copy link to clipboard
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    showToast('Đã sao chép đường dẫn!');
                } catch (err) {
                    showToast('Không thể sao chép đường dẫn.');
                }
            }
        });
    }

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ================= FORM VALIDATION =================
    const form = document.getElementById('bookingForm');
    const successMessage = document.getElementById('successMessage');
    const resetBtn = document.getElementById('resetBtn');

    if (form) {
        // Prevent default validation
        form.setAttribute('novalidate', true);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            // 1. Validate Text Inputs (Họ tên)
            const fullName = document.getElementById('fullName');
            if (fullName.value.trim() === '') {
                setError(fullName);
                isValid = false;
            } else {
                setSuccess(fullName);
            }

            // 2. Validate Age (>= 18)
            const age = document.getElementById('age');
            if (age.value.trim() === '' || parseInt(age.value) < 18) {
                setError(age);
                isValid = false;
            } else {
                setSuccess(age);
            }

            // 3. Validate Phone (10-11 digits)
            const phone = document.getElementById('phone');
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(phone.value.trim())) {
                setError(phone);
                isValid = false;
            } else {
                setSuccess(phone);
            }

            // 4. Validate Email
            const email = document.getElementById('email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value.trim())) {
                setError(email);
                isValid = false;
            } else {
                setSuccess(email);
            }

            // 5. Validate Dates
            const pickupDate = document.getElementById('pickupDate');
            const returnDate = document.getElementById('returnDate');
            
            if (pickupDate.value === '') {
                setError(pickupDate);
                isValid = false;
            } else {
                setSuccess(pickupDate);
            }

            if (returnDate.value === '' || (pickupDate.value && new Date(returnDate.value) <= new Date(pickupDate.value))) {
                setError(returnDate);
                isValid = false;
            } else {
                setSuccess(returnDate);
            }

            // 6. Validate Selects (Loại xe, Kiểu xe, Thanh toán)
            const selects = ['vehicleType', 'vehicleClass', 'paymentMethod'];
            selects.forEach(id => {
                const el = document.getElementById(id);
                if (el.value === '') {
                    setError(el);
                    isValid = false;
                } else {
                    setSuccess(el);
                }
            });

            // If form is valid, submit (simulate success)
            if (isValid) {
                // Here you would typically send data to a server using fetch()
                form.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // Reset form when clicking "Đặt chuyến đi khác"
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            form.reset();
            // Remove success classes
            const controls = form.querySelectorAll('.form-control');
            controls.forEach(control => control.classList.remove('success', 'error'));
            
            successMessage.style.display = 'none';
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // Helper functions for validation
    function setError(input) {
        const formControl = input.closest('.form-control');
        formControl.classList.add('error');
        formControl.classList.remove('success');
    }

    function setSuccess(input) {
        const formControl = input.closest('.form-control');
        formControl.classList.remove('error');
        formControl.classList.add('success');
    }

    // Real-time validation removal on input
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const formControl = input.closest('.form-control');
            if (formControl.classList.contains('error')) {
                formControl.classList.remove('error');
            }
        });
    });
});

// ================= CAR GALLERY SWITCHER =================
window.switchGallery = function(btn, type) {
    const card = btn.closest('.pricing-card');
    const images = card.querySelectorAll('.gallery-img');
    const buttons = card.querySelectorAll('.gallery-btn');
    
    images.forEach(img => {
        if (img.getAttribute('data-type') === type) {
            img.classList.add('active');
        } else {
            img.classList.remove('active');
        }
    });
    
    buttons.forEach(b => {
        b.classList.remove('active');
    });
    
    btn.classList.add('active');
};
