<script context="module">
	export const prerender = true;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<canvas id="mapid"></canvas>

<style>
    html, body {
        width: 100%;
        padding: 0;
        height: 100%;
    }
	#mapid {
        position: absolute;
        width: 100%;
        height: 100%;
    }
</style>

<script>
import { onMount } from 'svelte'
import { booleanPointInPolygon, point, lineString, bbox, polygon, bboxPolygon, area } from "@turf/turf"
import { encode, decode, decode_bbox, bboxes } from 'ngeohash'

let map;

/*
const loadRoutes = async () => {
    const mapData = await fetch(`./routes.json`, {
            method: 'GET',
    })
	const routes = await mapData.json()
	for (const route of routes) {
        new L.GPX(route.file, {
            async: true,
            gpx_options: {
                parseElements: ['track', 'route']
            }
        }).on('loaded', function(e) {
			//map.fitBounds(e.target.getBounds());
		}).addTo(map);
	}
    console.log(routes)
}

	function asize(bytes) {
		if (bytes > 1024*1024) return (bytes/1024/104).toFixed(0)+' MB'
		if (bytes > 1024) return (bytes/1024).toFixed(0)+' kB'
		return (bytes)+' B'
	}

	function perf(time) {
		if (time > 1000) return (bytes/1000).toFixed(0)+' s'
		return (time)+' ms'
	}



    const tmp = 'api-key=468d361d-0f46-4cde-b8af-9c125302d6d4'

	const MmlCanvas = L.GridLayer.extend({
		id2way: {},
		createTile: function(coords, done) {
			const tile = L.DomUtil.create('canvas', 'leaflet-tile');
			const size = this.getTileSize();
			tile.width = size.x;
			tile.height = size.y;

			const latLng = map.unproject(coords.scaleBy(size), coords.z) //map.layerPointToLatLng(relC)
			const latLng2 = map.unproject(coords.clone().add([1,1]).scaleBy(size), coords.z)
			const bounds = L.latLngBounds(latLng, latLng2)
			const dx = (bounds.getEast() - bounds.getWest())
			const dy = (bounds.getNorth() - bounds.getSouth())

			const endpoint = 'https://avoin-paikkatieto.maanmittauslaitos.fi/maastotiedot/features/v1/collections/'

			//https://avoin-paikkatieto.maanmittauslaitos.fi/maastotiedot/features/v1/collections/korkeuskayra/items?api-key=468d361d-0f46-4cde-b8af-9c125302d6d4&f=json
			const ctx = tile.getContext('2d');
			ctx.clearRect(0, 0, tile.width, tile.height);

			const collections = 'korkeuskayra,jarvi,rakennus'.split(',')
			for (const coll of collections) {
				fetch(`${endpoint}${coll}/items?${tmp}&bbox=${latLng.lng},${latLng2.lat},${latLng2.lng},${latLng.lat}&&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/4326&crs=http://www.opengis.net/def/crs/EPSG/0/4326&f=json`)
					.then(data => {
						const t0 = Date.now()
						data.json().then(d => {

							for (const f of d.features) {
								if (coll == 'jarvi') {
									//console.log('järvi')
									ctx.beginPath()
									for (let i=0; i<f.geometry.coordinates[0].length; i++) {
										const pt = f.geometry.coordinates[0][i]
										const x = (pt[0]-bounds.getWest())/dx * size.x
										const y = size.y - (pt[1]-bounds.getSouth())/dy * size.y
										i==0 ? ctx.moveTo(x,y): ctx.lineTo(x,y)
									}
									ctx.closePath()
									ctx.fillStyle = 'blue'
									ctx.fill()
								}
								if (coll == 'korkeuskayra') {
									//ctx.beginPath()
									for (let i=0; i<f.geometry.coordinates.length; i++) {
										const pt = f.geometry.coordinates[i]
										const x = (pt[0]-bounds.getWest())/dx * size.x
										const y = size.y - (pt[1]-bounds.getSouth())/dy * size.y
										i==0 ? ctx.moveTo(x,y): ctx.lineTo(x,y)
										//console.log(pt, x,y)
									}
									//ctx.closePath()
									ctx.lineWidth = 0.4
									ctx.strokeStyle = 'white'
									ctx.stroke()

								}
							}

							const t1 = Date.now()
							console.log('rt', coll, asize(JSON.stringify(d).length), perf(t1-t0))
							done(undefined, tile)
						})
					})
			}
			//console.log('osm', latLng, latLng2)

			return tile
		}
	})



//		const scaleX = 0.016, scaleY = 0.016
	const TreeCanvas = L.GridLayer.extend({

		renderSoil: function(ctx, main, sub, soil, act) {
			//console.log(main, sub, soil)
			ctx.fillStyle = 'magenta'
			switch (main) {
			case 1: ctx.fillStyle = 'LimeGreen'; // Metsämaa
				switch (sub) {
				case 1: ctx.fillStyle = 'LimeGreen'; break;  // Kangas
				case 2: ctx.fillStyle = 'MediumSeaGreen'; break;  // Korpi
				case 3: ctx.fillStyle = 'DarkSeaGreen'; break;  // Räme
				case 4: ctx.fillStyle = 'YellowGreen'; break;  // Neva
				case 5: ctx.fillStyle = 'DarkKhaki'; break;  // Letto				
				}
				break;
			case 2: ctx.fillStyle = 'orange'; break; // Kitumaa
			case 3: ctx.fillStyle = 'brown'; break; // Joutomaa
			case 4: break; // Muu metsätalousmaa
			case 5: break; // Tontti
			case 6: ctx.fillStyle = 'yellow'; break; // Maatalousmaa
			case 7: break; // Muu maa
			case 8: ctx.fillStyle = 'blue'; break; // Vesistö
			}
			if (act) ctx.fillStyle = 'yellow'

			switch (sub) {
			case 1: ctx.fillStyle = 'LimeGreen'; break;  // Kangas
			case 2: ctx.fillStyle = '#9ABD53'; break;  // Korpi
			case 3: ctx.fillStyle = 'YellowGreen'; break;  // Räme
			case 4: ctx.fillStyle = 'Gold'; break;  // Neva
			case 5: ctx.fillStyle = 'Aquamarine'; break;  // Letto				
			}

			ctx.fill()
		},

		renderTrees: function(ctx, bounds, size, trees) {
			//console.log('render trees', trees.length)
			const b = bounds
			const dx = (b.getEast() - b.getWest())
			const dy = (b.getNorth() - b.getSouth())
			//console.log(b.getEast() - b.getWest(), dx, dy, params.canvas.width)

			for (const tree of trees) {
				const pt = tree.pt
				const x = (pt[0]-b.getWest())/dx * size.x
				const y = size.y - (pt[1]-b.getSouth())/dy * size.y


				ctx.beginPath()
				ctx.moveTo(x-Math.max(tree.height/7, 1), y)
				ctx.lineTo(x, y-Math.max(tree.height, 3))
				ctx.lineTo(x+Math.max(tree.height/7, 1), y)
				ctx.closePath()

				ctx.fillStyle = 'brown'
				ctx.fill()

				switch (tree.specie) {
				case 1: //Mänty

				ctx.beginPath()
				ctx.arc(x, y-tree.height*0.7, tree.height/2, Math.PI*0.8, Math.PI*0.2)
				ctx.closePath()

				ctx.fillStyle = 'ForestGreen'
				ctx.fill()
				
					break; 
				case 2: //Kuusi 
				ctx.beginPath()
				ctx.moveTo(x-tree.height/3, y-2)
				ctx.lineTo(x, y-tree.height)
				ctx.lineTo(x+tree.height/3, y-2)
				ctx.closePath()

				ctx.fillStyle = 'ForestGreen'
				ctx.fill()
				
					break; 
				case 3: //Rauduskoivu
				case 4: //Hieskoivu
				ctx.fillStyle = 'LightYellow'
				ctx.fill()

				ctx.beginPath()
				ctx.arc(x, y-tree.height*1, tree.height/3, Math.PI*0.85, Math.PI*0.15)
				ctx.arc(x, y-tree.height*0.6, tree.height/2.5, Math.PI*0.85, Math.PI*0.15)
				ctx.closePath()

				ctx.fillStyle = 'GreenYellow'
				ctx.fill()

					break;
				case 5: //Haapa
				ctx.fillStyle = 'DarkGray'
				ctx.fill()

				ctx.beginPath()
				ctx.arc(x, y-tree.height*1, tree.height/3, Math.PI*0.85, Math.PI*0.15)
				ctx.arc(x, y-tree.height*0.6, tree.height/2.5, Math.PI*0.85, Math.PI*0.15)
				ctx.closePath()

				ctx.fillStyle = 'DarkGreen'
				ctx.fill()
					break;
				case 6: //Harmaaleppä
				case 7: //Tervaleppä
				case 8: //Muu havupuu
				case 9: //Muu lehtipuu
				case 10: //Douglaskuusi
				case 11: //Kataja
				case 12: //Kontortamänty
				case 13: //Kynäjalava
				case 14: //Lehtikuusi
				case 15: //Metsälehmus
				case 16: //Mustakuusi
				case 17: //Paju
				case 18: //Pihlaja
				case 19: //Pihta
				case 20: //Raita
				case 21: //Saarni
				case 22: //Sembramänty
				case 23: //Serbiankuusi
				case 24: //Tammi
				case 25: //Tuomi
				case 26: //Vaahtera
				case 27: //Visakoivu
				case 28: //Vuorijalava
				case 29: //Lehtipuu
				case 30: //Havupuu
				default:
					;//console.log('missing render tree render for ', tree.specie)
				}
			}

			// tiheys voidaan laskea pinta-ala/runkoluku

		},

		addTrees: function(f, trees) {
			const p = f.properties
			const geom = polygon(f.geometry.coordinates, f.properties)
			//renderForest(ctx, geom, p.AREA, p.STEMCOUNT, p.MAINTREESPECIES, p.MEANAGE, p.MEANDIAMETER, p.MEANHEIGHT)
		
			const freq = p.STEMCOUNT > 0 ? Math.sqrt(p.AREA / p.STEMCOUNT): 10000
			f.freq = freq
			const bb = bbox(geom)
			let pt = { x: bb[1], y: bb[2]} // west, north
			while (pt.y > bb[0]) {
				const P = point([pt.y, pt.x])
				if (booleanPointInPolygon(P, geom)) {
					trees.push({
						pt: P.geometry.coordinates,
						height: p.MEANHEIGHT,
						specie: p.MAINTREESPECIES
					})
				}
				pt.x += freq * scaleX
				if (pt.x > bb[3]) {
					pt.y -= freq * scaleY
					pt.x -= (bb[3]-[bb[1]])
				}
			}
		},

		createTile: function(coords, done) {
			const trees = []
			const tile = L.DomUtil.create('canvas', 'leaflet-tile');
			const size = this.getTileSize();
			tile.width = size.x;
			tile.height = size.y;

			const latLng = map.unproject(coords.scaleBy(size), coords.z) //map.layerPointToLatLng(relC)
			const latLng2 = map.unproject(coords.clone().add([1,1]).scaleBy(size), coords.z)
			const bounds = L.latLngBounds(latLng, latLng2)
			const dx = (bounds.getEast() - bounds.getWest())
			const dy = (bounds.getNorth() - bounds.getSouth())

			const endpoint = 'https://rajapinnat.metsaan.fi/geoserver/Avoinmetsatieto/stand/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=Avoinmetsatieto:stand&STARTINDEX=0&COUNT=10000&SRSNAME=urn:ogc:def:crs:EPSG::4326'
			fetch(`${endpoint}&BBOX=${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()},urn:ogc:def:crs:EPSG::4326&outputFormat=json`)
				.then(data => {
					data.json().then(d => {
						const t0 = Date.now()
						const ctx = tile.getContext('2d');
						ctx.clearRect(0, 0, tile.width, tile.height);

						for (const f of d.features) {
							this.addTrees(f, trees)

							ctx.beginPath()
							for (let i=0; i<f.geometry.coordinates[0].length; i++) {
								const pt = f.geometry.coordinates[0][i]
								const x = (pt[0]-bounds.getWest())/dx * size.x
								const y = size.y - (pt[1]-bounds.getSouth())/dy * size.y
								i==0 ? ctx.moveTo(x,y): ctx.lineTo(x,y)
							}
							ctx.closePath()

							const p = f.properties
							this.renderSoil(ctx, p.MAINGROUP, p.SUBGROUP, p.SOILTYPE, f==active)


							ctx.lineWidth = 0.3;
							ctx.strokeStyle = 'black';
							ctx.stroke()

						}
						this.renderTrees(ctx, bounds, size, trees)
						//this.drawOnCanvas(ctx, )
						console.log('mk', asize(JSON.stringify(d).length), perf(Date.now()-t0))
						done(undefined, tile)
					})
				})
			//console.log('osm', latLng, latLng2)

			return tile
		}
	})
	const treeCanvas = new TreeCanvas()
	treeCanvas.addTo(map)

	const mml = new MmlCanvas()
	mml.addTo(map)

    class AbstractLayer {
        load(geohashes) {

        }
        loadSingle(geohash) {

        }
        render(ctx, bbox) {

        }
    }

	class OsmCanvas {

        constructor() {}

		id2way: {},
		createTile: function(coords, done) {
			const tile = L.DomUtil.create('canvas', 'leaflet-tile');
			const size = this.getTileSize();
			tile.width = size.x;
			tile.height = size.y;

			const latLng = map.unproject(coords.scaleBy(size), coords.z) //map.layerPointToLatLng(relC)
			const latLng2 = map.unproject(coords.clone().add([1,1]).scaleBy(size), coords.z)
			const bounds = L.latLngBounds(latLng, latLng2)
			const dx = (bounds.getEast() - bounds.getWest())
			const dy = (bounds.getNorth() - bounds.getSouth())

			const endpoint = 'https://overpass.kumi.systems/api/interpreter'
			fetch(`${endpoint}?data=[out:json][bbox:${latLng2.lat},${latLng.lng},${latLng.lat},${latLng2.lng}];way[highway];out geom;`)
				.then(data => {
					data.json().then(d => {
						
						for (const elm of d.elements) {
							const id = elm.id
							if (this.id2way[id] === undefined) {
								this.id2way[id] = elm
							}
						}
						
						const ctx = tile.getContext('2d');
						ctx.clearRect(0, 0, tile.width, tile.height);

						for (const e of Object.values(this.id2way)) {
							//ctx.beginPath()
							const b = L.latLngBounds(
								L.latLng(e.bounds.minlat, e.bounds.minlon),
								L.latLng(e.bounds.maxlat, e.bounds.maxlon))

							if (bounds.overlaps(b)) {
								ctx.beginPath()
								for (let i=0; i<e.geometry.length; i++) {
									const pt = e.geometry[i]
									const x = (pt.lon-bounds.getWest())/dx * size.x
									const y = size.y - (pt.lat-bounds.getSouth())/dy * size.y
									i==0 ? ctx.moveTo(x, y): ctx.lineTo(x, y)
								}
								if (e.tags.highway == 'path') {
									if (e.tags['mtb:scale']) {
										let color = null
										switch(parseInt(e.tags['mtb:scale'])) {
										case 1: color = 'lime'; break;
										case 2: color = 'yellow'; break;
										case 3: color = 'orange'; break;
										case 4: color = 'red'; break;
										case 5: color = 'purple'; break;
										case 6: color = 'purple'; break;
										}
										ctx.setLineDash([])
										ctx.lineWidth = 6;
										ctx.strokeStyle = color
										ctx.stroke()
									}
									ctx.setLineDash([15, 5])
									ctx.lineWidth = 2;
									ctx.strokeStyle = 'black'
									ctx.stroke()
								} else {
									ctx.setLineDash([])
									ctx.lineWidth = 3;
									ctx.strokeStyle = 'black';
									ctx.stroke()
								}
							}
						}

						done(undefined, tile)
					})
				})
			//console.log('osm', latLng, latLng2)

			return tile
		}
    })
    */

