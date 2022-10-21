/* ICONOS */
var iconoComun = L.Icon.extend({
    options: {
        shadowUrl: 'img/marker-shadow.png',
        iconSize: [25, 41],
        shadowSize: [41, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    }
});

var iconoVerde = new iconoComun({ iconUrl: 'img/marker-icon-2x-green.png' }),
    iconoRojo = new iconoComun({ iconUrl: 'img/marker-icon-2x-red.png' }),
    iconoNegro = new iconoComun({ iconUrl: 'img/marker-icon-2x-black.png' }),
    iconoAzul = new iconoComun({ iconUrl: 'img/marker-icon-2x-blue.png' }),
    iconoDorado = new iconoComun({ iconUrl: 'img/marker-icon-2x-gold.png' }),
    iconoNaranja = new iconoComun({ iconUrl: 'img/marker-icon-2x-orange.png' }),
    iconoGris = new iconoComun({ iconUrl: 'img/marker-icon-2x-grey.png' }),
    iconoVioleta = new iconoComun({ iconUrl: 'img/marker-icon-2x-violet.png' }),
    iconoAmarillo = new iconoComun({ iconUrl: 'img/marker-icon-2x-yellow.png' }),
    iconoAntena = new iconoComun({ iconUrl: 'img/ante_r2.png' }),
    iconoBiblio = new iconoComun({ iconUrl: 'img/biblio_r2.png' }),
    iconoEscul = new iconoComun({ iconUrl: 'img/escultura_3.png' }),
    iconoCentrosalud = new iconoComun({ iconUrl: 'img/centrosalud_r2.png' }),
    iconoClinicaprivada = new iconoComun({ iconUrl: 'img/clinicaprivada_r2.png' }),
    iconoDependmuni = new iconoComun({ iconUrl: 'img/dependmuni_r2.png' }),
    iconoEstabeducat = new iconoComun({ iconUrl: 'img/estabeducat_r2.png' }),
    iconoFarmacias = new iconoComun({ iconUrl: 'img/farmacias_r2.png' }),
    iconoHospitales = new iconoComun({ iconUrl: 'img/hospitales2.png' }),
    iconoSeguridad = new iconoComun({ iconUrl: 'img/institucseguridad_r2.png' }),
    iconoJardmatern = new iconoComun({ iconUrl: 'img/jardmatern_r2.png' }),
    iconoPoli = new iconoComun({ iconUrl: 'img/poli_r2.png' }),
    iconoSema_r2 = new iconoComun({ iconUrl: 'img/sema_r2.png' }),
    iconoPilas = new iconoComun({ iconUrl: 'img/pilas_r2.png' }),
    iconoUnivec = new iconoComun({ iconUrl: 'img/univec_r2.png' }),
    iconoSTV = new iconoComun({ iconUrl: 'img/pegman_3.png' }),
    iconoVerde2 = new iconoComun({ iconUrl: 'img/verde2_r2.png' });
     iconositios = new iconoComun({ iconUrl: 'img/sitios.png' });
    iconoedi = new iconoComun({ iconUrl: 'img/edificios.png' });
    iconoPersi = new iconoComun({ iconUrl: 'img/persianas_r2.png' });
    iconoMast = new iconoComun({ iconUrl: 'img/mastil_r2.png' });
    iconoMastp = new iconoComun({ iconUrl: 'img/banderita_r2.png' });
    iconoWifi = new iconoComun({ iconUrl: 'img/wIfI_r2.png' });
    iconoPanel = new iconoComun({ iconUrl: 'img/paneles_3.png' });

    iconoComercio = new iconoComun({ iconUrl: 'img/Comercio.png' });
    iconoCulto = new iconoComun({ iconUrl: 'img/Culto.png' });
    iconoCultura = new iconoComun({ iconUrl: 'img/Cultura.png' });
    iconoAsistencia = new iconoComun({ iconUrl: 'img/Asistencia.png' });
    iconoEsparcimiento = new iconoComun({ iconUrl: 'img/Esparcimiento.png' });
    iconoEnseñanza = new iconoComun({ iconUrl: 'img/Enseñanza.png' });
    iconoOficina = new iconoComun({ iconUrl: 'img/Oficina.png' });
    iconoServicios = new iconoComun({ iconUrl: 'img/Servicios.png' });
    iconoPlanta = new iconoComun({ iconUrl: 'img/planta.png' });




    function crearIconoComercio(feature, latlng) {
        return L.marker(latlng, { icon: iconoComercio })
    }
    var asignarIconoComercio = {
            pointToLayer: crearIconoComercio
    }
    
    function crearIconoCulto(feature, latlng) {
        return L.marker(latlng, { icon: iconoCulto })
    }
    var asignarIconoCulto = {
            pointToLayer: crearIconoCulto
    }
    
    function crearIconoCultura(feature, latlng) {
        return L.marker(latlng, { icon: iconoCultura })
    }
    var asignarIconoCultura = {
            pointToLayer: crearIconoCultura
    }
    
    function crearIconoAsistencia(feature, latlng) {
        return L.marker(latlng, { icon: iconoAsistencia })
    }
    var asignarIconoAsistencia = {
            pointToLayer: crearIconoAsistencia
    }
    
    function crearIconoEsparcimiento(feature, latlng) {
        return L.marker(latlng, { icon: iconoEsparcimiento })
    }
    var asignarIconoEsparcimiento = {
            pointToLayer: crearIconoEsparcimiento
    }
    
    function crearIconoEnseñanza(feature, latlng) {
        return L.marker(latlng, { icon: iconoEnseñanza })
    }
    var asignarIconoEnseñanza = {
            pointToLayer: crearIconoEnseñanza
    }
    
    function crearIconoOficina(feature, latlng) {
        return L.marker(latlng, { icon: iconoOficina })
    }
    var asignarIconoOficina = {
            pointToLayer: crearIconoOficina
    }
    
    function crearIconoServicios(feature, latlng) {
        return L.marker(latlng, { icon: iconoServicios })
    }
    var asignarIconoServicios = {
            pointToLayer: crearIconoServicios
    }

    function crearIconoPlanta(feature, latlng) {
        return L.marker(latlng, { icon: iconoPlanta })
    }
    var asignarIconoPlanta = {
            pointToLayer: crearIconoPlanta
    }
    

function crearIconoComercio(feature, latlng) {
    return L.marker(latlng, { icon: iconoComercio })
}
var asignarIconoComercio = {
        pointToLayer: crearIconoComercio
}

function crearIconoCulto(feature, latlng) {
    return L.marker(latlng, { icon: iconoCulto })
}
var asignarIconoCulto = {
        pointToLayer: crearIconoCulto
}

function crearIconoCultura(feature, latlng) {
    return L.marker(latlng, { icon: iconoCultura })
}
var asignarIconoCultura = {
        pointToLayer: crearIconoCultura
}

function crearIconoAsistencia(feature, latlng) {
    return L.marker(latlng, { icon: iconoAsistencia })
}
var asignarIconoAsistencia = {
        pointToLayer: crearIconoAsistencia
}

function crearIconoEsparcimiento(feature, latlng) {
    return L.marker(latlng, { icon: iconoEsparcimiento })
}
var asignarIconoEsparcimiento = {
        pointToLayer: crearIconoEsparcimiento
}

function crearIconoEnseñanza(feature, latlng) {
    return L.marker(latlng, { icon: iconoEnseñanza })
}
var asignarIconoEnseñanza = {
        pointToLayer: crearIconoEnseñanza
}

function crearIconoOficina(feature, latlng) {
    return L.marker(latlng, { icon: iconoOficina })
}
var asignarIconoOficina = {
        pointToLayer: crearIconoOficina
}

function crearIconoServicios(feature, latlng) {
    return L.marker(latlng, { icon: iconoServicios })
}
var asignarIconoServicios = {
        pointToLayer: crearIconoServicios
}



function crearIconoVerde(feature, latlng) {
    return L.marker(latlng, { icon: iconoVerde })
}
var asignarIconoVerde = {
    pointToLayer: crearIconoVerde
}

function crearIconoRojo(feature, latlng) {
    return L.marker(latlng, { icon: iconoRojo })
}
var asignarIconoRojo = {
    pointToLayer: crearIconoRojo
}

function crearIconoNegro(feature, latlng) {
    return L.marker(latlng, { icon: iconoNegro })
}
var asignarIconoNegro = {
    pointToLayer: crearIconoNegro
}

function crearIconoAzul(feature, latlng) {
    return L.marker(latlng, { icon: iconoAzul })
}
var asignarIconoAzul = {
    pointToLayer: crearIconoAzul
}

function crearIconoDorado(feature, latlng) {
    return L.marker(latlng, { icon: iconoDorado })
}
var asignarIconoDorado = {
    pointToLayer: crearIconoDorado
}

function crearIconoNaranja(feature, latlng) {
    return L.marker(latlng, { icon: iconoNaranja })
}
var asignarIconoNaranja = {
    pointToLayer: crearIconoNaranja
}

function crearIconoGris(feature, latlng) {
    return L.marker(latlng, { icon: iconoGris })
}
var asignarIconoGris = {
    pointToLayer: crearIconoGris
}

function crearIconoVioleta(feature, latlng) {
    return L.marker(latlng, { icon: iconoVioleta })
}
var asignarIconoVioleta = {
    pointToLayer: crearIconoVioleta
}

function crearIconoWifi(feature, latlng) {
    return L.marker(latlng, { icon: iconoWifi })
}
var asignarIconoWifi = {
    pointToLayer: crearIconoWifi
}

function crearIconoAmarillo(feature, latlng) {
    return L.marker(latlng, { icon: iconoAmarillo })
}
var asignarIconoAmarillo = {
    pointToLayer: crearIconoAmarillo
}

function crearIconoAntena(feature, latlng) {
    return L.marker(latlng, { icon: iconoAntena })
}
var asignarIconoAntena = {
    pointToLayer: crearIconoAntena
}

function crearIconoBiblio(feature, latlng) {
    return L.marker(latlng, { icon: iconoBiblio })
}
var asignarIconoBiblio = {
    pointToLayer: crearIconoBiblio
}

function crearIconoCentrosalud(feature, latlng) {
    return L.marker(latlng, { icon: iconoCentrosalud })
}
var asignarIconoCentrosalud = {
    pointToLayer: crearIconoCentrosalud
}

function crearIconoEscul(feature, latlng) {
    return L.marker(latlng, { icon: iconoEscul })
}
var asignarIconoescul = {
    pointToLayer: crearIconoEscul
}

function crearIconoClinicaprivada(feature, latlng) {
    return L.marker(latlng, { icon: iconoClinicaprivada })
}
var asignarIconoClinicaprivada = {
    pointToLayer: crearIconoClinicaprivada
}

function crearIconoDependmuni(feature, latlng) {
    return L.marker(latlng, { icon: iconoDependmuni })
}
var asignarIconoDependmuni = {
    pointToLayer: crearIconoDependmuni
}

function crearIconoEstabeducat(feature, latlng) {
    return L.marker(latlng, { icon: iconoEstabeducat })
}
var asignarIconoEstabeducat = {
    pointToLayer: crearIconoEstabeducat
}

function crearIconoFarmacias(feature, latlng) {
    return L.marker(latlng, { icon: iconoFarmacias })
}
var asignarIconoFarmacias = {
    pointToLayer: crearIconoFarmacias
}

function crearIconoHospitales(feature, latlng) {
    return L.marker(latlng, { icon: iconoHospitales })
}
var asignarIconoHospitales = {
    pointToLayer: crearIconoHospitales
}
function crearIconoPilas(feature, latlng) {
    return L.marker(latlng, { icon: iconoPilas })
}
var asignarIconoPilas = {
    pointToLayer: crearIconoPilas
}
function crearIconoSeguridad(feature, latlng) {
    return L.marker(latlng, { icon: iconoSeguridad })
}
var asignarIconoSeguridad = {
    pointToLayer: crearIconoSeguridad
}

function crearIconoJardmatern(feature, latlng) {
    return L.marker(latlng, { icon: iconoJardmatern })
}
var asignarIconoJardmatern = {
    pointToLayer: crearIconoJardmatern
}

function crearIconoPoli(feature, latlng) {
    return L.marker(latlng, { icon: iconoPoli })
}
var asignarIconoPoli = {
    pointToLayer: crearIconoPoli
}

function crearIconositios(feature, latlng) {
    return L.marker(latlng, { icon: iconositios })
}
var asignarIconositios = {
    pointToLayer: crearIconositios
}

function crearIconoedi(feature, latlng) {
    return L.marker(latlng, { icon: iconoedi })
}
var asignarIconoedi = {
    pointToLayer: crearIconoedi
}

function crearIconoUnivec(feature, latlng) {
    return L.marker(latlng, { icon: iconoUnivec })
}
var asignarIconoUnivec = {
    pointToLayer: crearIconoUnivec
}

function crearIconoSTV(feature, latlng) {
    return L.marker(latlng, { icon: iconoSTV })
}
var asignarIconoUnivec = {
    pointToLayer: crearIconoSTV
}

function crearIconoVerde2(feature, latlng) {
    return L.marker(latlng, { icon: iconoVerde2 })
}
var asignarIconoVerde2 = {
    pointToLayer: crearIconoVerde2
}

function crearIconoSema_r2(feature, latlng) {
    return L.marker(latlng, { icon: iconoSema_r2 })
}
var asignarIconoSema_r2 = {
    pointToLayer: crearIconoSema_r2
}

function crearIconoPersi(feature, latlng) {
    return L.marker(latlng, { icon: iconoPersi })
}
var asignarIconoPersi = {
    pointToLayer: crearIconoPersi
}

function crearIconoMast(feature, latlng) {
    return L.marker(latlng, { icon: iconoMast })
}
var asignarIconoMast = {
    pointToLayer: crearIconoMast
}

function crearIconoMastp(feature, latlng) {
    return L.marker(latlng, { icon: iconoMastp })
}
var asignarIconoMastp = {
    pointToLayer: crearIconoMastp
}

function crearIconoPanel(feature, latlng) {
    return L.marker(latlng, { icon: iconoPanel })
}
var asignarIconoPanel = {
    pointToLayer: crearIconoPanel
}