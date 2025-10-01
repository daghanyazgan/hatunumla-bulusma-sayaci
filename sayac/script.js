// Date yönetimi ve sayfa geçişleri
let currentDate = null;
let completedDates = [];
let dateTopics = [];
let adminPassword = 'admin123'; // Varsayılan şifre
let isAdminLoggedIn = false;

// Varsayılan date konuları
const defaultDateTopics = [
	{
		id: '1',
		title: 'Romantik Akşam Yemeği',
		description: 'Özel bir restoranda romantik akşam yemeği',
		location: 'Merkezi restoran',
		activities: ['Yemek yeme', 'Şarap içme', 'Konuşma'],
		level: 2,
		unlockCondition: 'İlk date tamamlandıktan sonra',
		isActive: true,
		routes: [
			{
				title: 'Restoran',
				description: 'Romantik atmosferde özel yemek',
				photos: [],
				instagram: '',
				mapAddress: ''
			},
			{
				title: 'Sahil Yürüyüşü',
				description: 'Yemek sonrası romantik yürüyüş',
				photos: [],
				instagram: '',
				mapAddress: ''
			}
		]
	},
	{
		id: '2',
		title: 'Doğa Yürüyüşü',
		description: 'Şehirden uzakta doğal bir yürüyüş',
		location: 'Milli park',
		activities: ['Yürüyüş', 'Fotoğraf çekme', 'Piknik'],
		level: 3,
		unlockCondition: '2 date tamamlandıktan sonra',
		isActive: false,
		routes: [
			{
				title: 'Park Girişi',
				description: 'Doğal ortamda buluşma ve plan yapma',
				photos: [],
				instagram: '',
				mapAddress: ''
			},
			{
				title: 'Ana Yürüyüş',
				description: 'Doğal yolda keyifli yürüyüş',
				photos: [],
				instagram: '',
				mapAddress: ''
			},
			{
				title: 'Göl Kenarı',
				description: 'Göl kenarında piknik ve dinlenme',
				photos: [],
				instagram: '',
				mapAddress: ''
			}
		]
	},
	{
		id: '3',
		title: 'Müze Turu',
		description: 'Kültürel bir müze gezisi',
		location: 'Tarihi müze',
		activities: ['Müze gezisi', 'Kültürel keşif', 'Öğrenme'],
		level: 4,
		unlockCondition: '3 date tamamlandıktan sonra',
		isActive: false,
		routes: []
	},
	{
		id: '4',
		title: 'Gizli Sürpriz',
		description: 'Ne olduğu bilinmeyen özel sürpriz',
		location: 'Gizli lokasyon',
		activities: ['Sürpriz aktivite'],
		level: 5,
		unlockCondition: '4 date tamamlandıktan sonra',
		isActive: false,
		routes: []
	}
];

// LocalStorage'dan verileri yükle
function loadData() {
	const savedDate = localStorage.getItem('currentDate');
	const savedCompleted = localStorage.getItem('completedDates');
	const savedTopics = localStorage.getItem('dateTopics');
	const savedPassword = localStorage.getItem('adminPassword');
	
	if (savedDate) {
		currentDate = JSON.parse(savedDate);
	}
	
	if (savedCompleted) {
		completedDates = JSON.parse(savedCompleted);
	}
	
	if (savedTopics) {
		dateTopics = JSON.parse(savedTopics);
	} else {
		dateTopics = [...defaultDateTopics];
	}
	
	if (savedPassword) {
		adminPassword = savedPassword;
	}
}

// Verileri kaydet
function saveData() {
	if (currentDate) {
		localStorage.setItem('currentDate', JSON.stringify(currentDate));
	}
	localStorage.setItem('completedDates', JSON.stringify(completedDates));
	localStorage.setItem('dateTopics', JSON.stringify(dateTopics));
	localStorage.setItem('adminPassword', adminPassword);
}

// Sayfa göster
function showPage(pageId) {
	// Tüm container'ları gizle
	document.querySelectorAll('.container').forEach(container => {
		container.classList.remove('active');
		container.style.display = 'none';
	});
	
	// Nav linklerini güncelle
	document.querySelectorAll('.nav-link').forEach(link => {
		link.classList.remove('active');
	});
	
	// Seçilen sayfayı göster
	const targetPage = document.getElementById(pageId + '-page');
	if (targetPage) {
		targetPage.style.display = 'block';
		targetPage.classList.add('active');
	}
	
	// Nav linkini aktif yap
	const navLink = document.querySelector(`[data-page="${pageId}"]`);
	if (navLink) {
		navLink.classList.add('active');
	}
	
	// Sayfa özel işlemleri
	if (pageId === 'home') {
		updateHomePage();
	} else if (pageId === 'completed') {
		updateCompletedPage();
	} else if (pageId === 'next') {
		updateNextDatePage();
	} else if (pageId === 'locked') {
		updateLockedDatesPage();
	} else if (pageId === 'admin') {
		if (!isAdminLoggedIn) {
			document.getElementById('admin-login').style.display = 'block';
			document.getElementById('admin-content').style.display = 'none';
		} else {
			updateAdminPages();
		}
	} else if (pageId === 'create-date') {
		updateNextDatePreview();
	}
}

// Hash tabanlı routing
function handleHashRoute() {
	const hash = (location.hash || '').replace('#', '').trim();
	const valid = ['home','completed','next','locked','admin','create-date'];
	const target = valid.includes(hash) ? hash : 'home';
	showPage(target);
}