class BaseCanvas {
    constructor(name) {
        this.name = name
    }
    preRender() {
        this.clashes = 0
        this.elements = 0
        this.renderPerf = 0
        this.drawn = {}
    }
    renderArray() {

    }
}

class MmlCanvas extends BaseCanvas {
    constructor(map) {
        super('mml')
        this.hash2idarr = {} // hash
        this.id2obj = {}
        this.map = map
        map.registerCanvas(this)
    }
    
    load(hashes, feature) {
        const tmp = 'api-key=468d361d-0f46-4cde-b8af-9c125302d6d4'

        const endpoint = 'https://overpass.kumi.systems/api/interpreter'
        const that = this
        for (const hash_ of hashes) {
            const hash = hash_ + feature
            //if (hash != "ue43bt") continue
            if (this.hash2idarr[hash] !== undefined) continue
            if (this.hash2idarr[hash] === undefined) this.hash2idarr[hash] = []
            const bb = decode_bbox(hash_)
            const bbmix = [bb[1],bb[0],bb[3],bb[2]]

            const endpoint = 'https://avoin-paikkatieto.maanmittauslaitos.fi/maastotiedot/features/v1/collections/'
            fetch(`${endpoint}${feature}/items?${tmp}&bbox=${bbmix.join(',')}&&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/4326&crs=http://www.opengis.net/def/crs/EPSG/0/4326&f=json`)
                .then(data => {
                    const t0 = Date.now()
                    data.json().then(d => {

                        for (const elm of d.features) {
                            const id = elm.id
                            //if (that.hash2idarr[hash] === undefined) that.hash2idarr[hash] = []
                            that.hash2idarr[hash].push(id)
                            that.id2obj[id] = elm
                        }
                        this.map.rerender()
                    })
                })
        }
    }

