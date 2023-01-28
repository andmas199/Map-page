import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Link from 'ol/interaction/Link';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {circular} from 'ol/geom/Polygon';
import { fromLonLat } from 'ol/proj';
import Control from 'ol/control/Control';


let theme_status = window.matchMedia("(prefers-color-scheme: dark)"); //If true, dark theme is enabled, else light theme is enabled
//Look for elements and save them as a variable
const theme_button = document.getElementById("theme_button");
let selected_theme = theme_status.matches;
const geolocation_source = new VectorSource();
const geolocation_layer = new VectorLayer({
  source: geolocation_source,
});
const map_html = document.getElementById("map");
const locate = document.getElementById('locate');


//Create a map
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

map.addLayer(geolocation_layer);
navigator.geolocation.watchPosition(
  function (pos) {
    const coords = [pos.coords.longitude, pos.coords.latitude];
    const accuracy = circular(coords, pos.coords.accuracy);
    geolocation_source.clear(true);
    geolocation_source.addFeatures([
      new Feature(
        accuracy.transform('EPSG:4326', map.getView().getProjection())
      ),
      new Feature(new Point(fromLonLat(coords))),
    ]);
  },
  function (error) {
    alert(`ERROR: ${error.message}`);
  },
  {
    enableHighAccuracy: true,
  }
);

locate.className = 'ol-control ol-unselectable locate';
locate.addEventListener('click', function () {
  if (!geolocation_source.isEmpty()) {
    map.getView().fit(geolocation_source.getExtent(), {
      maxZoom: 18,
      duration: 500,
    });
  }
});
map.addControl(
  new Control({
    element: locate,
  })
);

theme_status.addEventListener("change",e => {
  if(e.matches) {
    theme_button.className = "dark_tools";
    map_html.className = "dark_map";
  }
  else {
    theme_button.className = "light_tools";
    map_html.className = "light_map";
  }
});

//Changes the theme of the map
function change_theme() {
  if(selected_theme) {
    theme_button.className = "dark_tools";
    map_html.className = "dark_map";
    selected_theme = false;
  }
  else {
    theme_button.className = "light_tools";
    map_html.className = "light_map";
    selected_theme = true;
  }
}

//Setting the initial theme for the map
change_theme();
//Save position on map when reloading
map.addInteraction(new Link());

//When clicking the button change theme
theme_button.addEventListener("click",change_theme);