// Ana sayfayı güncelle
function updateHomePage() {
	const dateCounterSection = document.getElementById('date-counter-section');
	const noDateSection = document.getElementById('no-date-section');
	
	if (currentDate && new Date(currentDate.dateTime) > new Date()) {
		// Aktif date var, sayacı göster
		dateCounterSection.style.display = 'block';
		noDateSection.style.display = 'none';
		updateCountdown();
	} else {
		// Date yok veya geçmiş, oluşturma ekranını göster
		dateCounterSection.style.display = 'none';
		noDateSection.style.display = 'block';
	}
}

// Date oluştur
function createDate() {
	const timeInput = document.getElementById('time-input').value;
	
	if (!timeInput) {
		alert('Lütfen saat seçiniz.');
		return;
	}
	
	// Sonraki aktif date konusunu bul
	const nextTopic = dateTopics.find(topic => topic.isActive && !currentDate);
	if (!nextTopic) {
		alert('Henüz aktif date konusu bulunmuyor. Admin panelinden date konularını ayarlayın.');
		return;
	}
	
	// Bugünden sonraki ilk uygun tarihi bul
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	
	const [hours, minutes] = timeInput.split(':');
	tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);
	
	currentDate = {
		dateTime: tomorrow.toISOString(),
		location: nextTopic.location,
		topic: nextTopic.title,
		created: new Date().toISOString()
	};
	
	saveData();
	showPage('home');
}

// Geri sayım güncelle
function updateCountdown() {
	if (!currentDate) return;
	
	const targetDate = new Date(currentDate.dateTime);
	const now = new Date();
	let diff = targetDate.getTime() - now.getTime();

	if (diff <= 0) {
		// Date zamanı geldi
		document.getElementById('days').textContent = '00';
		document.getElementById('hours').textContent = '00';
		document.getElementById('minutes').textContent = '00';
		document.getElementById('seconds').textContent = '00';
		document.getElementById('doneText').hidden = false;
		return;
	}

	const secondsTotal = Math.floor(diff / 1000);
	const days = Math.floor(secondsTotal / (24 * 60 * 60));
	const hours = Math.floor((secondsTotal % (24 * 60 * 60)) / (60 * 60));
	const minutes = Math.floor((secondsTotal % (60 * 60)) / 60);
	const seconds = secondsTotal % 60;

	document.getElementById('days').textContent = days.toString().padStart(2, '0');
	document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
	document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
	document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
	
	// Date bilgisini güncelle
	const nextDateInfo = document.getElementById('next-date-info');
	if (nextDateInfo) {
		const options = { 
			weekday: 'long', 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		};
		nextDateInfo.textContent = `${targetDate.toLocaleDateString('tr-TR', options)} - ${currentDate.location}`;
	}
}

// Tamamlanan date'ler sayfasını güncelle
function updateCompletedPage() {
	const container = document.getElementById('completed-dates-list');
	
	if (completedDates.length === 0) {
		container.innerHTML = '<div class="no-content"><p>Henüz tamamlanan date bulunmuyor.</p></div>';
		return;
	}
	
	container.innerHTML = completedDates.map(date => `
		<div class="completed-date-card">
			<div class="date-header">
				<h3>${new Date(date.dateTime).toLocaleDateString('tr-TR')}</h3>
				<span class="date-location">${date.location}</span>
			</div>
			<div class="photos-grid">
				${date.photos ? date.photos.map(photo => `
					<div class="photo-item">
						<img src="${photo}" alt="Date fotoğrafı" />
					</div>
				`).join('') : '<p class="no-photos">Henüz fotoğraf eklenmemiş.</p>'}
			</div>
			<button class="btn btn-secondary btn-small" onclick="addPhoto('${date.id}')">
				Fotoğraf Ekle
			</button>
		</div>
	`).join('');
}