    * render(ctx, bbox, wh, feature, hashlen, extra) {
        const hashes = bboxes(bbox[0], bbox[1], bbox[2], bbox[3], hashlen)
        this.load(hashes, feature)

        const dx = bbox[3] - bbox[1]
        const dy = bbox[2] - bbox[0]
        const drawn = {}

        for (const hash_ of hashes) {
            const hash = hash_ + feature

            for (const id of this.hash2idarr[hash] || []) {
                const f = this.id2obj[id]
                if (drawn[f.id]) {
                    this.clashes++
                    continue
                }
                else drawn[f.id] = true
                this.elements++
                yield f
                //this.renderOne(ctx, bbox, wh, feature, extra, dx, dy, f)
            }
        }
    }
    renderOne(ctx, bbox, wh, feature, extra, dx, dy, f){

        if (feature == 'jarvi') {
            //console.log('järvi')
            ctx.beginPath()
            for (let i=0; i<f.geometry.coordinates[0].length; i++) {
                const pt = f.geometry.coordinates[0][i]
                const x = (pt[0]-bbox[1])/dx * wh[0]
                const y = wh[1] - (pt[1]-bbox[0])/dy * wh[1]
                i==0 ? ctx.moveTo(x,y): ctx.lineTo(x,y)
            }
            ctx.closePath()
            ctx.fillStyle = 'blue'
            ctx.fill()
        }
        if (feature == 'korkeuskayra') {
            if (extra != 20 ^ f.properties.korkeusarvo % 20000 == 0) {
                //ctx.beginPath()
                for (let i=0; i<f.geometry.coordinates.length; i++) {
                    const pt = f.geometry.coordinates[i]
                    const x = (pt[0]-bbox[1])/dx * wh[0]
                    const y = wh[1] - (pt[1]-bbox[0])/dy * wh[1]
                    i==0 ? ctx.moveTo(x,y): ctx.lineTo(x,y)
                    //console.log(pt, x,y)
                }
                //ctx.closePath()
                ctx.lineWidth = 0.4
                ctx.strokeStyle = 'white'
                ctx.stroke()
            }
        }
        if (feature == 'paikannimi') {
            const pt = f.geometry.coordinates
            const x = (pt[0]-bbox[1])/dx * wh[0]
            const y = wh[1] - (pt[1]-bbox[0])/dy * wh[1]
            ctx.font = '25px arial'
            ctx.fillStyle = 'black'
            ctx.textAlign = 'center'
            ctx.fillText(f.properties.teksti, x, y)
        }
        if (feature == 'jyrkanne') {
            console.log(f)
            for (let i=0; i<f.geometry.coordinates.length; i++) {
                const pt = f.geometry.coordinates[i]
                const x = (pt[0]-bbox[1])/dx * wh[0]
                const y = wh[1] - (pt[1]-bbox[0])/dy * wh[1]
                i==0 ? ctx.moveTo(x,y): ctx.lineTo(x,y)
                //console.log(pt, x,y)
            }
            //ctx.closePath()
            ctx.lineWidth = 5.5
            ctx.strokeStyle = 'black'
            ctx.stroke()
        }
    }
}

