<script context="module">
	export const prerender = true;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>
		<span class="welcome">
			<picture>
				<source srcset="svelte-welcome.webp" type="image/webp" />
				<img src="svelte-welcome.png" alt="Welcome" />
			</picture>
		</span>

		to your new<br />SvelteKit app
	</h1>

	<h2>
		try editing <strong>src/routes/index.svelte</strong>
	</h2>

</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}

	#mapid {
        position: absolute;
        width: 100%;
        height: 100%;
    }

</style>

<div id="mapid"></div>

<script>
import { onMount } from 'svelte'
import { booleanPointInPolygon, point, lineString, bbox, polygon } from "@turf/turf"

let map;


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

onMount(async () => {

	map = L.map('mapid').setView([65.330, 26.818], 176);
/*	
    L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	*/
	L.tileLayer('https://tiles.kartat.kapsi.fi/peruskartta/{z}/{x}/{y}.jpg', {
        attribution: '&copy; MML'
	}).addTo(map);

    L.tileLayer('//tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://waymarkedtrails.org">Waymarked Trails</a>'
    }).addTo(map);
	
	const id2obj = {}
	const trees = []
	let active = null


	const scaleX = 0.016, scaleY = 0.016


/*
	overlay.addEventListener('click', ev => {
		const e = L.point(ev.offsetX, ev.offsetY)
		const latLng = map.layerPointToLatLng(e)

		for (const f of Object.values(id2obj)) {
			const geom = polygon(f.geometry.coordinates, f.properties)
			const P = point([latLng.lng, latLng.lat])
			if (booleanPointInPolygon(P, geom)) {
				active = active==f? null: f
				console.log(f)
				overlay.redraw()
			}
		}
		console.log('click')
		console.log([ev.offsetX, ev.offsetY], latLng, map.getPixelOrigin())
		console.log(map.unproject(e, map.getZoom()), map.getCenter())
		console.log(map.layerPointToLatLng(map.getPixelOrigin()))
	})
*/

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
			ctx.fill()
		},

		renderTrees: function(ctx, bounds, size, trees) {
			console.log('render trees', trees.length)
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
					console.log('missing render tree render for ', tree.specie)
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

						done(undefined, tile)
					})
				})
			//console.log('osm', latLng, latLng2)

			return tile
		}
	})
	const treeCanvas = new TreeCanvas()
	treeCanvas.addTo(map)


	const OsmCanvas = L.GridLayer.extend({
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
								for (let i=0; i<e.geometry.length; i++) {
									const pt = e.geometry[i]
									const x = (pt.lon-bounds.getWest())/dx * size.x
									const y = size.y - (pt.lat-bounds.getSouth())/dy * size.y
				
									i==0 ? ctx.moveTo(x, y): ctx.lineTo(x, y)
								}
								ctx.lineWidth = 5;
								//ctx.closePath()
								ctx.strokeStyle = 'red';
								ctx.stroke()
							}
						}

						done(undefined, tile)
					})
				})
			//console.log('osm', latLng, latLng2)

			return tile
		}
	})
	const osm = new OsmCanvas()
	osm.addTo(map)


    const jkl = [62.24452234218559, 25.748742842059354];
    const circle = L.circle(jkl, {
        radius: 150*1000, fill: false
    })
	circle.addTo(map);
	map.setView(L.latLng(62.20999108080592, 25.68709194660187), 17)
    //map.fitBounds(circle.getBounds());

})



</script>