// Sonraki date sayfasını güncelle
function updateNextDatePage() {
	const container = document.getElementById('next-date-content');
	
	if (!currentDate) {
		container.innerHTML = '<div class="no-content"><p>Henüz bir date planlanmamış.</p></div>';
		return;
	}
	
	const date = new Date(currentDate.dateTime);
	const options = { 
		weekday: 'long', 
		year: 'numeric', 
		month: 'long', 
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	};
	
	const currentTopic = dateTopics.find(t => t.title === currentDate.topic);
	
	if (!currentTopic || !currentTopic.routes || currentTopic.routes.length === 0) {
		container.innerHTML = `
			<div class="next-date-card">
				<div class="date-header">
					<h2>${currentTopic ? currentTopic.title : currentDate.topic}</h2>
					<p class="date-time">${date.toLocaleDateString('tr-TR', options)}</p>
				</div>
				<div class="routes-container">
					${isAdminLoggedIn ? `
						<div class="add-route-card" onclick="addNewRoute()">
							<div class="add-route-content">
								<div class="plus-icon">+</div>
								<p>İlk Rotayı Ekle</p>
							</div>
						</div>
					` : '<p class="no-routes">Henüz rota bilgisi eklenmemiş.</p>'}
				</div>
			</div>
		`;
		return;
	}
	
	container.innerHTML = `
		<div class="next-date-card">
			<div class="date-header">
				<h2>${currentTopic.title || 'Date Başlığı'}</h2>
				<p class="date-time">${date.toLocaleDateString('tr-TR', options)}</p>
			</div>
			
			<div class="routes-container">
				${currentTopic.routes.map((route, index) => `
					<div class="route-card">
						<div class="route-number">${index + 1}. Rota</div>
						
						<div class="route-content">
							<!-- Görseller -->
							<div class="route-photos">
								${route.photos && route.photos.length > 0 ? `
									<div class="photos-grid">
										${route.photos.map((photo, photoIndex) => `
											<div class="photo-item">
												<img src="${photo}" alt="Rota fotoğrafı" />
												${isAdminLoggedIn ? `
													<button class="delete-photo" onclick="deleteRoutePhoto(${index}, ${photoIndex})">×</button>
												` : ''}
											</div>
										`).join('')}
									</div>
								` : '<div class="no-photos">Henüz görsel eklenmemiş</div>'}
								${isAdminLoggedIn ? `
									<button class="btn btn-primary add-photos-btn" onclick="addRoutePhotos(${index})">
										📸 Görsel Ekle
									</button>
								` : ''}
							</div>
							
							<!-- Açıklama -->
							<div class="route-description">
								<textarea 
									id="route-description-${index}" 
									${isAdminLoggedIn ? '' : 'readonly'} 
									placeholder="Bu rotada neler yapacağız?" 
									onchange="updateRouteDescription(${index}, this.value)"
								>${route.description || ''}</textarea>
							</div>
							
							<!-- Instagram ve Map -->
							<div class="route-links">
								<div class="link-row">
									<label>📱 Instagram:</label>
									<input 
										type="text" 
										id="route-instagram-${index}" 
										value="${route.instagram || ''}" 
										${isAdminLoggedIn ? '' : 'readonly'} 
										placeholder="Instagram hesabı veya link" 
										onchange="updateRouteInstagram(${index}, this.value)"
									>
								</div>
								<div class="link-row">
									<label>🗺️ Map Adresi:</label>
									<input 
										type="text" 
										id="route-map-${index}" 
										value="${route.mapAddress || ''}" 
										${isAdminLoggedIn ? '' : 'readonly'} 
										placeholder="Google Maps adresi" 
										onchange="updateRouteMap(${index}, this.value)"
									>
								</div>
							</div>
							
							<!-- Sil Butonu -->
							${isAdminLoggedIn ? `
								<button class="btn btn-danger delete-route-btn" onclick="deleteRoute(${index})">
									🗑️ Rotayı Sil
								</button>
							` : ''}
						</div>
					</div>
				`).join('')}
				
				<!-- + Rota Ekleme Butonu -->
				${isAdminLoggedIn ? `
					<div class="add-route-card" onclick="addNewRoute()">
						<div class="add-route-content">
							<div class="plus-icon">+</div>
							<p>Yeni Rota Ekle</p>
						</div>
					</div>
				` : ''}
			</div>
		</div>
	`;
	
	// Slider state'lerini başlat
	currentTopic.routes.forEach((_, index) => {
		window[`currentSlide_${index}`] = 0;
	});
}

// Kilitli date'ler sayfasını güncelle
function updateLockedDatesPage() {
	const container = document.getElementById('locked-dates-container');
	
	const lockedTopics = dateTopics.filter(topic => !topic.isActive);
	
	if (lockedTopics.length === 0) {
		container.innerHTML = '<div class="no-content"><p>Tüm date\'ler açık! 🎉</p></div>';
		return;
	}
	
	container.innerHTML = lockedTopics.map(topic => `
		<div class="locked-date-card">
			<div class="locked-icon">🔒</div>
			<h3>Gizli Date</h3>
			<p>Bu date konusu henüz kilitli. ${topic.unlockCondition} açılacak.</p>
			<div class="lock-level">Level ${topic.level}</div>
			<div class="unlock-progress">
				<div class="progress-bar">
					<div class="progress-fill" style="width: ${Math.min(100, (completedDates.length / (topic.level - 1)) * 100)}%"></div>
				</div>
				<small>${completedDates.length}/${topic.level - 1} date tamamlandı</small>
			</div>
		</div>
	`).join('');
}

// Fotoğraf ekle
function addPhoto(dateId) {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'image/*';
	input.multiple = true;
	
	input.onchange = function(e) {
		const files = Array.from(e.target.files);
		files.forEach(file => {
			const reader = new FileReader();
			reader.onload = function(e) {
				const date = completedDates.find(d => d.id === dateId);
				if (date) {
					if (!date.photos) date.photos = [];
					date.photos.push(e.target.result);
					saveData();
					updateCompletedPage();
				}
			};
			reader.readAsDataURL(file);
		});
	};
	
	input.click();
}

// Date'i tamamla (sayac bittiğinde çağrılır)
function completeDate() {
	if (!currentDate) return;
	
	const completedDate = {
		id: Date.now().toString(),
		dateTime: currentDate.dateTime,
		location: currentDate.location,
		topic: currentDate.topic || 'Özel Date',
		completed: new Date().toISOString(),
		photos: []
	};
	
	completedDates.unshift(completedDate);
	currentDate = null;
	
	// Date konularını güncelle (kilitleri aç)
	updateDateTopicsUnlock();
	
	saveData();
	updateHomePage();
}

// Date konularının kilit durumunu güncelle
function updateDateTopicsUnlock() {
	const completedCount = completedDates.length;
	
	dateTopics.forEach(topic => {
		if (completedCount >= topic.level - 1) {
			topic.isActive = true;
		}
	});
	
	saveData();
}

