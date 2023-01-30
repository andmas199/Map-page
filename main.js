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
import {Draw,Modify,Snap} from 'ol/interaction.js';
import { LineString } from 'ol/geom';
import { stopPropagation } from 'ol/events/Event';


let theme_status = window.matchMedia("(prefers-color-scheme: dark)"); //If true, dark theme is enabled, else light theme is enabled
//Look for elements and save them as a variable
const theme_button = document.getElementById("theme_button");
let selected_theme = theme_status.matches;
const drawing = new VectorSource();
const geolocation_source = new VectorSource();
const geolocation_layer = new VectorLayer({
  source: geolocation_source,
});
const map_html = document.getElementById("map");
const locate = document.getElementById('locate');
const vector = new VectorLayer({
  source: drawing,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.2)',
    'stroke-color': '#ffcc33',
    'stroke-width': 2,
    'circle-radius': 7,
    'circle-fill-color': '#ffcc33',
  },
});

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

map.addLayer(vector);
const modify = new Modify({source: drawing});
map.addInteraction(modify);

//Geolocation thing, dont touch this
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

//locate.className = 'ol-control ol-unselectable locate';
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
map.addControl(
  new Control({
    element: locate_button, 
  })
);
map.addControl(
  new Control({
    element: draw_button, 
  })
);

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

function draw_line() {
  const line = new Draw({
    source: drawing,
    type: 'LineString',
  });
  document.body.addEventListener("keyup",function(e) {
    if(e.key == "Escape") {
      line.abortDrawing();
    }
  })
  map.addInteraction(line);
  let snap = new Snap({source:drawing});
  map.addInteraction(snap);
  addEventListener('contextmenu', e => {
    map.removeInteraction(line)
  });

}

//Setting the initial theme for the map
change_theme();
//Save position on map when reloading
map.addInteraction(new Link());

//When clicking the button change theme
theme_button.addEventListener("click",change_theme);
draw_button.addEventListener("click",draw_line);
//When changing the browsers theme from light to dark, the map also changes
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
