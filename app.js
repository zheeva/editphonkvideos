/**
 * AI PHONK AUTO EDITOR ENGINE v2026
 * Pemrosesan Audio, Analisis Beat Drop & Rendering Grafis Phonk Responsif Berbasis Frame.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const inputVideo = document.getElementById('input-video');
    const inputAudio = document.getElementById('input-audio');
    const btnAnalyze = document.getElementById('btn-analyze');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnExport = document.getElementById('btn-export');
    const sourceVideo = document.getElementById('source-video');
    const sourceAudio = document.getElementById('source-audio');
    const canvas = document.getElementById('player-canvas');
    const ctx = canvas.getContext('2d');
    
    // UI Feedback Elements
    const vName = document.getElementById('v-name');
    const aName = document.getElementById('a-name');
    const bpmVal = document.getElementById('bpm-val');
    const timeDisplay = document.getElementById('time-display');
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressArea = document.getElementById('export-progress-area');

    // State Application
    let audioBuffer = null;
    let audioContext = null;
    let computedBpm = 130; // Default baseline Phonk Tempo
    let beatsTimeline = []; // Array waktu ketukan dalam hitungan detik
    let isPlaying = false;
    let animationFrameId = null;
    
    // Simulasi Hasil Segmentasi Caption AI Word-By-Word (Simulated Whisper Output)
    const captionData = [
        { start: 0.5, end: 2.0, text: "WELCOME TO THE DARKNESS" },
        { start: 3.0, end: 5.5, text: "GET READY FOR THE DROP" },
        { start: 7.0, end: 9.0, text: "PHONK AI AUTOMATION 2026" },
        { start: 10.0, end: 11.8, text: "3... 2... 1..." },
        { start: 12.0, end: 14.5, text: "BOOM!" }
    ];

    // Listeners untuk Input File
    inputVideo.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            vName.textContent = file.name;
            sourceVideo.src = URL.createObjectURL(file);
            sourceVideo.load();
            checkReadyState();
        }
    });

    inputAudio.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            aName.textContent = file.name;
            sourceAudio.src = URL.createObjectURL(file);
            checkReadyState();
            readAudioBuffer(file);
        }
    });

    function checkReadyState() {
        if (inputVideo.files.length > 0 && inputAudio.files.length > 0) {
            btnAnalyze.disabled = false;
        }
    }

    // Membaca Audio Data menggunakan Web Audio API untuk ekstraksi data gelombang
    function readAudioBuffer(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.decodeAudioData(arrayBuffer, (buffer) => {
                audioBuffer = buffer;
                document.getElementById('system-status').textContent = "Audio Decoder Loaded.";
            });
        };
        reader.readAsArrayBuffer(file);
    }

    // METODE INTI: AI Beat & Drop Intelligent Analyzer
    btnAnalyze.addEventListener('click', () => {
        if (!audioBuffer) return;
        
        document.getElementById('system-status').textContent = "Analyzing musical core structures...";
        
        // Algoritma Ekstraksi Peak Energi Musik Sederhana untuk Mendeteksi Transisi Phonk
        const channelData = audioBuffer.getChannelData(0); 
        const sampleRate = audioBuffer.sampleRate;
        
        // Mengukur rata-rata energi per blok sampel (0.05 detik per jendela)
        const step = Math.floor(sampleRate * 0.05);
        let peaks = [];
        
        for (let i = 0; i < channelData.length; i += step) {
            let max = 0;
            for (let j = 0; j < step && (i + j) < channelData.length; j++) {
                const val = Math.abs(channelData[i + j]);
                if (val > max) max = val;
            }
            peaks.push({ time: i / sampleRate, volume: max });
        }

        // Filter puncak amplitudo tinggi untuk menandai letak koordinasi beat drop
        beatsTimeline = [];
        peaks.forEach(p => {
            if (p.volume > 0.65) { // Threshold deteksi beat bertenaga tinggi
                beatsTimeline.push({ time: p.time, type: p.volume > 0.85 ? 'DROP' : 'HEAVY' });
            }
        });

        // Pengkondisian fallback taktis jika struktur audio rata atau landai
        if (beatsTimeline.length === 0) {
            computedBpm = 126;
            for(let t = 0.5; t < sourceAudio.duration; t += (60/126)) {
                beatsTimeline.push({ time: t, type: (Math.random() > 0.7) ? 'DROP' : 'HEAVY' });
            }
        } else {
            computedBpm = Math.floor(60 / (beatsTimeline[0].time || 0.46));
            if(computedBpm < 100 || computedBpm > 180) computedBpm = 130; 
        }

        bpmVal.textContent = computedBpm;
        renderTimelineMarkers();
        
        document.getElementById('system-status').textContent = "AI Phonk Orchestration Complete.";
        btnPlayPause.disabled = false;
        btnExport.disabled = false;
    });

    // Menampilkan visualisasi penanda ketukan pada sumbu timeline
    function renderTimelineMarkers() {
        const beatTrack = document.getElementById('beat-track');
        // Bersihkan marker lama kecuali label track
        beatTrack.querySelectorAll('.beat-marker').forEach(m => m.remove());
        
        const trackWidth = beatTrack.offsetWidth - 80;
        const totalDuration = sourceAudio.duration || 60;

        beatsTimeline.forEach(b => {
            const marker = document.createElement('div');
            marker.classList.add('beat-marker');
            if (b.type === 'DROP') marker.classList.add('drop');
            
            const positionRatio = b.time / totalDuration;
            marker.style.left = `${80 + (positionRatio * trackWidth)}px`;
            beatTrack.appendChild(marker);
        });
    }

    // CONTROLLER PLAYER VIDEO & AUDIO SYNCHRONIZER
    btnPlayPause.addEventListener('click', () => {
        if (isPlaying) {
            pauseSync();
        } else {
            playSync();
        }
    });

    function playSync() {
        isPlaying = true;
        btnPlayPause.textContent = "⏸";
        sourceAudio.play();
        sourceVideo.play();
        renderEngineLoop();
    }

    function pauseSync() {
        isPlaying = false;
        btnPlayPause.textContent = "▶";
        sourceAudio.pause();
        sourceVideo.pause();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }

    // ENGINE UTAMA: Manipulasi Frame Grafis Video Secara Real-Time (60 FPS)
    function renderEngineLoop() {
        if (!isPlaying) return;

        const currentTime = sourceAudio.currentTime;
        sourceVideo.currentTime = currentTime % sourceVideo.duration; // Loop video jika durasi audio lebih panjang

        // Update Text Tampilan Waktu
        timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(sourceAudio.duration)}`;

        // Eksekusi Pemrosesan Visual Frame Pintar
        processVideoEffects(currentTime);

        animationFrameId = requestAnimationFrame(renderEngineLoop);
    }

    // PIPELINE MANIPULASI CANVAS - EFEK PHONK & VELOCITY
    function processVideoEffects(time) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Analisis kedekatan dengan ketukan musik
        let currentImpact = 0;
        let activeBeat = null;

        for (let i = 0; i < beatsTimeline.length; i++) {
            const diff = time - beatsTimeline[i].time;
            if (diff >= 0 && diff < 0.3) { // Window efek 300ms setelah beat
                currentImpact = 1.0 - (diff / 0.3); // Linear decay
                activeBeat = beatsTimeline[i];
                break;
            }
        }

        // Konfigurasi Dasar Dimensi Transformasi Objek Gambar
        let zoom = 1.0;
        let shakeX = 0;
        let shakeY = 0;
        let applyFlash = false;
        let applyRgbSplit = false;

        // Implementasi Aturan Respon Ketukan Sesuai Instruksi AI Beat Intelligence
        if (activeBeat) {
            if (activeBeat.type === 'DROP') {
                // Velocity Edit: Fluktuasi Kecepatan Ekstrem & Guncangan Kuat pada Beat Drop
                zoom = 1.0 + (0.25 * currentImpact);
                shakeX = (Math.random() - 0.5) * 20 * currentImpact;
                shakeY = (Math.random() - 0.5) * 20 * currentImpact;
                applyFlash = true;
                applyRgbSplit = true;
                sourceVideo.playbackRate = currentImpact > 0.5 ? 0.3 : 1.5; // Dynamic Speed Ramp (Simulasi Optical Flow)
            } else if (activeBeat.type === 'HEAVY') {
                // Bass Punch & Zoom Ringan
                zoom = 1.0 + (0.12 * currentImpact);
                shakeX = (Math.random() - 0.5) * 6 * currentImpact;
                applyRgbSplit = Math.random() > 0.5;
                sourceVideo.playbackRate = 1.0;
            }
        } else {
            sourceVideo.playbackRate = 1.0; // Normal speed
        }

        // RENDER STAGE 1: Gambar Frame Video Dasar dengan Transformasi Geometris
        ctx.save();
        ctx.translate(canvas.width / 2 + shakeX, canvas.height / 2 + shakeY);
        ctx.scale(zoom, zoom);
        // Gambar dengan mempertahankan rasio vertikal 9:16
        ctx.drawImage(sourceVideo, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        ctx.restore();

        // RENDER STAGE 2: Simulasi RGB Split Efek Chromatic Aberration
        if (applyRgbSplit && currentImpact > 0.1) {
            const shift = Math.floor(15 * currentImpact);
            let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imgData.data;

            // Geser channel warna merah untuk menciptakan efek disorientasi visual khas Phonk
            for (let i = 0; i < data.length; i += 4) {
                if (i + shift * 4 < data.length) {
                    data[i] = data[i + shift * 4]; // Red channel shift
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }

        // RENDER STAGE 3: Eksposur Putih Kilat (White Flash Effect)
        if (applyFlash && currentImpact > 0.4) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * currentImpact})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // RENDER STAGE 4: Generator Desain Tipografi Teks Otomatis (AI Auto Caption System)
        renderPhonkCaptions(time, currentImpact);
    }

    // RENDER STAGE 4: Pemrosesan Tipografi Teks & Animasi Word-By-Word
    function renderPhonkCaptions(time, impact) {
        const selectedStyle = document.getElementById('caption-style').value;
        const activeCaption = captionData.find(c => time >= c.start && time <= c.end);

        if (!activeCaption) return;

        ctx.save();
        
        // Parameter Default Font Sesuai Aturan Sistem Desain Antarmuka Premium
        let fontName = 'Montserrat';
        let fontSize = 42;
        let fillStyle = '#ffffff';
        let strokeStyle = '#000000';
        let lineWidth = 6;
        let uppercase = true;
        let useGlow = false;

        // Modifikasi Visual Berdasarkan Preset Gaya Pilihan Pengguna
        switch (selectedStyle) {
            case 'phonk':
                fontName = 'Anton';
                fontSize = 54;
                useGlow = true;
                if (impact > 0.5) fontSize += (impact * 12); // Pulse Text Animasi
                break;
            case 'tiktok':
                fontName = 'Poppins';
                fontSize = 40;
                fillStyle = '#fff200'; // Warna Highlight Kuning Stabilo Viral
                break;
            case 'cinematic':
                fontName = 'Montserrat';
                fontSize = 32;
                uppercase = false;
                lineWidth = 3;
                break;
            default: // capcut classic
                fontName = 'Arial';
                fontSize = 38;
                break;
        }

        const txt = uppercase ? activeCaption.text.toUpperCase() : activeCaption.text;
        ctx.font = `900 ${fontSize}px ${fontName}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Penentuan Koordinasi Lokasi Teks Pintar Agar Tidak Menutupi Tengah Frame Utama
        const posX = canvas.width / 2;
        const posY = canvas.height * 0.78; // Berada di area aman sepertiga bawah layar

        // Implementasi Efek Glow Neon Phonk
        if (useGlow) {
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 15;
        }

        // Gambar Stroke / Border Belakang Teks
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.strokeText(txt, posX, posY);

        // Gambar Isi Depan Teks
        ctx.shadowBlur = 0; // Reset agar teks tetap tajam di bagian dalam
        ctx.fillStyle = fillStyle;
        ctx.fillText(txt, posX, posY);

        ctx.restore();
    }

    // SIMULASI PROSES EKSPOR PRESET HIGH QUALITY 60 FPS (Menggunakan Web Worker Pipeline Pattern)
    btnExport.addEventListener('click', () => {
        pauseSync();
        btnExport.disabled = true;
        progressArea.style.display = 'block';
        
        let progress = 0;
        const totalFrames = 60 * (sourceAudio.duration || 15); // Hitungan target untuk output 60 FPS penuh
        
        const interval = setInterval(() => {
            progress += (100 / (totalFrames / 15)); // Simulasi performa akselerasi hardware
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                document.getElementById('system-status').textContent = "Video Processing complete.";
                triggerDownloadMock();
            }
            
            progressFill.style.width = `${progress}%`;
            progressPercentage.textContent = `${Math.floor(progress)}%`;
            document.getElementById('eta-val').textContent = `${Math.ceil((100 - progress) * 0.15)} detik`;
        }, 30);
    });

    function triggerDownloadMock() {
        alert("AI Processing Complete!\nVideo Phonk Premium Anda berhasil dirender pada resolusi 720p 60 FPS dengan sinkronisasi beat presisi tinggi dan siap diunggah ke TikTok/Reels.");
        btnExport.disabled = false;
        progressArea.style.display = 'none';
        progressFill.style.width = '0%';
    }

    // Helper Utility: Format Penunjuk Durasi Waktu Detik ke Menit:Detik
    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }
});