class DebugCanvas {
    render(ctx, bbox, wh, feature, hashlen, extra) {
        const hashes = bboxes(bbox[0], bbox[1], bbox[2], bbox[3], hashlen)

        const dx = bbox[3] - bbox[1]
        const dy = bbox[2] - bbox[0]

        for (const hash of hashes) {
            //if (hash != "ue43bt") continue

            const bb = decode_bbox(hash)
            const coordinates = [
                [bb[1], bb[0]],
                [bb[3], bb[0]],
                //[bb[3], bb[2]],
                [bb[1], bb[2]]]

            ctx.fillStyle = 'magenta'
            ctx.fillStyle = "rgba(255, 0, 0, 0.25)"
            ctx.beginPath()
            for (let i=0; i<coordinates.length; i++) {
                const pt = coordinates[i]
                const x = (pt[0]-bbox[1])/dx * wh[0]
                const y = wh[1] - (pt[1]-bbox[0])/dy * wh[1]
                i==0 ? ctx.moveTo(x,y): ctx.lineTo(x,y)
            }
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
        }
    }
}

class SmkCanvas extends BaseCanvas {
    constructor(map) {
        super('smk')
        this.hash2idarr = {} // hash
        this.id2obj = {}
        this.map = map
        map.registerCanvas(this)
    }

