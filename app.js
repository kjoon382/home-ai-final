document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('image-preview');
    const uploadPrompt = document.querySelector('.upload-prompt');
    const generateBtn = document.getElementById('generate-btn');
    const styleItems = document.querySelectorAll('.style-item');
    const loading = document.getElementById('loading');

    let selectedFile = null;
    let selectedStyle = 'modern';

    // Click to upload
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent-color)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--glass-border)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--glass-border)';
        handleFiles(e.dataTransfer.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            selectedFile = files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = 'block';
                uploadPrompt.style.display = 'none';
                generateBtn.disabled = false;
            };
            reader.readAsDataURL(selectedFile);
        }
    }

    // Style selection
    styleItems.forEach(item => {
        item.addEventListener('click', () => {
            styleItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            selectedStyle = item.getAttribute('data-style');
        });
    });

    // Generate Design
    generateBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        loading.style.display = 'flex';

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: preview.src, // Base64 from FileReader
                    style: selectedStyle
                })
            });

            const data = await response.json();
            loading.style.display = 'none';

            if (data.status === 'success' || data.output) {
                const outputUrl = data.output[0];
                // Update preview to show the generated image
                preview.src = outputUrl;
                alert('혁신적인 새로운 디자인이 탄생했습니다!');
            } else {
                alert('오류: ' + (data.error || '디자인 생성에 실패했습니다.'));
            }
        } catch (error) {
            loading.style.display = 'none';
            console.error('Error:', error);
            alert('서버와 통신하는 중 오류가 발생했습니다. (서버가 켜져 있는지 확인해주세요)');
        }
    });
});
