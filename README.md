# Observatorio Territorial Godoy Cruz

https://observatorio-gc.github.io/Observatorio/.

## Vista 3D de edificaciones

El botón **3D** abre una vista inclinable independiente y acerca el mapa para
ver las edificaciones; se puede cambiar el mapa base y volver al mapa 2D.
La vista se abre en la Plaza Godoy Cruz. Los volúmenes representan `altura_m`
en metros del archivo `scripts/ciudad3D.js`; las construcciones sin altura se
muestran planas. Se descargan únicamente las zonas visibles.

La vista incluye modelos detallados de la basílica, CAU, Correo, Escuela
Rawson, HCD, Ex Bodega Arizu, Cristoforo Colombo, Comisaría 7ª y Cine Teatro
Plaza. Sus ubicaciones y rotaciones proceden de escenas exportadas de QGIS. Al cargar
cada modelo, se ocultan los polígonos del parcelario que se superponen con él,
sin modificar los datos originales. Los puntos de exclusión deben revisarse
si cambian los modelos o la geometría del parcelario.
Al tocar un modelo se abre un panel con información del edificio. Los modelos
y Three.js se descargan únicamente al abrir Ciudad 3D.

Para regenerar los datos después de actualizar el archivo original, ejecutar
`node scripts/generar-ciudad-3d.mjs` desde la carpeta del proyecto y publicar
la carpeta `data/ciudad-3d` junto con el visor.