    load(hashes) {
        const that = this
        for (const hash of hashes) {
            //if (hash != "ue43bt") continue
            if (this.hash2idarr[hash] !== undefined) continue
            if (this.hash2idarr[hash] === undefined) this.hash2idarr[hash] = []

            const bb = decode_bbox(hash)

            const endpoint = 'https://rajapinnat.metsaan.fi/geoserver/Avoinmetsatieto/stand/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=Avoinmetsatieto:stand&STARTINDEX=0&COUNT=10000&SRSNAME=urn:ogc:def:crs:EPSG::4326'
			fetch(`${endpoint}&BBOX=${bb.join(',')},urn:ogc:def:crs:EPSG::4326&outputFormat=json`)
                .then(data => {
                    data.json().then(d => {
                        //if (d.features.length == 0) that.hash2idarr[hash] = []
                        for (const elm of d.features) {
                            const id = elm.id
                            //if (that.hash2idarr[hash] === undefined) that.hash2idarr[hash] = []
                            that.hash2idarr[hash].push(id)
                            that.id2obj[id] = elm
                            this.addTrees(elm)
                        }
                        this.map.rerender()
                    })
                })
        }
    }

    * render(ctx, bbox, wh, feature, hashlen, extra) {
        const hashes = bboxes(bbox[0], bbox[1], bbox[2], bbox[3], hashlen)
        this.load(hashes)

        const dx = bbox[3] - bbox[1]
        const dy = bbox[2] - bbox[0]
        const drawn = {}

        for (const hash of hashes) {

            for (const id of this.hash2idarr[hash] || []) {
                const f = this.id2obj[id]
                if (drawn[f.id]) {
                    this.clashes++
                    continue
                }
                else drawn[f.id] = true
                this.elements++
                yield f
                //this.renderOne(ctx, bbox, wh, feature, extra, dx, dy, f)
            }
        }
    }
    renderOne(ctx, bbox, wh, feature, extra, dx, dy, f){
        const p = f.properties

        if (feature == 'ground') {

            ctx.beginPath()
            for (let i=0; i<f.geometry.coordinates[0].length; i++) {
                const pt = f.geometry.coordinates[0][i]
                const x = (pt[0]-bbox[1])/dx * wh[0]
                const y = wh[1] - (pt[1]-bbox[0])/dy * wh[1]
                i==0 ? ctx.moveTo(x,y): ctx.lineTo(x,y)
            }
            ctx.closePath()

            this.renderSoil(ctx, p.MAINGROUP, p.SUBGROUP, p.SOILTYPE, false)
        }
        if (feature == 'trees')
            this.renderTrees(ctx, bbox, wh, f.trees)
    }
    renderSoil(ctx, main, sub, soil, act) {
        //console.log(main, sub, soil)
        ctx.fillStyle = 'magenta'
        switch (main) {
        case 1: ctx.fillStyle = 'LimeGreen'; // Metsämaa
            switch (sub) {
            case 1: ctx.fillStyle = 'LimeGreen'; break;  // Kangas
            case 2: ctx.fillStyle = 'MediumSeaGreen'; break;  // Korpi
            case 3: ctx.fillStyle = 'DarkSeaGreen'; break;  // Räme
            case 4: ctx.fillStyle = 'YellowGreen'; break;  // Neva
            case 5: ctx.fillStyle = 'DarkKhaki'; break;  // Letto				
            }
            break;
        case 2: ctx.fillStyle = 'orange'; break; // Kitumaa
        case 3: ctx.fillStyle = 'brown'; break; // Joutomaa
        case 4: break; // Muu metsätalousmaa
        case 5: break; // Tontti
        case 6: ctx.fillStyle = 'yellow'; break; // Maatalousmaa
        case 7: break; // Muu maa
        case 8: ctx.fillStyle = 'blue'; break; // Vesistö
        }
        if (act) ctx.fillStyle = 'yellow'

        switch (sub) {
        case 1: ctx.fillStyle = 'LimeGreen'; break;  // Kangas
        case 2: ctx.fillStyle = '#9ABD53'; break;  // Korpi
        case 3: ctx.fillStyle = 'YellowGreen'; break;  // Räme
        case 4: ctx.fillStyle = 'Gold'; break;  // Neva
        case 5: ctx.fillStyle = 'Aquamarine'; break;  // Letto				
        }

        ctx.fill()
        ctx.strokeStyle = 'grey'
        ctx.lineWidth = 0.3
        ctx.stroke()
    }

