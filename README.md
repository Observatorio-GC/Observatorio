# Observatorio Territorial Godoy Cruz

https://observatorio-gc.github.io/Observatorio/.

## Vista 3D de edificaciones

El botón **3D** abre una vista inclinable independiente y acerca el mapa para
ver las edificaciones; se puede cambiar el mapa base y volver al mapa 2D.
La vista se abre en la Plaza Godoy Cruz. Los volúmenes representan `altura_m`
en metros del archivo `scripts/ciudad3D.js`; las construcciones sin altura se
muestran planas. Se descargan únicamente las zonas visibles.

La iglesia junto a la Plaza Godoy Cruz se muestra con el modelo detallado
`data/modelos-3d/iglesia.glb`, ubicado según la escena exportada de QGIS.
Al cargarlo, se oculta el volumen del parcelario que ocupa su ubicación.
El modelo y Three.js se descargan únicamente al abrir Ciudad 3D.
Al tocar la iglesia se muestra su nombre: Basílica San Vicente Ferrer.
También se muestran los modelos del CAU, Correo, Escuela Rawson y HCD,
con sus posiciones y rotaciones de la exportación de QGIS. Al tocarlos se
identifica cada edificio.

Para regenerar los datos después de actualizar el archivo original, ejecutar
`node scripts/generar-ciudad-3d.mjs` desde la carpeta del proyecto y publicar
la carpeta `data/ciudad-3d` junto con el visor.



