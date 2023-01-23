/* POPUPS */

function agregarPopupCircuitos(feature, layer) {
    if (feature.properties && feature.properties.Nombre) {
        layer.bindPopup("<strong>" + feature.properties.Nombre + "</strong><br/>" + feature.properties.Distancia + "</strong><br/>");
    }
}
function agregarPopupPaneles(feature, layer) {
    if (feature.properties && feature.properties.descriptio) {
        layer.bindPopup("<strong>" + feature.properties.descriptio + "</strong><br/>" + feature.properties.Name + "</strong><br/>");
    }
}
function agregarPopupfallas(feature, layer) {
    if (feature.properties && feature.properties.Falla) {
        layer.bindPopup("<strong>" + feature.properties.Falla + "</strong><br/>" + "Tipo <strong>" + feature.properties.Tipo + "</strong><br/>" + "Movimiento <strong>" + feature.properties.Movimiento + "</strong><br/>" + "Actividad <strong>" + feature.properties.Actividad);
    }
}
function agregarPopupbarrios(feature, layer) {
    if (feature.properties && feature.properties.Nombre_1) {
        layer.bindPopup("<strong>" + feature.properties.Nombre_1 + "</strong><br/>" + feature.properties.Descrip + "</strong><br/>");
    }
}
function agregarPopuppuntorecepcionpilas(feature, layer) {
    if (feature.properties && feature.properties.Name) {
        layer.bindPopup("<strong>" + feature.properties.Name + "</strong>");
    }
}
function agregarPopuppersianas(feature, layer) {
    if (feature.properties && feature.properties.Nombre) {
        layer.bindPopup("<strong>" + feature.properties.Nombre + "</strong><br><img src='img/persianas/" + feature.properties.Fotos + "' height='160px' width='200px' style='display:block; margin: auto; margin-top:7px;' />");
    }
}
function agregarPopupmasti(feature, layer) {
    if (feature.properties && feature.properties.Name) {
        layer.bindPopup("<strong>" + feature.properties.Nombre_Descripcion + "</strong><br/>" + feature.properties.Ubicaci__n + "</strong><br/>" + feature.properties.Distrito + "</strong><br/>" +feature.properties.Posee_Mastil + "</strong><br><img src='img/turismo/mastil/" + feature.properties.Fotos + "' height='160px' width='200px' style='display:block; margin: auto; margin-top:7px;' />");

    }
}
function agregarPopupesculturas(feature, layer) {
    if (feature.properties && feature.properties.Referencia) {
        layer.bindPopup("<strong>" + feature.properties.Referencia + "</strong><br/>" + feature.properties.Escultura + "</strong><br><img src='img/esculturas/" + feature.properties.Fotos + "' height='160px' width='200px' style='display:block; margin: auto; margin-top:7px;' />");
    }
}
function agregarPopupturismo(feature, layer) {
    if (feature.properties && feature.properties.Nombre) {
        layer.bindPopup("<strong>" + feature.properties.Nombre + "</strong><br/>" + feature.properties.Ubicacion + "</strong><br><img src='img/turismo/" + feature.properties.Fotos + "' height='160px' width='200px' style='display:block; margin: auto; margin-top:7px;' />");
    }
}
function agregarPopuppatrimoniales(feature, layer) {
    if (feature.properties && feature.properties.Nombre) {
        layer.bindPopup("<strong>" + feature.properties.Nombre + "</strong><br/>" + feature.properties.UBICACION + "</strong><br/>" + feature.properties.AÑO + "</strong><br/>" + feature.properties.DISTRITO + "</strong><br><img src='img/Muvi/" + feature.properties.Fotos + "' height='160px' width='200px' style='display:block; margin: auto; margin-top:7px;' />");
    }

}
function agregarPopupespaciosverdes(feature, layer) {
    if (feature.properties && feature.properties.NOMBRE) {
        layer.bindPopup("<strong>" + feature.properties.Descriptio + "</strong><br/>" + feature.properties.NOMBRE);
    }
}
function agregarPopup(feature, layer) {
    if (feature.properties && feature.properties.Nombre_1) {
        layer.bindPopup("<strong>" + feature.properties.Nombre_1 + "</strong>");
    }
}
function agregarPopupfarmacias(feature, layer) {
    if (feature.properties && feature.properties.Nombre) {
        layer.bindPopup("<strong>" + feature.properties.Nombre + "</strong>");
    }
}
function agregarPopupfarmaciasgc(feature, layer) {
    if (feature.properties && feature.properties.Nombre) {
        layer.bindPopup("<strong>" + feature.properties.Nombre + "</strong><br/>" + feature.properties.Direccion + "</strong><br/>" + feature.properties.Telefono + "</strong><br/>" + feature.properties.Distrito);
    }
}
function agregarPopupres(feature, layer) {
    if (feature.properties && feature.properties.UBICACION) {
        layer.bindPopup("<strong>" + feature.properties.UBICACION + "</strong>");
    }
}
function agregarPopupjardinesmuni(feature, layer) {
    if (feature.properties && feature.properties.nombre) {
        layer.bindPopup("<strong>" + feature.properties.nombre + "</strong><br/>" + feature.properties.Direccion);
    }
}
function agregarPopupciclovias(feature, layer) {
    if (feature.properties && feature.properties.Distancia) {
        layer.bindPopup("<strong>" + feature.properties.TIPO_2 + "</strong><br/>" + feature.properties.Distancia);
    }
}
function agregarPopupzoni(feature, layer) {
    if (feature.properties && feature.properties.Layer) {
        layer.bindPopup("<strong>" + feature.properties.Layer + "</strong>");
    }
}
function agregarPopupBarriosConsolidados(feature, layer) {
    if (feature.properties && feature.properties.Nombre_1) {
        layer.bindPopup("<strong>" + feature.properties.Nombre_1 + "</strong>");
    }
}
function agregarPopupredes(feature, layer) {
    if (feature.properties && feature.properties.Estado) {
        layer.bindPopup("<strong>" + feature.properties.Estado + "</strong>");
    }
}
function agregarPopupcloacas(feature, layer) {
    if (feature.properties && feature.properties.Estado) {
        layer.bindPopup("<strong>" + feature.properties.Estado + "</strong>");
    }
}
function agregarPopuplineas(feature, layer) {
    if (feature.properties && feature.properties.TENSION) {
        layer.bindPopup("<strong>" + feature.properties.TENSION + "</strong>");
    }
}
function agregarPopuplineasMu(feature, layer) {
    if (feature.properties && feature.properties.Name) {
        layer.bindPopup("<strong>" + feature.properties.Name + "</strong><br/>" + feature.properties.description + "</strong><br/>");
    }
}

