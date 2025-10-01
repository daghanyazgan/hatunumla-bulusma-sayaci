// Date yönetimi ve sayfa geçişleri
let currentDate = null;
let completedDates = [];

// LocalStorage'dan verileri yükle
function loadData() {
	const savedDate = localStorage.getItem('currentDate');
	const savedCompleted = localStorage.getItem('completedDates');
	
	if (savedDate) {
		currentDate = JSON.parse(savedDate);
	}
	
	if (savedCompleted) {
		completedDates = JSON.parse(savedCompleted);
	}
}

// Verileri kaydet
function saveData() {
	if (currentDate) {
		localStorage.setItem('currentDate', JSON.stringify(currentDate));
	}
	localStorage.setItem('completedDates', JSON.stringify(completedDates));
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
	}
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
	const dateInput = document.getElementById('date-input').value;
	const timeInput = document.getElementById('time-input').value;
	const locationInput = document.getElementById('location-input').value;
	
	if (!dateInput || !timeInput) {
		alert('Lütfen tarih ve saat seçiniz.');
		return;
	}
	
	const dateTime = new Date(dateInput + 'T' + timeInput);
	
	if (dateTime <= new Date()) {
		alert('Gelecek bir tarih seçiniz.');
		return;
	}
	
	currentDate = {
		dateTime: dateTime.toISOString(),
		location: locationInput || 'Belirtilmemiş',
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
	
	container.innerHTML = `
		<div class="next-date-card">
			<h3>${date.toLocaleDateString('tr-TR', options)}</h3>
			<p class="location">📍 ${currentDate.location}</p>
			
			<div class="date-preview">
				<div class="preview-section">
					<h4>Planlanan Aktivite</h4>
					<p>Romantik bir akşam geçireceğiz. Detaylar sürpriz! 😊</p>
				</div>
				
				<div class="preview-section">
					<h4>Hava Durumu</h4>
					<p>🌤️ Güneşli ve sıcak bir gün bekleniyor.</p>
				</div>
				
				<div class="preview-section">
					<h4>Konum</h4>
					<div class="map-placeholder">
						🗺️ Harita yükleniyor...
						<small>${currentDate.location}</small>
					</div>
				</div>
			</div>
		</div>
	`;
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
		completed: new Date().toISOString(),
		photos: []
	};
	
	completedDates.unshift(completedDate);
	currentDate = null;
	saveData();
	updateHomePage();
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
		});
	});
	
	// Ana sayfayı güncelle
	updateHomePage();
	
	// Geri sayım interval'ı
	setInterval(() => {
		if (currentDate && new Date(currentDate.dateTime) > new Date()) {
			updateCountdown();
		} else if (currentDate && new Date(currentDate.dateTime) <= new Date()) {
			// Date zamanı geldi, tamamla
			completeDate();
		}
	}, 1000);
	
	// Date input'larını bugünden sonrasına sınırla
	const dateInput = document.getElementById('date-input');
	if (dateInput) {
		const today = new Date().toISOString().split('T')[0];
		dateInput.min = today;
	}
});