// Admin girişi
function adminLogin() {
	const password = document.getElementById('admin-password').value;
	
	if (password === adminPassword) {
		isAdminLoggedIn = true;
		document.getElementById('admin-login').style.display = 'none';
		document.getElementById('admin-content').style.display = 'block';
		document.querySelector('.admin-only').style.display = 'inline-flex';
		updateAdminPages();
		
		// Eğer şu anda sonraki date sayfasındaysak, düzenleme butonlarını göster
		if (document.getElementById('next-page').style.display === 'block') {
			updateNextDatePage();
		}
	} else {
		alert('Yanlış şifre!');
	}
}

// Admin sayfalarını güncelle
function updateAdminPages() {
	updateDateTopicsList();
	updateLockedDatesPage();
	updateSlideTopicSelect();
}

// Slide topic select'i güncelle
function updateSlideTopicSelect() {
	const select = document.getElementById('slide-topic-select');
	if (!select) return;
	
	select.innerHTML = '<option value="">Date konusu seçin...</option>';
	
	dateTopics.forEach(topic => {
		const option = document.createElement('option');
		option.value = topic.id;
		option.textContent = `${topic.title} (${topic.slides ? topic.slides.length : 0} slide)`;
		select.appendChild(option);
	});
}

// Slide yönetimi modal'ı aç
function manageSlides() {
	const select = document.getElementById('slide-topic-select');
	const topicId = select.value;
	
	if (!topicId) {
		alert('Lütfen bir date konusu seçin.');
		return;
	}
	
	const topic = dateTopics.find(t => t.id === topicId);
	if (!topic) return;
	
	const modal = document.createElement('div');
	modal.className = 'modal-overlay';
	modal.innerHTML = `
		<div class="modal-content slide-management-modal">
			<div class="modal-header">
				<h3>📸 ${topic.title} - Slide Yönetimi</h3>
				<button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
			</div>
			<div class="modal-body">
				<div class="slides-list" id="slides-list-${topicId}">
					${topic.slides ? topic.slides.map((slide, index) => `
						<div class="slide-item-admin" data-slide-id="${slide.id || index}">
							<div class="slide-item-header">
								<h5>Slide ${index + 1}: ${slide.title}</h5>
								<div class="slide-item-actions">
									<button class="btn btn-small btn-secondary" onclick="editSlide('${topicId}', ${index})">Düzenle</button>
									<button class="btn btn-small btn-info" onclick="addSlidePhotos('${topicId}', ${index})">Görsel Ekle</button>
									<button class="btn btn-small btn-danger" onclick="deleteSlide('${topicId}', ${index})">Sil</button>
								</div>
							</div>
							<div class="slide-item-details">
								<p><strong>📝 Açıklama:</strong> ${slide.description}</p>
								${slide.photos && slide.photos.length > 0 ? `
									<div class="slide-item-photos">
										<strong>📸 Görseller:</strong> ${slide.photos.length} adet
									</div>
								` : ''}
							</div>
						</div>
					`).join('') : '<p class="no-slides">Henüz slide eklenmemiş.</p>'}
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Kapat</button>
				<button class="btn btn-primary" onclick="addNewSlide('${topicId}'); this.closest('.modal-overlay').remove();">Yeni Slide Ekle</button>
			</div>
		</div>
	`;
	
	document.body.appendChild(modal);
}

// Yeni slide ekle
function addNewSlide(topicId) {
	const topic = dateTopics.find(t => t.id === topicId);
	if (!topic) return;
	
	const title = prompt('Slide başlığı:');
	if (!title) return;
	
	const description = prompt('Açıklama:');
	if (!description) return;
	
	const newSlide = {
		title,
		description,
		photos: []
	};
	
	if (!topic.slides) topic.slides = [];
	topic.slides.push(newSlide);
	
	saveData();
	updateAdminPages();
	alert('Slide başarıyla eklendi!');
}

// Slide düzenle
function editSlide(topicId, slideIndex) {
	const topic = dateTopics.find(t => t.id === topicId);
	if (!topic || !topic.slides) return;
	
	const slide = topic.slides[slideIndex];
	if (!slide) return;
	
	const title = prompt('Slide başlığı:', slide.title);
	if (!title) return;
	
	slide.title = title;
	slide.description = prompt('Açıklama:', slide.description) || slide.description;
	
	saveData();
	updateAdminPages();
	alert('Slide güncellendi!');
}

// Slide sil
function deleteSlide(topicId, slideIndex) {
	if (!confirm('Bu slide\'ı silmek istediğinizden emin misiniz?')) return;
	
	const topic = dateTopics.find(t => t.id === topicId);
	if (!topic || !topic.slides) return;
	
	topic.slides.splice(slideIndex, 1);
	
	saveData();
	updateAdminPages();
	alert('Slide silindi!');
}

// Slide görselleri ekle
function addSlidePhotos(topicId, slideIndex) {
	const topic = dateTopics.find(t => t.id === topicId);
	if (!topic || !topic.slides) return;
	
	const slide = topic.slides[slideIndex];
	if (!slide) return;
	
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'image/*';
	input.multiple = true;
	
	input.onchange = function(e) {
		const files = Array.from(e.target.files);
		files.forEach(file => {
			const reader = new FileReader();
			reader.onload = function(e) {
				if (!slide.photos) slide.photos = [];
				slide.photos.push(e.target.result);
				saveData();
				updateAdminPages();
			};
			reader.readAsDataURL(file);
		});
	};
	
	input.click();
}

