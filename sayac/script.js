// Hedef tarih: 29 Eyl 2025 Pazartesi 15:00 (İstanbul, UTC+03)
const TARGET_ISO = '2025-09-29T15:00:00+03:00';
const targetDate = new Date(TARGET_ISO); // Evrensel sabit zaman damgası

const elDays = document.getElementById('days');
const elHours = document.getElementById('hours');
const elMinutes = document.getElementById('minutes');
const elSeconds = document.getElementById('seconds');
const doneText = document.getElementById('doneText');

function pad2(value) {
	return String(value).padStart(2, '0');
}

function updateCountdown() {
	const now = new Date();
	let diff = targetDate.getTime() - now.getTime();

	if (diff <= 0) {
		elDays.textContent = '00';
		elHours.textContent = '00';
		elMinutes.textContent = '00';
		elSeconds.textContent = '00';
		doneText.hidden = false;
		return;
	}

	const secondsTotal = Math.floor(diff / 1000);
	const days = Math.floor(secondsTotal / (24 * 60 * 60));
	const hours = Math.floor((secondsTotal % (24 * 60 * 60)) / (60 * 60));
	const minutes = Math.floor((secondsTotal % (60 * 60)) / 60);
	const seconds = secondsTotal % 60;

	elDays.textContent = days.toString().padStart(2, '0');
	elHours.textContent = pad2(hours);
	elMinutes.textContent = pad2(minutes);
	elSeconds.textContent = pad2(seconds);
}

updateCountdown();
const interval = setInterval(() => {
	updateCountdown();
	if (!doneText.hidden) {
		clearInterval(interval);
	}
}, 1000); 