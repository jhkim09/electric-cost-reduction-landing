// 전기요금 절감 랜딩페이지 JavaScript

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    initializeForm();
});

// ROI 계산기 전역 함수
function calculateSavings() {
    const monthlyBillInput = document.getElementById('monthly-bill');
    const monthlySavingsEl = document.getElementById('monthly-savings');
    const yearlySavingsEl = document.getElementById('yearly-savings');
    
    const monthlyBill = parseFloat(monthlyBillInput.value) || 0;
    const savingsRate = 0.25; // 25% 평균 절감률
    
    const monthlySavings = monthlyBill * savingsRate;
    const yearlySavings = monthlySavings * 12;

    monthlySavingsEl.textContent = formatCurrency(monthlySavings);
    yearlySavingsEl.textContent = formatCurrency(yearlySavings);

    // 애니메이션 효과
    if (monthlyBill > 0) {
        monthlySavingsEl.style.color = 'var(--primary-yellow)';
        yearlySavingsEl.style.color = 'var(--primary-yellow)';
        
        // 결과 섹션 표시 애니메이션
        const resultSection = document.getElementById('calculator-result');
        resultSection.style.opacity = '0';
        resultSection.style.transform = 'translateY(10px)';
        resultSection.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            resultSection.style.opacity = '1';
            resultSection.style.transform = 'translateY(0)';
        }, 100);
        
        // Google Analytics 이벤트 추적
        if (typeof gtag !== 'undefined') {
            gtag('event', 'calculator_used', {
                'event_category': 'engagement',
                'value': monthlyBill
            });
        }
        
        // Meta Pixel 이벤트 추적
        if (typeof fbq !== 'undefined') {
            fbq('track', 'ViewContent', {
                content_name: 'Savings Calculator',
                value: monthlySavings,
                currency: 'KRW'
            });
        }
    }
}

// ROI 계산기 초기화
function initializeCalculator() {
    const monthlyBillInput = document.getElementById('monthly-bill');
    
    monthlyBillInput.addEventListener('input', function() {
        calculateSavings();
    });
}

// 통화 포맷팅
function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// 탭 전환 기능
function switchTab(tabType) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 탭 버튼 활성화
    event.target.classList.add('active');
    
    // 모든 탭 컨텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 선택된 탭 컨텐츠 표시
    if (tabType === 'basic') {
        document.getElementById('basic-tab').classList.add('active');
    } else if (tabType === 'power') {
        document.getElementById('power-tab').classList.add('active');
    }
}

// 폼 초기화
function initializeForm() {
    const form = document.getElementById('bill-form');
    const kakaoButton = document.querySelector('.kakao-button');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    if (kakaoButton) {
        kakaoButton.addEventListener('click', handleKakaoConnect);
    }
    
    // 파일 업로드 처리
    const fileInput = document.getElementById('bill-upload');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
}

// 폼 제출 처리
function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // 유효성 검사
    if (!validateForm(data)) {
        return;
    }
    
    // 로딩 표시
    const submitButton = event.target.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    submitButton.textContent = '📤 전송 중...';
    submitButton.disabled = true;
    
    // 실제 환경에서는 서버로 데이터 전송
    setTimeout(() => {
        showSuccessMessage();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        event.target.reset();
    }, 2000);
}

// 폼 유효성 검사
function validateForm(data) {
    const requiredFields = ['company-name', 'contact-name', 'phone'];
    
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            alert(`${getFieldLabel(field)}을(를) 입력해주세요.`);
            return false;
        }
    }
    
    // 전화번호 형식 검증
    const phonePattern = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
    if (data.phone && !phonePattern.test(data.phone)) {
        // 자동 포맷팅 시도
        const formattedPhone = formatPhoneNumber(data.phone);
        document.getElementById('phone').value = formattedPhone;
    }
    
    return true;
}

// 필드 라벨 반환
function getFieldLabel(fieldName) {
    const labels = {
        'company-name': '회사명',
        'contact-name': '담당자명',
        'phone': '연락처'
    };
    return labels[fieldName] || fieldName;
}