    addTrees(f) {
        if (f.trees) return
        const scaleX = 0.016, scaleY = 0.013
        f.trees = []
        const p = f.properties
        const geom = polygon(f.geometry.coordinates, f.properties)
        const bb = bbox(geom)
        //renderForest(ctx, geom, p.AREA, p.STEMCOUNT, p.MAINTREESPECIES, p.MEANAGE, p.MEANDIAMETER, p.MEANHEIGHT)
    
        let freq = p.STEMCOUNT > 0 ? Math.sqrt(p.AREA / p.STEMCOUNT): 10000
        if (p.STEMCOUNT)
            freq *= (area(bboxPolygon(bb)) / 10000.)  / p.AREA
        f.freq = freq
        let pt = { x: bb[1], y: bb[2]} // west, north
        while (pt.y > bb[0]) {
            const P = point([pt.y, pt.x])
            if (booleanPointInPolygon(P, geom)) {
                f.trees.push({
                    pt: P.geometry.coordinates,
                    height: p.MEANHEIGHT,
                    specie: p.MAINTREESPECIES
                })
            }
            pt.x += freq * scaleX
            if (pt.x > bb[3]) {
                pt.y -= freq * scaleY
                pt.x -= (bb[3]-[bb[1]])
            }
        }
    }

    renderTrees(ctx, bbox, wh, trees) {
        const dx = bbox[3] - bbox[1]
        const dy = bbox[2] - bbox[0]
        for (const tree of trees) {
            const pt = tree.pt
            const x = (pt[0]-bbox[1])/dx * wh[0]
            const y = wh[1] - (pt[1]-bbox[0])/dy * wh[1]

            ctx.beginPath()
            ctx.moveTo(x-Math.max(tree.height/7, 1), y)
            ctx.lineTo(x, y-Math.max(tree.height, 3))
            ctx.lineTo(x+Math.max(tree.height/7, 1), y)
            ctx.closePath()

            ctx.fillStyle = 'brown'
            ctx.fill()

            switch (tree.specie) {
            case 1: //Mänty

            ctx.beginPath()
            ctx.arc(x, y-tree.height*0.7, tree.height/2, Math.PI*0.8, Math.PI*0.2)
            ctx.closePath()

            ctx.fillStyle = 'ForestGreen'
            ctx.fill()
            
                break; 
            case 2: //Kuusi 
            ctx.beginPath()
            ctx.moveTo(x-tree.height/3, y-2)
            ctx.lineTo(x, y-tree.height)
            ctx.lineTo(x+tree.height/3, y-2)
            ctx.closePath()

            ctx.fillStyle = 'ForestGreen'
            ctx.fill()
            
                break; 
            case 3: //Rauduskoivu
            case 4: //Hieskoivu
            ctx.fillStyle = 'LightYellow'
            ctx.fill()

            ctx.beginPath()
            ctx.arc(x, y-tree.height*1, tree.height/3, Math.PI*0.85, Math.PI*0.15)
            ctx.arc(x, y-tree.height*0.6, tree.height/2.5, Math.PI*0.85, Math.PI*0.15)
            ctx.closePath()

            ctx.fillStyle = 'GreenYellow'
            ctx.fill()

                break;
            case 5: //Haapa
            case 29: //Lehtipuu
            ctx.fillStyle = 'DarkGray'
            ctx.fill()

            ctx.beginPath()
            ctx.arc(x, y-tree.height*1, tree.height/3, Math.PI*0.85, Math.PI*0.15)
            ctx.arc(x, y-tree.height*0.6, tree.height/2.5, Math.PI*0.85, Math.PI*0.15)
            ctx.closePath()

            ctx.fillStyle = 'DarkGreen'
            ctx.fill()
                break;
            case 6: //Harmaaleppä
            case 7: //Tervaleppä
            case 8: //Muu havupuu
            case 9: //Muu lehtipuu
            case 10: //Douglaskuusi
            case 11: //Kataja
            case 12: //Kontortamänty
            case 13: //Kynäjalava
            case 14: //Lehtikuusi
            case 15: //Metsälehmus
            case 16: //Mustakuusi
            case 17: //Paju
            case 18: //Pihlaja
            case 19: //Pihta
            case 20: //Raita
            case 21: //Saarni
            case 22: //Sembramänty
            case 23: //Serbiankuusi
            case 24: //Tammi
            case 25: //Tuomi
            case 26: //Vaahtera
            case 27: //Visakoivu
            case 28: //Vuorijalava
            
            case 30: //Havupuu
            default:
                ; //console.log('missing render tree render for ', tree.specie)
            }
        }
    }
}


class OsmCanvas extends BaseCanvas {
    constructor(map) {
        super('osm')
        this.hash2idarr = {} // hash
        this.id2obj = {}
        this.map = map
        map.registerCanvas(this)
    }