function agregarPopupCanalesColectoresHijuelas(feature, layer) {
    if (feature.properties && feature.properties.Name) {
        layer.bindPopup("<strong>" + feature.properties.Name + "</strong>");
    }
}
function agregarPopupDistritosDepartamentales(feature, layer) {
    if (feature.properties && feature.properties.Nombre_1) {
        layer.bindPopup("<strong>" + feature.properties.Nombre_1 + "</strong><br/>" + feature.properties.Area_km2);
    }
}
function agregarPopupzonaLey4886(feature, layer) {
    if (feature.properties && feature.properties.REFERENCIA) {
        layer.bindPopup("<strong>" + feature.properties.REFERENCIA + "</strong><br/>" + feature.properties.NOMBRE + "</strong><br/>" + "Uso de Suelo Dominante: <strong>" + feature.properties.UsoDominan + "</strong><br/>" + "Uso de Suelo Condicional: <strong>" + feature.properties.UsoCondic + "</strong><br/>"
            + "Densidad Minima: <strong>" + feature.properties.DensidMin + "</strong><br/>" + "Densidad Maxima: <strong>" + feature.properties.DensidMax);
    }
}
function agregarPopupcuencas(feature, layer) {
    if (feature.properties && feature.properties.Nombre_1) {
        layer.bindPopup("<strong>" + feature.properties.Nombre_1 + "</strong><br/>" + feature.properties.Superficie);
    }
}
function agregarPopupPV(feature, layer) {
    if (feature.properties && feature.properties.Nombre) {
        layer.bindPopup("<strong>" + feature.properties.Nombre + "</strong><br/>" + feature.properties.Direccion);
    }
}
function agregarPopupPuntos(feature, layer) {
    if (feature.properties && feature.properties.Locación) {
        layer.bindPopup("<strong>" + feature.properties.Locación + "</strong><br/>" + feature.properties.Dirección);
    }
}
function agregarPopupSalud(feature, layer) {
    if (feature.properties && feature.properties.Nombre_1) {
        layer.bindPopup("<strong>" + feature.properties.Nombre_1 + "</strong><br/>" + feature.properties.Direccion);
    }
}
function agregarPopupHospital(feature, layer) {
    if (feature.properties && feature.properties.Nombre_1) {
        layer.bindPopup("<strong>" + feature.properties.Nombre_1 + "</strong><br/>" + feature.properties.Direccion + "</strong><br/>" + "Jurisdicción: <strong>" + feature.properties.Jurisdiccion);
    }
}
function agregarPopupescuelas(feature, layer) {
    if (feature.properties && feature.properties.Nombre_1) {
        layer.bindPopup("<strong>" + feature.properties.Nombre_1 + "</strong><br/>" + "Nivel: <strong>" + feature.properties.Nivel + "</strong><br/>" + "Gestion: <strong>" + feature.properties.Gestion);
    }
}
function agregarPopupDepen(feature, layer) {
    if (feature.properties && feature.properties.Nombre_1) {
        if (feature.properties.ENLACE) {
            layer.bindPopup("<strong>" + feature.properties.Nombre_1 + "</strong><br /><iframe src='" + feature.properties.ENLACE + "' style='width: 301px; height: 480px; border: 2px solid #888888; margin-top:10px' scrolling='no'></iframe><br /><a href='" + feature.properties.ENLACE + "' target='_blank'>Abrir en otra pestaña</a>");
        } else {
            layer.bindPopup("<strong>" + feature.properties.Nombre_1 + "</strong>");
        }
    }
}

