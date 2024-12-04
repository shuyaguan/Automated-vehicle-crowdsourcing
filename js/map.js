// Mapbox访问令牌
const mapboxToken = 'pk.eyJ1IjoiZ3NodXlhIiwiYSI6ImNtMHk2bjRodTBrNmIya29obmc2OG5kZTUifQ.TM9gfDCRHU_yorUj8CQHSA';

// 初始化地图
mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/dark-v10',
center: [-122.4194, 37.7749], // 旧金山坐标
zoom: 12,
minZoom: 2,
maxZoom: 18
});

// 等待地图加载
map.on('load', () => {
// 添加交通流量图层
map.addLayer({
'id': 'traffic-flow',
'type': 'line',
'source': {
'type': 'vector',
'url': 'mapbox://mapbox.mapbox-traffic-v1'
},
'source-layer': 'traffic',
'paint': {
'line-color': [
'match',
['get', 'congestion'],
'low', '#00FF00',
'moderate', '#FFFF00',
'heavy', '#FF0000',
'severe', '#FF00FF',
'#FFFFFF'
],
'line-width': 2,
'line-opacity': 0.7
}
});

// 添加3D建筑物图层
map.addLayer({
'id': '3d-buildings',
'source': 'composite',
'source-layer': 'building',
'filter': ['==', 'extrude', 'true'],
'type': 'fill-extrusion',
'minzoom': 15,
'paint': {
'fill-extrusion-color': [
'interpolate',
['linear'],
['get', 'height'],
0, '#0B1A2F',
50, '#00FFFF',
100, '#FF00FF',
200, '#0080FF'
],
'fill-extrusion-height': ['get', 'height'],
'fill-extrusion-base': ['get', 'min_height'],
'fill-extrusion-opacity': 0.5,
'fill-extrusion-vertical-gradient': true
}
});

// 添加道路网络图层
map.addLayer({
'id': 'road-network',
'type': 'line',
'source': {
'type': 'vector',
'url': 'mapbox://mapbox.mapbox-streets-v8'
},
'source-layer': 'road',
'paint': {
'line-color': '#00FFFF',
'line-width': [
'interpolate',
['linear'],
['zoom'],
12, 1,
16, 3
],
'line-opacity': 0.6
}
});

// 添加兴趣点标签
map.addLayer({
'id': 'poi-labels',
'type': 'symbol',
'source': {
'type': 'vector',
'url': 'mapbox://mapbox.mapbox-streets-v8'
},
'source-layer': 'poi_label',
'layout': {
'text-field': ['get', 'name'],
'text-size': 12,
'text-anchor': 'top',
'text-offset': [0, 1],
'icon-image': ['get', 'maki'],
'icon-size': 1
},
'paint': {
'text-color': '#00FFFF',
'text-halo-color': '#000000',
'text-halo-width': 1
}
});

// 添加地铁线路
map.addLayer({
'id': 'transit-lines',
'type': 'line',
'source': {
'type': 'vector',
'url': 'mapbox://mapbox.mapbox-streets-v8'
},
'source-layer': 'transit_line',
'paint': {
'line-color': '#FF00FF',
'line-width': 2,
'line-opacity': 0.8
}
});
});

// 添加地图控件
map.addControl(new mapboxgl.NavigationControl(), 'top-right');
map.addControl(new mapboxgl.ScaleControl({
maxWidth: 100,
unit: 'metric'
}), 'bottom-left');

// 图层切换功能
document.addEventListener('DOMContentLoaded', () => {
const layers = {
'traffic-flow': 'traffic-flow-toggle',
'poi-labels': 'poi-labels-toggle',
'3d-buildings': '3d-buildings-toggle',
'transit-lines': 'transit-lines-toggle'
};

Object.entries(layers).forEach(([layerId, toggleId]) => {
const toggle = document.getElementById(toggleId);
if (toggle) {
toggle.addEventListener('change', (e) => {
const visibility = e.target.checked ? 'visible' : 'none';
map.setLayoutProperty(layerId, 'visibility', visibility);
});
}
});
});

// 错误处理
map.on('error', (e) => {
console.error('Map error:', e.error);
});

// 导出地图实例
window.map = map;
