/* L.CONTROL.LAYERS(baseMaps, overlayMaps).addTo(map) */
L.control.groupedLayers(baseMaps, groupedOverlays, opciones_groupedlayers).addTo(map);
map.on('overlayadd', onOverlayAdd);
map.on('overlayremove', onOverlayRemove);
L.control.scale().addTo(map);
L.control.polylineMeasure().addTo(map);
L.streetView({ position: 'topleft' }).addTo(map);
L.streetView1({ position: 'topleft' }).addTo(map);


/* IMPRESIÓN DE PANTALLA */
 var customActionToPrint = function(context, mode) {
  return function() {
  window.alert("We are printing the MAP. Let's do Custom print here!");
  context._printMode(mode);
   }};

    L.control.browserPrint({
      title: 'Impresión de pantalla',
      //documentTitle: 'Map printed using leaflet.browser.print plugin',
      printLayer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', godoycruz),
      closePopupsOnPrint: false,
      printModes: [
        L.BrowserPrint.Mode.Auto("A4",{title: "Auto"}),
        L.BrowserPrint.Mode.Custom("A3",{title:"Selecionar"})],
        manualMode: false}).addTo(map);
    

/* CARGA ARCHIVOS */
(function (window) {
    
    function initMap() {
    var control;
    var L = window.L;

    var style = {
     color: 'red',
     opacity: 1.0,
     fillOpacity: 1.0,
     weight: 2,
     clickable: false
    };

L.Control.FileLayerLoad.LABEL = '<img class="icon" src="js/nube.png" alt="file icon"/>';
control = L.Control.fileLayerLoad({
    fitBounds: true,
    layerOptions: {
        style: style,
        pointToLayer: function (data, latlng) {
            return L.circleMarker(
                latlng,
                { style: style }
            );
        }
    }
});
control.addTo(map);
control.loader.on('data:loaded', function (e) {
    var layer = e.layer;
    console.log(layer);
});}

window.addEventListener('load', function () {
 initMap();
 });}(window));


/* COORDENADAS CLICK MOUSE */
  var c = new L.Control.Coordinates();
c.addTo(map);
    function onMapClick(e) {
       c.setCoordinates(e);
    }map.on('click', onMapClick);


/* TEXTOS CICLOVIAS */
function onOverlayAdd(e) {
    idlayer = "";
     if (e.name == "Ciclovías Existentes") {
        idlayer = "cicloviasexist";
    } else if (e.name == "Ciclovías Proyectadas DAMI II") {
        idlayer = "cicloDami"
    } else if (e.name == "Ciclovías en Ejecución DAMI II") {
        idlayer = "cicloEjec"
    } else if (e.name == "Ciclovías Habilitadas DAMI II") {
        idlayer = "CicloviasHabilitaDami"
    }

    document.getElementById("ref_" + idlayer).style.display = 'block';
}

function onOverlayRemove(e) {
    idlayer = "";
    if (e.name == "Ciclovías Existentes") {
        idlayer = "cicloviasexist";
    } else if (e.name == "Ciclovías Proyectadas DAMI II") {
        idlayer = "cicloDami"
    } else if (e.name == "Ciclovías en Ejecución DAMI II") {
        idlayer = "cicloEjec"
    } else if (e.name == "Ciclovías Habilitadas DAMI II") {
        idlayer = "CicloviasHabilitaDami"
    }

    document.getElementById("ref_" + idlayer).style.display = 'none';
}
include('logger.php');