    load(hashes, feature) {
        const endpoint = 'https://overpass.kumi.systems/api/interpreter'
        const that = this
        for (const hash of hashes) {
            //if (hash != "ue43bt") continue
            if (this.hash2idarr[hash] !== undefined) continue
            if (this.hash2idarr[hash] === undefined) this.hash2idarr[hash] = []

            const bb = decode_bbox(hash)
            const detail = feature == 'motorway' ? '[highway="motorway"]' : 
                '[highway][highway!="motorway"]'
            fetch(`${endpoint}?data=[out:json][bbox:${bb.join(',')}];way${detail};out geom;`)
                .then(data => {
                    data.json().then(d => {
                        if (d.elements.length == 0) that.hash2idarr[hash] = []
                        for (const elm of d.elements) {
                            const id = elm.id
                            //if (that.hash2idarr[hash] === undefined) that.hash2idarr[hash] = []
                            that.hash2idarr[hash].push(id)
                            that.id2obj[id] = elm
                        }
                        //console.log('done', hash, `${endpoint}?data=[out:json][bbox:${bb.join(',')}];way[highway];out geom;`)
                        this.map.rerender()
                    })
                }).catch(err => {
                    this.hash2idarr[hash] = undefined
                    this.map.rerender()
                })
        }
    }

    * render(ctx, bbox, wh, feature, hashlen, extra) {
        const hashes = bboxes(bbox[0], bbox[1], bbox[2], bbox[3], hashlen)
        this.load(hashes, feature)

        const dx = bbox[3] - bbox[1]
        const dy = bbox[2] - bbox[0]
        const drawn = {}


        for (const hash of hashes) {

            for (const id of this.hash2idarr[hash] || []) {
                const e = this.id2obj[id]
                if (drawn[e.id]) {
                    this.clashes++
                    continue
                } else drawn[e.id] = true
                this.elements++
                yield e;
                //this.renderOne(ctx, bbox, wh, feature, extra, dx, dy, e)
            }
        }
    }

    renderOne(ctx, bbox, wh, feature, extra, dx, dy, e){
        //console.log('omsone',e)
        ctx.beginPath()
        for (let i=0; i<e.geometry.length; i++) {
            const pt = e.geometry[i]
            const x = (pt.lon-bbox[1])/dx * wh[0]
            const y = wh[1] - (pt.lat-bbox[0])/dy * wh[1]
            i==0 ? ctx.moveTo(x, y): ctx.lineTo(x, y)
        }
        if (e.tags.highway == 'path') {
            if (e.tags['mtb:scale']) {
                let color = null
                switch(parseInt(e.tags['mtb:scale'])) {
                case 1: color = 'lime'; break;
                case 2: color = 'yellow'; break;
                case 3: color = 'orange'; break;
                case 4: color = 'red'; break;
                case 5: color = 'purple'; break;
                case 6: color = 'purple'; break;
                }
                ctx.setLineDash([])
                ctx.lineWidth = 6;
                ctx.strokeStyle = color
                ctx.stroke()
            }
            ctx.setLineDash([15, 5])
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black'
            ctx.stroke()
        } else {
            ctx.setLineDash([])
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'black';
            ctx.stroke()
        }
        ctx.setLineDash([])
    }
}


class MyMap {
    constructor(canvas) {
        const earthRadius = 6371000.
        const meterAngle = Math.atan(1/earthRadius)
        this.meterAngle = meterAngle // anglePerMeter?
        const ppi = 96 // pixel per inch
        const ppcm = ppi / 2.54 //pixel per cm
        this.ppcm = ppcm


        const view = {
            // lat, lon
            pos: [62.211451, 25.691848],
            zoom: 1/5000.0,
            rot: 0,
        }
        this.view = view
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        canvas.style.backgroundColor = "grey";
        this.canvases = []

        this.bindEvents(canvas)

        this.rStarted = false
        this.rEnded = false
        this.cleanRenderNeeded = true // if movement while render on place?
        this.rLayoutIdx = -1
    }
    setLayout(layouts) {
        this.layouts = layouts
    }
    registerCanvas(canvas) {
        this.canvases.push(canvas)
    }

    render() {
        //console.log('render', this.cleanRenderNeeded, this.rLayoutIdx, this.rgen)
        const T0 = window.performance.now()
        for (const c of this.canvases) c.preRender()

        if (this.cleanRenderNeeded) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.cleanRenderNeeded = false
            this.rLayoutIdx = -1
            this.rStarted = true
            this.rEnded = false
            this.rgen = undefined
        } else {
            //console.log('continue render', this.rLayoutIdx)
        }

                     // p / p/m  * a/m
        const dLon = (this.canvas.width / this.ppcm / 2.) / this.view.zoom * this.meterAngle
        const dLat = (this.canvas.height / this.ppcm) / 4. / this.view.zoom * this.meterAngle
        // [minlat, minlon, maxlat, maxlon]
        const bbox = [ -dLat + this.view.pos[0], -dLon + this.view.pos[1], dLat + this.view.pos[0], dLon + this.view.pos[1]]
        const wh = [this.canvas.width, this.canvas.height]
        const dx = bbox[3] - bbox[1]
        const dy = bbox[2] - bbox[0]