// Date konuları listesini güncelle
function updateDateTopicsList() {
	const container = document.getElementById('date-topics-list');
	
	container.innerHTML = dateTopics.map(topic => `
		<div class="date-topic-card">
			<div class="date-topic-header">
				<h4>${topic.title}</h4>
				<span class="topic-level">Level ${topic.level}</span>
			</div>
			<div class="topic-details">
				<p><strong>Konum:</strong> ${topic.location}</p>
				<p><strong>Açıklama:</strong> ${topic.description}</p>
				<p><strong>Aktiviteler:</strong> ${topic.activities.join(', ')}</p>
				<p><strong>Kilit Koşulu:</strong> ${topic.unlockCondition}</p>
				<p><strong>Durum:</strong> ${topic.isActive ? '✅ Aktif' : '🔒 Kilitli'}</p>
				${topic.photos && topic.photos.length > 0 ? `
					<div class="topic-photos">
						<strong>Görseller:</strong>
						<div class="photos-grid-small">
							${topic.photos.map(photo => `
								<div class="photo-item-small">
									<img src="${photo}" alt="Konum fotoğrafı" />
								</div>
							`).join('')}
						</div>
					</div>
				` : ''}
			</div>
			<div class="topic-actions">
				<button class="btn btn-small btn-primary" onclick="editDateTopic('${topic.id}')">Düzenle</button>
				<button class="btn btn-small btn-secondary" onclick="addTopicPhotos('${topic.id}')">Görsel Ekle</button>
				<button class="btn btn-small btn-info" onclick="previewLocation('${topic.id}')">Yeri İncele</button>
				<button class="btn btn-small btn-danger" onclick="deleteDateTopic('${topic.id}')">Sil</button>
			</div>
		</div>
	`).join('');
}

// Yeni date konusu ekle
function addNewDateTopic() {
	const title = prompt('Date konusu başlığı:');
	if (!title) return;
	
	const description = prompt('Açıklama:');
	const location = prompt('Konum:');
	const activities = prompt('Aktiviteler (virgülle ayırın):').split(',').map(a => a.trim());
	const level = parseInt(prompt('Level (1-10):'));
	
	if (!level || level < 1 || level > 10) {
		alert('Geçerli bir level girin (1-10)');
		return;
	}
	
	const newTopic = {
		id: Date.now().toString(),
		title,
		description,
		location,
		activities,
		level,
		unlockCondition: `${level - 1} date tamamlandıktan sonra`,
		isActive: completedDates.length >= level - 1
	};
	
	dateTopics.push(newTopic);
	saveData();
	updateAdminPages();
}

// Date konusu düzenle
function editDateTopic(id) {
	const topic = dateTopics.find(t => t.id === id);
	if (!topic) return;
	
	const title = prompt('Başlık:', topic.title);
	if (!title) return;
	
	topic.title = title;
	topic.description = prompt('Açıklama:', topic.description) || topic.description;
	topic.location = prompt('Konum:', topic.location) || topic.location;
	topic.activities = prompt('Aktiviteler (virgülle ayırın):', topic.activities.join(', ')).split(',').map(a => a.trim());
	
	saveData();
	updateAdminPages();
}

// Date konusu sil
function deleteDateTopic(id) {
	if (confirm('Bu date konusunu silmek istediğinizden emin misiniz?')) {
		dateTopics = dateTopics.filter(t => t.id !== id);
		saveData();
		updateAdminPages();
	}
}

// Topic görselleri ekle
function addTopicPhotos(topicId) {
	const topic = dateTopics.find(t => t.id === topicId);
	if (!topic) return;
	
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'image/*';
	input.multiple = true;
	
	input.onchange = function(e) {
		const files = Array.from(e.target.files);
		files.forEach(file => {
			const reader = new FileReader();
			reader.onload = function(e) {
				if (!topic.photos) topic.photos = [];
				topic.photos.push(e.target.result);
				saveData();
				updateAdminPages();
			};
			reader.readAsDataURL(file);
		});
	};
	
	input.click();
}

// Yeri önizle
function previewLocation(topicId) {
	const topic = dateTopics.find(t => t.id === topicId);
	if (!topic) return;
	
	const modal = document.createElement('div');
	modal.className = 'modal-overlay';
	modal.innerHTML = `
		<div class="modal-content location-preview">
			<div class="modal-header">
				<h3>📍 ${topic.title}</h3>
				<button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
			</div>
			<div class="modal-body">
				<div class="location-info">
					<p><strong>Konum:</strong> ${topic.location}</p>
					<p><strong>Açıklama:</strong> ${topic.description}</p>
					<p><strong>Aktiviteler:</strong> ${topic.activities.join(', ')}</p>
					<p><strong>Level:</strong> ${topic.level}</p>
					<p><strong>Durum:</strong> ${topic.isActive ? '✅ Aktif' : '🔒 Kilitli'}</p>
				</div>
				${topic.photos && topic.photos.length > 0 ? `
					<div class="location-photos">
						<h4>Görseller:</h4>
						<div class="photos-grid-modal">
							${topic.photos.map(photo => `
								<div class="photo-item-modal">
									<img src="${photo}" alt="Konum fotoğrafı" />
								</div>
							`).join('')}
						</div>
					</div>
				` : '<p class="no-photos">Henüz görsel eklenmemiş.</p>'}
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Kapat</button>
				<button class="btn btn-primary" onclick="editDateTopic('${topic.id}'); this.closest('.modal-overlay').remove();">Düzenle</button>
			</div>
		</div>
	`;
	
	document.body.appendChild(modal);
}