function agregarPopupPiedemonte(feature, layer) {
    if (feature.properties && feature.properties.Nombre) {
        if (feature.properties.Link) {
            layer.bindPopup("<strong>" + feature.properties.Nombre + "</strong><br>" + "Según el Plan Municipal de Ordenamiento Territorial <strong>" + "Acceso al Link: <strong>" + "'<a href=https://drive.google.com/file/d/1e4dmPCJDyeEmXtNe2WLacZlpMDvlPPHX/view?usp=sharing + target='_blank'>PMOT</a>'");
        } else {
            layer.bindPopup("<strong>" + feature.properties.Nombre + "</strong>");
        }
    }
}

function agregarPopupGastronomia(feature, layer) {
    if (feature.properties && feature.properties.Nombre) {
        layer.bindPopup("<strong>" + feature.properties.Nombre + "</strong><br/>" + "Dirección <strong>" + feature.properties.Direccion + "</strong><br/>" + "Horario <strong>" + feature.properties.Horario + "</strong><br/>" + "Contacto <strong>" + feature.properties.Contacto);
    }
}

function agregarPopupGastronomia2(feature, layer) {
    if (feature.properties && feature.properties.Nombre) {
        layer.bindPopup("<strong>" + feature.properties.Nombre + "</strong><br/>" + "Dirección <strong>" + feature.properties.Direccion + "</strong><br/>" + "Contacto <strong>" + feature.properties.Contacto);
    }
}

function agregarPopupCaminabilidad(feature, layer) {
    if (feature.properties && feature.properties.Name) {
        layer.bindPopup("<strong>" + feature.properties.Name + "</strong><br/>" + feature.properties.descriptio + "</strong><br/>");
    }
}

function estiloDistritosDepartamentales() {
    Depa.eachLayer(function (featureInstanceLayer) {
        var id_feature = featureInstanceLayer.feature.properties['qc_id'];
        if (id_feature == 0) {
            color_actual = '#d48871';
        } else if (id_feature == 1) {
            color_actual = '#e3f1df';
        } else if (id_feature == 2) {
            color_actual = '#f1dfed';
        } else if (id_feature == 3) {
            color_actual = '#adddf7';
        } else if (id_feature == 4) {
            color_actual = '#fcfacf';
        } else if (id_feature == 5) {
            color_actual = '#d4bd8b';
        } else if (id_feature == 6) {
            color_actual = '#427710';
        } else if (id_feature == 7) {
            color_actual = '#ffa400';
        } else if (id_feature == 8) {
            color_actual = '#a028ad';
        }

        featureInstanceLayer.setStyle({
            color: color_actual, fillOpacity: 0.65
        });
    });
}

function estilozoni() {
    zonificacion.eachLayer(function (featureInstanceLayer) {
        var id_feature = featureInstanceLayer.feature.properties['qc_id'];
        if (id_feature == 0) {
            color_actual = 'grey';
        } else if (id_feature == 1) {
            color_actual = '#FF0000';
        } else if (id_feature == 2) {
            color_actual = '#ff7f00';
        } else if (id_feature == 3) {
            color_actual = '#fff600';
        } else if (id_feature == 4) {
            color_actual = '#800080';
        } else if (id_feature == 5) {
            color_actual = '#5d3064';
        } else if (id_feature == 6) {
            color_actual = '#1feeb4';
        } else if (id_feature == 7) {
            color_actual = '#199f2d';
        } else if (id_feature == 8) {
            color_actual = '#74d1af';
        } else if (id_feature == 9) {
            color_actual = '#2f6e9e';
        } else if (id_feature == 10) {
            color_actual = '#b31417';
        } else if (id_feature == 11) {
            color_actual = '#E1E1E1';
        }
        featureInstanceLayer.setStyle({
            color: color_actual, fillOpacity: 0.75
        });
    });
}

