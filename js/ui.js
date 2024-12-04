// 存储标记数据的数组
let markers = [];

// 标记类型对应的颜色和图标
const markerStyles = {
roadChange: { color: '#00FFFF', icon: '🛣️' },
construction: { color: '#FF00FF', icon: '🚧' },
traffic: { color: '#FFFF00', icon: '🚦' },
incident: { color: '#FF0000', icon: '⚠️' },
hazard: { color: '#FFA500', icon: '⚠️' },
closure: { color: '#FF0000', icon: '🚫' },
newRoad: { color: '#00FF00', icon: '🛣️' },
infrastructure: { color: '#4169E1', icon: '🏗️' },
accident: { color: '#FF4500', icon: '💥' },
testing: { color: '#9400D3', icon: '🚗' },
parking: { color: '#1E90FF', icon: '🅿️' },
charging: { color: '#32CD32', icon: '⚡' }
};

// 初始化标记功能
function initializeMarkers() {
const addMarkerBtn = document.getElementById('add-marker-btn');
const markerForm = document.getElementById('marker-form');
const addMarkerForm = document.getElementById('add-marker-form');
const descriptionField = document.getElementById('marker-description');

let selectedLocation = null;

// 点击"Add Marker"按钮显示表单
addMarkerBtn.addEventListener('click', () => {
markerForm.style.display = 'block';
descriptionField.readOnly = true;
});

// 点击地图选择位置
map.on('click', (e) => {
selectedLocation = e.lngLat;
showTemporaryMarker(selectedLocation);
markerForm.style.display = 'block';
descriptionField.readOnly = true;

// 添加点击动画效果
const ripple = document.createElement('div');
ripple.className = 'map-click-ripple';
ripple.style.left = e.point.x + 'px';
ripple.style.top = e.point.y + 'px';
document.body.appendChild(ripple);
setTimeout(() => ripple.remove(), 1000);
});

// 取消按钮事件
document.querySelector('.cancel').addEventListener('click', () => {
markerForm.style.display = 'none';
removeTemporaryMarker();
selectedLocation = null;
addMarkerForm.reset();
descriptionField.readOnly = true;
});

// 提交表单
addMarkerForm.addEventListener('submit', (e) => {
e.preventDefault();

// 检查是否有选择位置
if (!selectedLocation) {
showNotification('Please select a location on the map', 'error');
return;
}

// 检查描述是否为空
if (!descriptionField.value.trim()) {
if (descriptionField.readOnly) {
descriptionField.readOnly = false;
descriptionField.focus();
showNotification('You can now enter description', 'info');
return;
}
showNotification('Please enter a description', 'error');
descriptionField.focus();
return;
}

if (descriptionField.readOnly) {
descriptionField.readOnly = false;
descriptionField.focus();
showNotification('You can now enter description', 'info');
return;
}

const newMarker = {
id: Date.now(),
type: document.getElementById('marker-type').value,
description: descriptionField.value,
duration: document.getElementById('marker-duration').value,
location: selectedLocation,
timestamp: new Date().toISOString()
};

// 添加标记到地图
addMarkerToMap(newMarker);

// 保存标记数据
markers.push(newMarker);

// 更新标记列表
updateMarkerList();

// 保存到本地存储
saveMarkers();

// 重置表单和临时标记
addMarkerForm.reset();
markerForm.style.display = 'none';
removeTemporaryMarker();
selectedLocation = null;
descriptionField.readOnly = true;

// 显示成功通知
showNotification('Marker added successfully', 'success');
});
}

// 临时标记变量
let temporaryMarker = null;

// 显示临时标记
function showTemporaryMarker(location) {
removeTemporaryMarker();

const el = document.createElement('div');
el.className = 'marker-icon temporary';
el.style.backgroundColor = '#FFFFFF';
el.style.opacity = '0.7';

temporaryMarker = new mapboxgl.Marker(el)
.setLngLat(location)
.addTo(map);
}

// 移除临时标记
function removeTemporaryMarker() {
if (temporaryMarker) {
temporaryMarker.remove();
temporaryMarker = null;
}
}

// 添加标记到地图
function addMarkerToMap(markerData) {
const style = markerStyles[markerData.type];

// 创建标记元素
const el = document.createElement('div');
el.className = 'marker-icon';
el.classList.add(markerData.type);

// 创建弹出窗口
const popup = new mapboxgl.Popup({
offset: 25,
closeButton: true,
closeOnClick: false
}).setHTML(`
<div class="popup-content">
<h3>${style.icon} ${markerData.type.toUpperCase()}</h3>
<p>${markerData.description}</p>
<p><small>Duration: ${markerData.duration}</small></p>
<p><small>Added: ${new Date(markerData.timestamp).toLocaleString()}</small></p>
</div>
`);

// 添加标记到地图
new mapboxgl.Marker(el)
.setLngLat(markerData.location)
.setPopup(popup)
.addTo(map);
}

// 更新标记列表
function updateMarkerList() {
const markerList = document.getElementById('marker-list');
markerList.innerHTML = markers.map(marker => {
const style = markerStyles[marker.type];
return `
<div class="marker-item" data-id="${marker.id}">
<h4>${style.icon} ${marker.type.toUpperCase()}</h4>
<p>${marker.description}</p>
<small>
Added: ${new Date(marker.timestamp).toLocaleString()}<br>
Duration: ${marker.duration}
</small>
</div>
`;
}).join('');

// 添加点击事件
document.querySelectorAll('.marker-item').forEach(item => {
item.addEventListener('click', () => {
const marker = markers.find(m => m.id === parseInt(item.dataset.id));
if (marker) {
map.flyTo({
center: [marker.location.lng, marker.location.lat],
zoom: 15,
duration: 1000
});
}
});
});
}

// 加载保存的标记
function loadSavedMarkers() {
const savedMarkers = localStorage.getItem('markers');
if (savedMarkers) {
markers = JSON.parse(savedMarkers);
markers.forEach(marker => addMarkerToMap(marker));
updateMarkerList();
}
}

// 保存标记到本地存储
function saveMarkers() {
localStorage.setItem('markers', JSON.stringify(markers));
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
initializeMarkers();
loadSavedMarkers();
});

// 在页面关闭前保存标记
window.addEventListener('beforeunload', saveMarkers);