// Date konumunu düzenle
function editDateLocation() {
	if (!currentDate) {
		alert('Aktif date bulunmuyor.');
		return;
	}
	
	const newLocation = prompt('Yeni konum:', currentDate.location);
	if (!newLocation) return;
	
	currentDate.location = newLocation;
	saveData();
	updateNextDatePage();
	alert('Konum güncellendi!');
}

// Date açıklamasını düzenle
function editDateDescription() {
	if (!currentDate) {
		alert('Aktif date bulunmuyor.');
		return;
	}
	
	const newDescription = prompt('Yeni açıklama:', currentDate.description || '');
	if (newDescription === null) return;
	
	currentDate.description = newDescription;
	saveData();
	updateNextDatePage();
	alert('Açıklama güncellendi!');
}

// Date saatini düzenle
function editDateTime() {
	if (!currentDate) {
		alert('Aktif date bulunmuyor.');
		return;
	}
	
	const currentTime = new Date(currentDate.dateTime);
	const timeString = currentTime.toTimeString().slice(0, 5);
	const newTime = prompt('Yeni saat (HH:MM):', timeString);
	
	if (!newTime) return;
	
	// Saat formatını kontrol et
	const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
	if (!timeRegex.test(newTime)) {
		alert('Geçerli bir saat formatı girin (HH:MM)');
		return;
	}
	
	const [hours, minutes] = newTime.split(':');
	const newDateTime = new Date(currentDate.dateTime);
	newDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
	
	currentDate.dateTime = newDateTime.toISOString();
	saveData();
	updateNextDatePage();
	updateHomePage();
	alert('Date saati güncellendi!');
}

// Rota konumunu güncelle
function updateRouteLocation(routeIndex, newLocation) {
	if (!currentDate) return;
	
	const currentTopic = dateTopics.find(t => t.title === currentDate.topic);
	if (!currentTopic || !currentTopic.routes || !currentTopic.routes[routeIndex]) return;
	
	currentTopic.routes[routeIndex].location = newLocation;
	saveData();
}

// Rota açıklamasını güncelle
function updateRouteDescription(routeIndex, newDescription) {
	if (!currentDate) return;
	
	const currentTopic = dateTopics.find(t => t.title === currentDate.topic);
	if (!currentTopic || !currentTopic.routes || !currentTopic.routes[routeIndex]) return;
	
	currentTopic.routes[routeIndex].description = newDescription;
	saveData();
}

// Rota görselleri ekle
function addRoutePhotos(routeIndex) {
	if (!currentDate) return;
	
	const currentTopic = dateTopics.find(t => t.title === currentDate.topic);
	if (!currentTopic || !currentTopic.routes || !currentTopic.routes[routeIndex]) return;
	
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'image/*';
	input.multiple = true;
	
	input.onchange = function(e) {
		const files = Array.from(e.target.files);
		files.forEach(file => {
			const reader = new FileReader();
			reader.onload = function(e) {
				if (!currentTopic.routes[routeIndex].photos) currentTopic.routes[routeIndex].photos = [];
				currentTopic.routes[routeIndex].photos.push(e.target.result);
				saveData();
				updateNextDatePage();
			};
			reader.readAsDataURL(file);
		});
	};
	
	input.click();
}

// Image slider fonksiyonları
function changeSlide(routeIndex, direction) {
	const currentTopic = dateTopics.find(t => t.title === currentDate.topic);
	if (!currentTopic || !currentTopic.routes || !currentTopic.routes[routeIndex]) return;
	
	const photos = currentTopic.routes[routeIndex].photos;
	if (!photos || photos.length <= 1) return;
	
	window[`currentSlide_${routeIndex}`] += direction;
	
	if (window[`currentSlide_${routeIndex}`] >= photos.length) {
		window[`currentSlide_${routeIndex}`] = 0;
	} else if (window[`currentSlide_${routeIndex}`] < 0) {
		window[`currentSlide_${routeIndex}`] = photos.length - 1;
	}
	
	updateSliderDisplay(routeIndex);
}

function goToSlide(routeIndex, slideIndex) {
	const currentTopic = dateTopics.find(t => t.title === currentDate.topic);
	if (!currentTopic || !currentTopic.routes || !currentTopic.routes[routeIndex]) return;
	
	const photos = currentTopic.routes[routeIndex].photos;
	if (!photos || slideIndex < 0 || slideIndex >= photos.length) return;
	
	window[`currentSlide_${routeIndex}`] = slideIndex;
	updateSliderDisplay(routeIndex);
}