// 전화번호 자동 포맷팅
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2,3})(\d{3,4})(\d{4})$/);
    
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }
    
    return phone;
}

// 파일 업로드 처리
function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    const maxFiles = 3;
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (files.length > maxFiles) {
        alert(`최대 ${maxFiles}개의 파일만 업로드 가능합니다.`);
        event.target.value = '';
        return;
    }
    
    for (let file of files) {
        if (file.size > maxSize) {
            alert(`파일 크기는 5MB 이하만 가능합니다. (${file.name})`);
            event.target.value = '';
            return;
        }
        
        if (!isValidFileType(file)) {
            alert(`지원하지 않는 파일 형식입니다. (${file.name})`);
            event.target.value = '';
            return;
        }
    }
    
    // 파일 미리보기 (선택사항)
    showFilePreview(files);
}

// 파일 형식 검증
function isValidFileType(file) {
    const validTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/pdf'
    ];
    
    return validTypes.includes(file.type);
}

// 파일 미리보기 표시
function showFilePreview(files) {
    const previewContainer = document.createElement('div');
    previewContainer.className = 'file-preview';
    previewContainer.innerHTML = '<h4>업로드된 파일:</h4>';
    
    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span class="file-name">📎 ${file.name}</span>
            <span class="file-size">(${formatFileSize(file.size)})</span>
        `;
        previewContainer.appendChild(fileItem);
    });
    
    // 기존 미리보기 제거
    const existingPreview = document.querySelector('.file-preview');
    if (existingPreview) {
        existingPreview.remove();
    }
    
    // 파일 입력 필드 다음에 미리보기 추가
    const fileInput = document.getElementById('bill-upload');
    fileInput.parentNode.appendChild(previewContainer);
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 카카오톡 연결 처리
function handleKakaoConnect() {
    // 카카오톡 채널 URL
    const kakaoChannelUrl = 'http://pf.kakao.com/_gwwtd/chat';
    
    // 새 창에서 열기
    window.open(kakaoChannelUrl, '_blank', 'width=500,height=600');
    
    // 사용자에게 안내 메시지 표시
    alert('카카오톡 채널이 새 창에서 열립니다.\n\n1. https://pp.kepco.co.kr/ 에서 회원가입을 먼저 해주세요\n2. 카카오톡 채널에 다음 정보를 남겨주세요:\n   - 파워플래너 아이디/비밀번호\n   - 담당자 연락처\n   - 회사명\n\n상세히 검토하여 연락드리겠습니다.');
    
    // Google Analytics 이벤트 추적
    if (typeof gtag !== 'undefined') {
        gtag('event', 'kakao_connect', {
            'event_category': 'engagement',
            'event_label': 'power_planner'
        });
    }
    
    // Meta Pixel 이벤트 추적
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Contact', {
            content_name: 'Kakao Connect',
            content_category: 'power_planner'
        });
    }
}

// 성공 메시지 표시
function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <div class="success-icon">✅</div>
            <h3>신청이 완료되었습니다!</h3>
            <p>전문가가 검토 후 24시간 내에 연락드리겠습니다.</p>
            <button onclick="this.parentElement.parentElement.remove()" class="close-button">확인</button>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // 자동으로 5초 후 제거
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 5000);
}

// 스크롤 애니메이션
function scrollToForm() {
    document.getElementById('contact-form').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    
    // Google Analytics 이벤트 추적
    if (typeof gtag !== 'undefined') {
        gtag('event', 'scroll_to_form', {
            'event_category': 'engagement',
            'event_label': 'cta_button'
        });
    }
    
    // Meta Pixel 이벤트 추적
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead');
    }
}

// 스크롤 이벤트 처리
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    
    if (window.scrollY > 100) {
        header.style.background = 'rgba(26, 26, 26, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'var(--primary-black)';
        header.style.backdropFilter = 'none';
    }
});

// 전화번호 입력 필드 실시간 포맷팅
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    
    phoneInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        
        if (value.length >= 3 && value.length <= 7) {
            value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
        } else if (value.length >= 8) {
            value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }
        
        this.value = value;
    });
});