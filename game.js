const game = {
    currentScene: 1,
    totalScenes: 18,
    musicPlaying: false,
    anthemPlaying: false,
    zInterval: null,
    
    achievements: {
        firstStep: { id: 'firstStep', name: 'Первый шаг', desc: 'Сделать первый выбор', icon: '👶', unlocked: false },
        halfWay: { id: 'halfWay', name: 'На полпути', desc: 'Дойти до 8-й сцены', icon: '🥉', unlocked: false },
        finalScene: { id: 'finalScene', name: 'Финал', desc: 'Дойти до конца истории', icon: '🏁', unlocked: false },
        speedrun: { id: 'speedrun', name: 'Спидранер', desc: 'Пройти игру за минуту', icon: '⚡', unlocked: false },
        explorer: { id: 'explorer', name: 'Исследователь', desc: 'Посетить 10 разных сцен', icon: '🗺️', unlocked: false },
        secretEnding: { id: 'secretEnding', name: 'Секрет', desc: 'Найти секретную концовку', icon: '🤫', unlocked: false }
    },
    visitedScenes: new Set(),
    startTime: Date.now(),

    scenes: {
        1: { media: "alya1", text: "Ты встречаешь милую девушку Алю на улице. Она улыбается тебе. Что будешь делать?", choices: [ { text: "😊 Улыбнуться в ответ", nextScene: 2 }, { text: "👋 Помахать рукой", nextScene: 2 } ] },
        2: { media: "alya2", text: "Аля заметила твою улыбку и подошла ближе. 'Привет!' - сказала она.", choices: [ { text: "💬 Поговорить с ней", nextScene: 3 }, { text: "🌸 Сделать комплимент", nextScene: 3 } ] },
        3: { media: "alya3", text: "Она весело помахала тебе в ответ! 'Хочешь прогуляться вместе?'", choices: [ { text: "🚶‍♂️ Согласиться на прогулку", nextScene: 4 }, { text: "🍦 Предложить зайти за мороженым", nextScene: 4 } ] },
        4: { media: "alya4", text: "Вы болтаете о разном и понимаете, что у вас много общего!", choices: [ { text: "🎞️ Предложить пойти в кино", nextScene: 5 }, { text: "🎨 Предложить сходить на выставку", nextScene: 5 } ] },
        5: { media: "alya5", text: "'Ой, спасибо!' - покраснела Аля. 'У тебя тоже очень милая улыбка.'", choices: [ { text: "💕 Признаться в симпатии", nextScene: 6 }, { text: "😂 Сказать шутку", nextScene: 6 } ] },
        6: { media: "alya6", text: "Вы гуляете по аллее, и солнце пробивается сквозь листья деревьев. Очень романтично!", choices: [ { text: "🤝 Взять её за руку", nextScene: 7 }, { text: "🌳 Предложить сесть на скамейку", nextScene: 7 } ] },
        7: { media: "alya7", text: "Мороженое оказалось вкусным! Аля съела его с удовольствием, запачкав нос.", choices: [ { text: "🧻 Вытереть ей нос", nextScene: 8 }, { text: "😊 Улыбнуться и сфотографировать", nextScene: 8 } ] },
        8: { media: "alya8", text: "В кинотеатре темно, на экране идет романтический фильм. Ваши руки случайно касаются.", choices: [ { text: "🤝 Не убирать руку", nextScene: 9 }, { text: "🍿 Предложить попкорн", nextScene: 9 } ] },
        9: { media: "alya9", text: "На выставке вы рассматриваете картины. Аля делится своими впечатлениями.", choices: [ { text: "🎨 Согласиться с её мнением", nextScene: 10 }, { text: "💭 Предложить свою интерпретацию", nextScene: 10 } ] },
        10: { media: "alya10", text: "Она смутилась, но её глаза засияли. 'Я... я тоже тебе нравлюсь.'", choices: [ { text: "💏 Поцеловать её", nextScene: 16 }, { text: "🌹 Подарить цветок", nextScene: 16 } ] },
        16: { media: "alyag1", text: "Alya пригласила тебя на чай... Вечер был волшебным, и разговор зашел о чем-то очень личном. Она смотрит на тебя с загадочной улыбкой. Что ты выберешь?", choices: [ { text: "🏠 Пойти домой", nextScene: 17 }, { text: "🔥 Далее...", nextScene: 17 } ] },
        17: { media: null, text: '<span class="age-restriction-text">ВАМ ЕСТЬ 18 ЛЕТ? 🔞</span>', choices: [ { text: "Да", nextScene: 18 }, { text: "Нет", nextScene: 1 } ] },
        18: { media: ["kontrakt1", "kontrakt2"], text: '<span class="caught-text">АХАХАХ, ПОПАЛСЯ</span>', choices: [ { text: "Подписать Контракт", nextScene: "link" }, { text: "Подписать Контракт", nextScene: "link" } ] }
    },
    
    init() {
        this.bindEvents();
        this.loadProgress();
        this.createVolumeSlider();
        this.createFloatingHearts();
        this.loadScene(this.currentScene || 1);
    },
    
    bindEvents() {
        document.getElementById('choice1').addEventListener('click', () => this.makeChoice(0));
        document.getElementById('choice2').addEventListener('click', () => this.makeChoice(1));
        document.getElementById('returnBtn').addEventListener('click', () => this.loadScene(1));
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('musicToggle').addEventListener('click', () => this.toggleMusic());
        document.getElementById('clearProgressBtn').addEventListener('click', () => this.clearProgress());
        document.getElementById('achievementsBtn').addEventListener('click', () => this.showAchievements());
        document.querySelector('.close-btn').addEventListener('click', () => this.hideAchievements());
    },

    createVolumeSlider() {
        const settingsMenu = document.querySelector('.settings-menu');
        const volumeContainer = document.createElement('div');
        volumeContainer.style.display = 'flex'; volumeContainer.style.alignItems = 'center'; volumeContainer.style.gap = '5px';
        const volumeIcon = document.createElement('span'); volumeIcon.textContent = '🔊'; volumeIcon.style.fontSize = '16px';
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range'; volumeSlider.id = 'musicVolume'; volumeSlider.min = '0'; volumeSlider.max = '1'; volumeSlider.step = '0.1';
        volumeSlider.style.width = '80px'; volumeSlider.style.cursor = 'pointer';
        const savedVolume = localStorage.getItem('musicVolume');
        volumeSlider.value = savedVolume || '0.5';
        document.getElementById('bgMusic').volume = volumeSlider.value;
        document.getElementById('anthem').volume = 0.5; // Фиксированная громкость
        
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            document.getElementById('bgMusic').volume = volume;
            localStorage.setItem('musicVolume', volume);
        });
        volumeContainer.appendChild(volumeIcon); volumeContainer.appendChild(volumeSlider);
        settingsMenu.appendChild(volumeContainer);
    },

    startFallingZs() {
        this.zInterval = setInterval(() => {
            const z = document.createElement('div');
            z.innerHTML = 'Z';
            z.style.position = 'fixed'; z.style.left = Math.random() * window.innerWidth + 'px'; z.style.top = '-100px';
            z.style.fontSize = Math.random() * 40 + 20 + 'px'; z.style.color = 'black'; z.style.fontWeight = 'bold';
            z.style.opacity = '0.4'; z.style.pointerEvents = 'none'; z.style.zIndex = '0';
            z.style.fontFamily = 'Arial, sans-serif';
            z.style.animation = 'fall-z-straight linear';
            z.style.animationDuration = Math.random() * 3 + 5 + 's';
            document.getElementById('zBg').appendChild(z);
            setTimeout(() => z.remove(), 8000);
        }, 400);
    },
    stopFallingZs() {
        clearInterval(this.zInterval);
        document.getElementById('zBg').innerHTML = '';
    },

    loadMedia(mediaData) {
        const container1 = document.getElementById('mediaContainer1');
        const container2 = document.getElementById('dualMediaWrapper');
        const video1 = document.getElementById('sceneVideo'); const image1 = document.getElementById('sceneImage');
        const video2 = document.getElementById('sceneVideo2'); const image2 = document.getElementById('sceneImage2');
        const video3 = document.getElementById('sceneVideo3'); const image3 = document.getElementById('sceneImage3');

        container1.classList.add('hidden'); container2.classList.add('hidden');
        video1.classList.add('hidden'); image1.classList.add('hidden');
        video2.classList.add('hidden'); image2.classList.add('hidden');
        video3.classList.add('hidden'); image3.classList.add('hidden');

        if (!mediaData) return;

        if (Array.isArray(mediaData)) {
            container2.classList.remove('hidden');
            this.loadSingleMedia(mediaData[0], video2, image2);
            this.loadSingleMedia(mediaData[1], video3, image3);
        } else {
            container1.classList.remove('hidden');
            this.loadSingleMedia(mediaData, video1, image1);
        }
    },

    loadSingleMedia(baseFilename, videoElement, imageElement) {
        const videoPath = `videos/${baseFilename}.mp4`; videoElement.src = videoPath;
        videoElement.onloadeddata = () => { videoElement.classList.remove('hidden'); videoElement.play().catch(e => console.log("Автовоспроизведение видео заблокировано")); };
        videoElement.onerror = () => {
            console.log(`Видео ${videoPath} не найдено. Пробую загрузить изображение .jpg...`);
            const imagePathJpg = `images/${baseFilename}.jpg`; imageElement.src = imagePathJpg;
            imageElement.onload = () => imageElement.classList.remove('hidden');
            imageElement.onerror = () => {
                console.log(`Изображение ${imagePathJpg} не найдено. Пробую загрузить .png...`);
                const imagePathPng = `images/${baseFilename}.png`; imageElement.src = imagePathPng;
                imageElement.onerror = () => console.error(`Медиа для ${baseFilename} не найдено`);
            }
        };
    },
    
    loadScene(sceneNumber) {
        const scene = this.scenes[sceneNumber];
        if (!scene) return;
        
        const container = document.querySelector('.scene-container');
        container.style.animation = 'none';
        setTimeout(() => { container.style.animation = 'fadeIn 0.8s ease'; }, 10);
        
        this.loadMedia(scene.media);
        document.getElementById('sceneText').innerHTML = scene.text;
        document.getElementById('choice1').textContent = scene.choices[0].text;
        document.getElementById('choice2').textContent = scene.choices[1].text;
        
        const gameContainer = document.querySelector('.game-container');
        if (sceneNumber >= 17) {
            gameContainer.classList.add('no-progress');
        } else {
            gameContainer.classList.remove('no-progress');
            this.updateProgress();
        }

        if (sceneNumber === 18) {
            document.body.classList.add('russia-flag-bg');
            document.getElementById('bgMusic').pause();
            const anthem = document.getElementById('anthem');
            // НАДЕЖНЫЙ ЗАПУСК ГИМНА
            anthem.currentTime = 0;
            anthem.volume = 0.5;
            anthem.muted = false;
            let playPromise = anthem.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Автовоспроизведение гимна заблокировано:", error);
                    // Можно показать уведомление пользователю, что нужно кликнуть для включения звука
                });
            }
            this.anthemPlaying = true;
            this.startFallingZs();

            // Управление видимостью кнопок и настроек
            document.getElementById('clearProgressBtn').classList.add('hidden');
            document.getElementById('restartBtn').classList.add('hidden');
            document.getElementById('musicToggle').disabled = true;
            document.getElementById('returnBtn').classList.add('hidden');
            document.getElementById('choice1').classList.remove('hidden');
            document.getElementById('choice2').classList.remove('hidden');

        } else {
            document.body.classList.remove('russia-flag-bg');
            if (this.anthemPlaying) {
                const anthem = document.getElementById('anthem');
                anthem.pause(); anthem.currentTime = 0;
                this.anthemPlaying = false;
            }
            this.stopFallingZs();

            // ИСПРАВЛЕНО: ВОЗВРАЩАЕМ ВИДИМОСТЬ КНОПОК
            document.getElementById('choice1').classList.remove('hidden');
            document.getElementById('choice2').classList.remove('hidden');
            document.getElementById('returnBtn').classList.add('hidden');
            
            document.getElementById('clearProgressBtn').classList.remove('hidden');
            document.getElementById('restartBtn').classList.remove('hidden');
            document.getElementById('musicToggle').disabled = false;
        }
        
        this.checkAchievements(sceneNumber);
        this.currentScene = sceneNumber;
        this.saveProgress();
        this.visitedScenes.add(sceneNumber);
        
        if (sceneNumber === 18) this.unlockAchievement('secretEnding');
    },
    
    makeChoice(choiceIndex) {
        const scene = this.scenes[this.currentScene];
        const choice = scene.choices[choiceIndex];
        this.playClickSound();

        if (choice.nextScene === 'link') {
            window.open('https://contract.gosuslugi.ru/', '_blank');
            // Прячем кнопки контракта и показываем кнопку возврата
            document.getElementById('choice1').classList.add('hidden');
            document.getElementById('choice2').classList.add('hidden');
            document.getElementById('returnBtn').classList.remove('hidden');
            return;
        }

        this.loadScene(choice.nextScene);
    },
    
    updateProgress() {
        const progress = (this.currentScene / this.totalScenes) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
    },
    
    restart() {
        this.currentScene = 1; this.visitedScenes.clear(); this.startTime = Date.now();
        this.loadScene(1);
    },
    
    toggleMusic() {
        const music = document.getElementById('bgMusic'); const btn = document.getElementById('musicToggle');
        if (this.musicPlaying) { music.pause(); btn.textContent = '🔇 Музыка'; }
        else { music.play().catch(e => console.log('Автовоспроизведение заблокировано')); btn.textContent = '🎵 Музыка'; }
        this.musicPlaying = !this.musicPlaying;
    },
    
    saveProgress() {
        const gameData = { currentScene: this.currentScene, achievements: this.achievements, visitedScenes: Array.from(this.visitedScenes) };
        localStorage.setItem('visualNovelSave', JSON.stringify(gameData));
    },
    loadProgress() {
        const savedData = localStorage.getItem('visualNovelSave');
        if (savedData) {
            const gameData = JSON.parse(savedData);
            this.currentScene = gameData.currentScene || 1;
            this.achievements = gameData.achievements || this.achievements;
            this.visitedScenes = new Set(gameData.visitedScenes || []);
        }
    },
    clearProgress() {
        if (confirm("Ты уверен, что хочешь удалить весь прогресс и достижения?")) {
            localStorage.removeItem('visualNovelSave'); this.restart();
            for (let key in this.achievements) { this.achievements[key].unlocked = false; }
            alert("Прогресс очищен!");
        }
    },
    checkAchievements(sceneNumber) {
        if (sceneNumber > 1 && !this.achievements.firstStep.unlocked) this.unlockAchievement('firstStep');
        if (sceneNumber >= 8 && !this.achievements.halfWay.unlocked) this.unlockAchievement('halfWay');
        if (sceneNumber === 16 && !this.achievements.finalScene.unlocked) this.unlockAchievement('finalScene');
        if (this.visitedScenes.size >= 10 && !this.achievements.explorer.unlocked) this.unlockAchievement('explorer');
        if (sceneNumber === 16 && (Date.now() - this.startTime) < 60000 && !this.achievements.speedrun.unlocked) this.unlockAchievement('speedrun');
        if (sceneNumber === 18 && !this.achievements.secretEnding.unlocked) this.unlockAchievement('secretEnding');
    },
    unlockAchievement(id) {
        const achievement = this.achievements[id];
        if (!achievement || achievement.unlocked) return;
        achievement.unlocked = true; this.showNotification(achievement); this.saveProgress();
    },
    showNotification(achievement) {
        const notification = document.getElementById('achievementNotification');
        document.getElementById('achievementName').textContent = achievement.name;
        document.getElementById('achievementDesc').textContent = achievement.desc;
        notification.classList.add('show');
        setTimeout(() => { notification.classList.remove('show'); }, 3000);
    },
    showAchievements() {
        const modal = document.getElementById('achievementsModal'); const list = document.getElementById('achievementsList');
        list.innerHTML = '';
        for (let key in this.achievements) {
            const ach = this.achievements[key];
            const achDiv = document.createElement('div');
            achDiv.className = `achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}`;
            achDiv.innerHTML = `<div class="icon">${ach.icon}</div><h4>${ach.name}</h4><p>${ach.desc}</p>`;
            list.appendChild(achDiv);
        }
        modal.style.display = 'block';
    },
    hideAchievements() { document.getElementById('achievementsModal').style.display = 'none'; },
    createFloatingHearts() {
        setInterval(() => {
            const heart = document.createElement('div'); heart.innerHTML = '💕';
            heart.style.position = 'fixed'; heart.style.left = Math.random() * window.innerWidth + 'px';
            heart.style.bottom = '-50px'; heart.style.fontSize = Math.random() * 20 + 10 + 'px';
            heart.style.opacity = '0.5'; heart.style.pointerEvents = 'none'; heart.style.zIndex = '0';
            heart.style.animation = 'floatUp 5s linear'; document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 5000);
        }, 3000);
    },
    celebrateEnding() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.innerHTML = ['🎉', '🎊', '✨', '💖', '🌟'][Math.floor(Math.random() * 5)];
                confetti.style.position = 'fixed'; confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.top = '-50px'; confetti.style.fontSize = '30px';
                confetti.style.pointerEvents = 'none'; confetti.style.zIndex = '9999';
                confetti.style.animation = 'fall 3s linear'; document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 3000);
            }, i * 50);
        }
    },
    playClickSound() {
        const audio = new Audio('sounds/click.mp3'); audio.volume = 0.3;
        audio.play().catch(() => {});
    }
};

const style = document.createElement('style');
style.textContent = `@keyframes floatUp { to { transform: translateY(-100vh) rotate(360deg); opacity: 0; } } @keyframes fall { to { transform: translateY(100vh) rotate(360deg); opacity: 0; } }`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => { game.init(); });