function updateSliderDisplay(routeIndex) {
	const slider = document.getElementById(`slider-${routeIndex}`);
	if (!slider) return;
	
	const slides = slider.querySelectorAll('.slide');
	const dots = slider.querySelectorAll('.dot');
	const currentSlide = window[`currentSlide_${routeIndex}`];
	
	// Tüm slide'ları gizle
	slides.forEach(slide => slide.classList.remove('active'));
	dots.forEach(dot => dot.classList.remove('active'));
	
	// Aktif slide'ı göster
	if (slides[currentSlide]) slides[currentSlide].classList.add('active');
	if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

// Date başlığını güncelle
function updateDateTitle(newTitle) {
	if (!currentDate) return;
	
	const currentTopic = dateTopics.find(t => t.title === currentDate.topic);
	if (!currentTopic) return;
	
	currentTopic.title = newTitle;
	currentDate.topic = newTitle;
	saveData();
	updateNextDatePage();
}

// Date açıklamasını güncelle
function updateDateDescription(newDescription) {
	if (!currentDate) return;
	
	const currentTopic = dateTopics.find(t => t.title === currentDate.topic);
	if (!currentTopic) return;
	
	currentTopic.description = newDescription;
	saveData();
}

// Yeni rota ekle
function addNewRoute() {
	if (!currentDate) return;
	
	const currentTopic = dateTopics.find(t => t.title === currentDate.topic);
	if (!currentTopic) return;
	
	if (!currentTopic.routes) currentTopic.routes = [];
	
	const newRoute = {
		title: `Rota ${currentTopic.routes.length + 1}`,
		description: '',
		photos: [],
		instagram: '',
		mapAddress: ''
	};
	
	currentTopic.routes.push(newRoute);
	saveData();
	updateNextDatePage();
}

// Rotayı sil
function deleteRoute(routeIndex) {
	if (!currentDate) return;
	
	const currentTopic = dateTopics.find(t => t.title === currentDate.topic);
	if (!currentTopic || !currentTopic.routes) return;
	
	if (confirm('Bu rotayı silmek istediğinizden emin misiniz?')) {
		currentTopic.routes.splice(routeIndex, 1);
		saveData();
		updateNextDatePage();
	}
}

// Rota başlığını düzenle
function editRouteTitle(routeIndex) {
	if (!currentDate) return;
	
	const currentTopic = dateTopics.find(t => t.title === currentDate.topic);
	if (!currentTopic || !currentTopic.routes || !currentTopic.routes[routeIndex]) return;
	
	const newTitle = prompt('Yeni rota başlığı:', currentTopic.routes[routeIndex].title);
	if (newTitle && newTitle.trim()) {
		currentTopic.routes[routeIndex].title = newTitle.trim();
		saveData();
		updateNextDatePage();
	}
}

// Rota fotoğrafını sil
function deleteRoutePhoto(routeIndex, photoIndex) {
	if (!currentDate) return;
	
	const currentTopic = dateTopics.find(t => t.title === currentDate.topic);
	if (!currentTopic || !currentTopic.routes || !currentTopic.routes[routeIndex]) return;
	
	if (confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) {
		currentTopic.routes[routeIndex].photos.splice(photoIndex, 1);
		saveData();
		updateNextDatePage();
	}
}

// Rota Instagram adresini güncelle
function updateRouteInstagram(routeIndex, newInstagram) {
	if (!currentDate) return;
	
	const currentTopic = dateTopics.find(t => t.title === currentDate.topic);
	if (!currentTopic || !currentTopic.routes || !currentTopic.routes[routeIndex]) return;
	
	currentTopic.routes[routeIndex].instagram = newInstagram;
	saveData();
}

// Rota Map adresini güncelle
function updateRouteMap(routeIndex, newMapAddress) {
	if (!currentDate) return;
	
	const currentTopic = dateTopics.find(t => t.title === currentDate.topic);
	if (!currentTopic || !currentTopic.routes || !currentTopic.routes[routeIndex]) return;
	
	currentTopic.routes[routeIndex].mapAddress = newMapAddress;
	saveData();
}

// Slide navigasyon fonksiyonları
function changeSlide(direction) {
	if (!window.totalSlides) return;
	
	window.currentSlideIndex += direction;
	
	// Döngüsel navigasyon
	if (window.currentSlideIndex >= window.totalSlides) {
		window.currentSlideIndex = 0;
	} else if (window.currentSlideIndex < 0) {
		window.currentSlideIndex = window.totalSlides - 1;
	}
	
	updateSlideDisplay();
}

function goToSlide(index) {
	if (!window.totalSlides || index < 0 || index >= window.totalSlides) return;
	
	window.currentSlideIndex = index;
	updateSlideDisplay();
}

function updateSlideDisplay() {
	// Tüm slide'ları gizle
	document.querySelectorAll('.slide-item').forEach(slide => {
		slide.classList.remove('active');
	});
	
	// Tüm dot'ları pasif yap
	document.querySelectorAll('.slide-dot').forEach(dot => {
		dot.classList.remove('active');
	});
	
	// Aktif slide'ı göster
	const activeSlide = document.querySelector(`[data-slide="${window.currentSlideIndex}"]`);
	if (activeSlide) {
		activeSlide.classList.add('active');
	}
	
	// Aktif dot'ı işaretle
	const activeDot = document.querySelectorAll('.slide-dot')[window.currentSlideIndex];
	if (activeDot) {
		activeDot.classList.add('active');
	}
	
	// Sayaç güncelle
	const counter = document.getElementById('current-slide');
	if (counter) {
		counter.textContent = window.currentSlideIndex + 1;
	}
}

// Geçmiş date ekle
function addPastDate() {
	const date = document.getElementById('past-date-date').value;
	const time = document.getElementById('past-date-time').value;
	const topic = document.getElementById('past-date-topic').value;
	const location = document.getElementById('past-date-location').value;
	const photosInput = document.getElementById('past-date-photos');
	
	if (!date || !time || !topic || !location) {
		alert('Lütfen tüm alanları doldurun.');
		return;
	}
	
	const dateTime = new Date(date + 'T' + time);
	
	if (dateTime > new Date()) {
		alert('Geçmiş bir tarih seçin.');
		return;
	}
	
	const photos = [];
	if (photosInput.files.length > 0) {
		for (let i = 0; i < photosInput.files.length; i++) {
			const file = photosInput.files[i];
			const reader = new FileReader();
			reader.onload = function(e) {
				photos.push(e.target.result);
				if (photos.length === photosInput.files.length) {
					completePastDate(dateTime, topic, location, photos);
				}
			};
			reader.readAsDataURL(file);
		}
	} else {
		completePastDate(dateTime, topic, location, photos);
	}
}

function completePastDate(dateTime, topic, location, photos) {
	const pastDate = {
		id: Date.now().toString(),
		dateTime: dateTime.toISOString(),
		location,
		topic,
		completed: new Date().toISOString(),
		photos
	};
	
	completedDates.unshift(pastDate);
	
	// Formu temizle
	document.getElementById('past-date-date').value = '';
	document.getElementById('past-date-time').value = '';
	document.getElementById('past-date-topic').value = '';
	document.getElementById('past-date-location').value = '';
	document.getElementById('past-date-photos').value = '';
	
	// Date konularını güncelle
	updateDateTopicsUnlock();
	
	saveData();
	updateAdminPages();
	alert('Geçmiş date başarıyla eklendi!');
}

// Admin şifre değiştir
function changeAdminPassword() {
	const newPassword = document.getElementById('new-admin-password').value;
	if (!newPassword) {
		alert('Yeni şifre girin.');
		return;
	}
	
	adminPassword = newPassword;
	document.getElementById('new-admin-password').value = '';
	saveData();
	alert('Şifre başarıyla değiştirildi!');
}

// Tüm verileri temizle
function clearAllData() {
	if (confirm('TÜM VERİLER SİLİNECEK! Bu işlem geri alınamaz. Emin misiniz?')) {
		localStorage.clear();
		currentDate = null;
		completedDates = [];
		dateTopics = [...defaultDateTopics];
		adminPassword = 'admin123';
		isAdminLoggedIn = false;
		saveData();
		location.reload();
	}
}

// Verileri dışa aktar
function exportData() {
	const data = {
		currentDate,
		completedDates,
		dateTopics,
		adminPassword,
		exportDate: new Date().toISOString()
	};
	
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `date-game-backup-${new Date().toISOString().split('T')[0]}.json`;
	a.click();
	URL.revokeObjectURL(url);
}

// Verileri içe aktar
function importData(input) {
	const file = input.files[0];
	if (!file) return;
	
	const reader = new FileReader();
	reader.onload = function(e) {
		try {
			const data = JSON.parse(e.target.result);
			
			if (data.currentDate) currentDate = data.currentDate;
			if (data.completedDates) completedDates = data.completedDates;
			if (data.dateTopics) dateTopics = data.dateTopics;
			if (data.adminPassword) adminPassword = data.adminPassword;
			
			saveData();
			updateHomePage();
			updateAdminPages();
			alert('Veriler başarıyla içe aktarıldı!');
		} catch (error) {
			alert('Dosya formatı hatalı!');
		}
	};
	reader.readAsText(file);
}

// Sonraki date önizlemesini güncelle
function updateNextDatePreview() {
	const container = document.getElementById('next-date-preview');
	
	const nextTopic = dateTopics.find(topic => topic.isActive && !currentDate);
	if (!nextTopic) {
		container.innerHTML = '<p>Henüz aktif date konusu bulunmuyor.</p>';
		return;
	}
	
	container.innerHTML = `
		<h4>${nextTopic.title}</h4>
		<p><strong>Konum:</strong> ${nextTopic.location}</p>
		<p><strong>Açıklama:</strong> ${nextTopic.description}</p>
		<p><strong>Aktiviteler:</strong> ${nextTopic.activities.join(', ')}</p>
	`;
}

// Admin tab değiştir
function switchAdminTab(tabId) {
	// Tüm tab'ları pasif yap
	document.querySelectorAll('.admin-tab').forEach(tab => {
		tab.classList.remove('active');
	});
	document.querySelectorAll('.admin-tab-content').forEach(content => {
		content.classList.remove('active');
	});
	
	// Seçilen tab'ı aktif yap
	document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
	document.getElementById(`tab-${tabId}`).classList.add('active');
}

// Nav link event listeners
document.addEventListener('DOMContentLoaded', function() {
	// Verileri yükle
	loadData();
	
	// Nav linklerini ayarla
	document.querySelectorAll('.nav-link').forEach(link => {
		link.addEventListener('click', function() {
			const pageId = this.getAttribute('data-page');
			showPage(pageId);
			// Hash'i güncelle
			location.hash = pageId;
		});
	});
	
	// Admin tab'larını ayarla
	document.querySelectorAll('.admin-tab').forEach(tab => {
		tab.addEventListener('click', function() {
			const tabId = this.getAttribute('data-tab');
			switchAdminTab(tabId);
		});
	});
	
	// İlk yüklemede hash'e göre göster
	handleHashRoute();
	
	// Hash değişimlerinde sayfa değiştir
	window.addEventListener('hashchange', handleHashRoute);
	
	// Date konularının kilit durumunu güncelle
	updateDateTopicsUnlock();
	
	// Geri sayım interval'ı
	setInterval(() => {
		if (currentDate && new Date(currentDate.dateTime) > new Date()) {
			updateCountdown();
		} else if (currentDate && new Date(currentDate.dateTime) <= new Date()) {
			// Date zamanı geldi, tamamla
			completeDate();
		}
	}, 1000);
});