function estilored() {
    redesagua.eachLayer(function (featureInstanceLayer) {
        var id_feature = featureInstanceLayer.feature.properties['id'];
        if (id_feature == 1) {
            color_actual = '#62b8e5';
        } else if (id_feature == 1) {
            color_actual = '#62b8e5';
        } else if (id_feature == 2) {
            color_actual = '#fbb75b';
        } else if (id_feature == 3) {
            color_actual = '#f05d51';
        }
        featureInstanceLayer.setStyle({
            color: color_actual, fillOpacity: 0.75
        });
    });
}

function estilocloacas() {
    sistcloacal.eachLayer(function (featureInstanceLayer) {
        var id_feature = featureInstanceLayer.feature.properties['id'];
        if (id_feature == 1) {
            color_actual = '#62b8e5';
        } else if (id_feature == 1) {
            color_actual = '#62b8e5';
        } else if (id_feature == 2) {
            color_actual = '#fbb75b';
        } else if (id_feature == 3) {
            color_actual = '#f05d51';
        }
        featureInstanceLayer.setStyle({
            color: color_actual, fillOpacity: 0.75
        });
    });
}

function estilocuencas() {
    cuencas.eachLayer(function (featureInstanceLayer) {
        var id_feature = featureInstanceLayer.feature.properties['qc_id'];
        if (id_feature == 1) {
            color_actual = '#62b8e5';
        } else if (id_feature == 2) {
            color_actual = '#fbb75b';
        } else if (id_feature == 3) {
            color_actual = '#f05d51';
        }
        var optiones_textura = { height: 8, weight: 4, spaceWeight: 4, color: color_actual, spaceColor: color_actual, spaceOpacity: 0.3, angle: -45 };
        var textura_cuencas = new L.StripePattern(optiones_textura); textura_cuencas.addTo(map);

        featureInstanceLayer.setStyle({
            color: color_actual, fillOpacity: 0.75, fillPattern: textura_cuencas
        });
    });
}

function estiloley() {
    zonaley.eachLayer(function (featureInstanceLayer) {
        var id_feature = featureInstanceLayer.feature.properties['id'];
        if (id_feature == 1) {
            color_actual = '#fafafa';
        } else if (id_feature == 2) {
            color_actual = '#9f9f9f';
        } else if (id_feature == 3) {
            color_actual = '#b8b8b8';
        } else if (id_feature == 4) {
            color_actual = '#d7d7d7';
        } else if (id_feature == 5) {
            color_actual = '#848484';
        }
        featureInstanceLayer.setStyle({
            color: color_actual, fillOpacity: 0.75
        });
    });
}

function estiloinundacion() {
    inundacion.eachLayer(function (featureInstanceLayer) {
        var id_feature = featureInstanceLayer.feature.properties['id'];
        if (id_feature == 1) {
            color_actual = '#c2dffb';
        } else if (id_feature == 2) {
            color_actual = '#73b3d8';
        } else if (id_feature == 3) {
            color_actual = '#08306b';
        } else if (id_feature == 4) {
            color_actual = '#08306b';
        }
        featureInstanceLayer.setStyle({
            color: color_actual, fillOpacity: 0.75
        });
    });
}

function estilosuelo() {
    suelo.eachLayer(function (featureInstanceLayer) {
        var id_feature = featureInstanceLayer.feature.properties['id'];
        if (id_feature == 1) {
            color_actual = '#d18581';
        } else if (id_feature == 2) {
            color_actual = '#64c589';
        } else if (id_feature == 3) {
            color_actual = '#dcc57d';
        }
        featureInstanceLayer.setStyle({
            color: color_actual, fillOpacity: 0.75
        });
    });
}

function estilometro() {
    metro.eachLayer(function (featureInstanceLayer) {
        var id_feature = featureInstanceLayer.feature.properties['id'];
        if (id_feature == 1) {
            color_actual = 'red';
        } else if (id_feature == 2) {
            color_actual = '#b4afb3';
        }	
        featureInstanceLayer.setStyle({
            color: color_actual, fillOpacity: 0.75
        });
    });
}

function estilosendero() {
    sendGeo.eachLayer(function (featureInstanceLayer) {
        var id_feature = featureInstanceLayer.feature.properties['id'];
        if (id_feature == 1) {
            color_actual = '#cf7601';
        } 	
        featureInstanceLayer.setStyle({
            color: color_actual, fillOpacity: 0.75
        });
    });
}

function estilocaminabilidad() {
    traza.eachLayer(function (featureInstanceLayer) {
        var id_feature = featureInstanceLayer.feature.properties['PROMEDIO_P'];
        if (id_feature == 1) {
            color_actual = '#e31a1c';
        }else if (id_feature == 2) {
            color_actual = '#ff7f00';
        }else if (id_feature == 3) {
            color_actual = '#fbeb09';
        }else if (id_feature == 4) {
            color_actual = '#16b934';
        }				
        featureInstanceLayer.setStyle({
            color: color_actual, fillOpacity: 1, weight: 5
        });
    });
}