        if (this.rLayoutIdx < 0) this.rLayoutIdx = this.layouts.length - 1
        while (this.rLayoutIdx >= 0) {
            const layout = this.layouts[this.rLayoutIdx]
            if (layout.max < this.view.zoom && this.view.zoom < layout.min) {
                const t0 = window.performance.now()
                this.ctx.save()
                this.ctx.beginPath()
                //let fidx = layout.obj.renerArray()
                if (this.rgen == undefined)
                    this.rgen = layout.obj.render(
                        this.ctx, bbox, 
                        wh, 
                        layout.feature, 
                        layout.hashlen || 6, layout.extra)
                let next;
                while (!(next = this.rgen.next()).done) {
                    const f = next.value;
                    layout.obj.renderOne(this.ctx, bbox, wh, layout.feature, layout.extra, dx, dy, f)

                    // keep performance
                    if ((window.performance.now() - T0) > 2) {
                        //window.requestAnimationFrame(this.render.bind(this))
                        break;
                    }
                }
                this.ctx.restore()
                if (next.done) {
                    this.rgen = undefined
                    this.rLayoutIdx--
                } 
                else {
                    window.requestAnimationFrame(this.render.bind(this))
                    break
                }
                //const t1 = window.performance.now()
                //layout.perfRender = t1 - t0

                // cut of any layer which do not perform!
                //if (t1-T0 > 5) this.rLayoutIdx = 0
            }
        }
        if (this.rLayoutIdx == -1) {
            this.rEnded = true
        }
        //for (const c of this.canvases) {
        //    console.log(c.name, 'clashes', c.clashes, 'elemts', c.elements)
        //}
        //for (const l of this.layouts) console.log(l.name, l.perfRender +'uS')

        //console.log('render', this.view.zoom, window.performance.now() - T0)
    }
    rerender() {
        this.cleanRenderNeeded = true
        window.requestAnimationFrame(this.render.bind(this))
    }
    bindEvents(canvas) {
        canvas.addEventListener('wheel', ev => {
            ev.preventDefault();
            const pos0 = this.getPos(ev.offsetX, ev.offsetY)
            if (ev.deltaY < 0)
                this.view.zoom *= 1 + (-ev.deltaY * 0.01)
            if (ev.deltaY > 0)
                this.view.zoom /= 1 + (ev.deltaY * 0.01)
            const pos1 = this.getPos(ev.offsetX, ev.offsetY)
            this.view.pos[0] += pos1[0] - pos0[0]
            this.view.pos[1] += pos1[1] - pos0[1]
            this.rerender();
        });
        canvas.addEventListener('mousedown', ev => {
            this.startEvent = { x: ev.offsetX, y: ev.offsetY, p: Array.from(this.view.pos) }
        })

        canvas.addEventListener('mousemove', ev => {
            if (this.startEvent) {
                const dx = this.startEvent.x - ev.offsetX
                const dy = this.startEvent.y - ev.offsetY
                const dLon = (dx / this.ppcm) / this.view.zoom * this.meterAngle 
                const dLat = (dy / this.ppcm) / this.view.zoom * this.meterAngle /2.
                this.view.pos = Array.from(this.startEvent.p)
                this.view.pos[0] -= dLat
                this.view.pos[1] += dLon
                this.rerender()
            }
        })

        canvas.addEventListener('mouseup', ev => {
            this.startEvent = undefined
        })

        canvas.addEventListener("touchstart", ev => {
            console.log(ev)
        })
        canvas.addEventListener("touchmove", ev => {
            console.log(ev)
        })
        canvas.addEventListener("touchend", ev => {
            console.log(ev)
        })
    }
    getPos(x,y) {
        const dx = x - (this.canvas.width/2)
        const dy = y - (this.canvas.height/2)
        const dLon = (dx / this.ppcm) / this.view.zoom * this.meterAngle
        const dLat = (dy / this.ppcm) / this.view.zoom * this.meterAngle / 2.
        return [this.view.pos[0] + dLat, this.view.pos[1] - dLon]
    }
    x(bbox, lon) {
        const dx = bbox[3] - bbox[1]
        const x = (lon-bbox[1])/dx * this.canvas.width
        return x
    }
    y(bbox, lat) {
        const dy = bbox[2] - bbox[0]
        const y = this.canvas.height - (lat-bbox[0])/dy * this.canvas.height
        return y
    }
}

onMount(async () => {
    console.log(window.devicePixelRatio)

    const canvas = document.getElementById('mapid')
    canvas.height = canvas.offsetHeight
    canvas.width = canvas.offsetWidth
    const ctx = canvas.getContext('2d')

    map = new MyMap(canvas)

	const osm = new OsmCanvas(map)
    const smk = new SmkCanvas(map)
    const dbg = new DebugCanvas()
    const mml = new MmlCanvas(map)


    map.setLayout([
        //{ name: 'dbg',         hashlen: 4, max: 0, min: 1, obj: dbg},
        { name: 'puut',     max: 1/100000., min: 1, obj: smk, feature: 'trees'},
        { name: 'polut',          max: 1/60000., min: 1, obj: osm, },
        { name: 'jyrkänteet',     max: 1/25000., min: 1, obj: mml, feature: 'jyrkanne' },
        { name: 'korkeuskäyrät',  max: 1/4000., min: 1, obj: mml, feature: 'korkeuskayra' },
        { name: 'korkeuskäyrät20',max: 1/10000., min: 1, obj: mml, feature: 'korkeuskayra', extra: 20 },
        { name: 'nimet',          hashlen: 4, max: 0,         min: 1, obj: mml, feature: 'paikannimi'},
        { name: 'metsäpohja',     hashlen: 6, max: 1/50000., min: 1, obj: smk, feature: 'ground'},
        { name: 'järvet',         hashlen: 6, max: 1/500000., min: 1, obj: mml, feature: 'jarvi'},
        //{ name: 'isot tiet',      hashlen: 4, max: 0,         min: 1, obj: osm, feature: 'motorway'},
        //{ name: 'vesistö', max: 1/5000., min: 1, obj: MmlCanvas },
    ])
    map.render()
    setTimeout(() => {
        console.log('a')
        //map.render()
    }, 3*1000);

})


</script>