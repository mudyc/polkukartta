function M(e,r,i){i===void 0&&(i={});var t={type:"Feature"};return(i.id===0||i.id)&&(t.id=i.id),i.bbox&&(t.bbox=i.bbox),t.properties=r||{},t.geometry=e,t}function p(e,r,i){if(i===void 0&&(i={}),!e)throw new Error("coordinates is required");if(!Array.isArray(e))throw new Error("coordinates must be an Array");if(e.length<2)throw new Error("coordinates must be at least 2 numbers long");if(!A(e[0])||!A(e[1]))throw new Error("coordinates must contain numbers");var t={type:"Point",coordinates:e};return M(t,r,i)}function F(e,r,i){i===void 0&&(i={});for(var t=0,n=e;t<n.length;t++){var f=n[t];if(f.length<4)throw new Error("Each LinearRing of a Polygon must have 4 or more Positions.");for(var o=0;o<f[f.length-1].length;o++)if(f[f.length-1][o]!==f[0][o])throw new Error("First and last Position are not equivalent.")}var a={type:"Polygon",coordinates:e};return M(a,r,i)}function A(e){return!isNaN(e)&&e!==null&&!Array.isArray(e)}function S(e,r,i){if(e!==null)for(var t,n,f,o,a,l,s,y=0,u=0,v,w=e.type,g=w==="FeatureCollection",m=w==="Feature",L=g?e.features.length:1,P=0;P<L;P++){s=g?e.features[P].geometry:m?e.geometry:e,v=s?s.type==="GeometryCollection":!1,a=v?s.geometries.length:1;for(var E=0;E<a;E++){var h=0,b=0;if(o=v?s.geometries[E]:s,o!==null){l=o.coordinates;var c=o.type;switch(y=i&&(c==="Polygon"||c==="MultiPolygon")?1:0,c){case null:break;case"Point":if(r(l,u,P,h,b)===!1)return!1;u++,h++;break;case"LineString":case"MultiPoint":for(t=0;t<l.length;t++){if(r(l[t],u,P,h,b)===!1)return!1;u++,c==="MultiPoint"&&h++}c==="LineString"&&h++;break;case"Polygon":case"MultiLineString":for(t=0;t<l.length;t++){for(n=0;n<l[t].length-y;n++){if(r(l[t][n],u,P,h,b)===!1)return!1;u++}c==="MultiLineString"&&h++,c==="Polygon"&&b++}c==="Polygon"&&h++;break;case"MultiPolygon":for(t=0;t<l.length;t++){for(b=0,n=0;n<l[t].length;n++){for(f=0;f<l[t][n].length-y;f++){if(r(l[t][n][f],u,P,h,b)===!1)return!1;u++}b++}h++}break;case"GeometryCollection":for(t=0;t<o.geometries.length;t++)if(S(o.geometries[t],r,i)===!1)return!1;break;default:throw new Error("Unknown Geometry Type")}}}}}function B(e,r){var i,t,n,f,o,a,l,s,y,u,v=0,w=e.type==="FeatureCollection",g=e.type==="Feature",m=w?e.features.length:1;for(i=0;i<m;i++){for(a=w?e.features[i].geometry:g?e.geometry:e,s=w?e.features[i].properties:g?e.properties:{},y=w?e.features[i].bbox:g?e.bbox:void 0,u=w?e.features[i].id:g?e.id:void 0,l=a?a.type==="GeometryCollection":!1,o=l?a.geometries.length:1,n=0;n<o;n++){if(f=l?a.geometries[n]:a,f===null){if(r(null,v,s,y,u)===!1)return!1;continue}switch(f.type){case"Point":case"LineString":case"MultiPoint":case"Polygon":case"MultiLineString":case"MultiPolygon":{if(r(f,v,s,y,u)===!1)return!1;break}case"GeometryCollection":{for(t=0;t<f.geometries.length;t++)if(r(f.geometries[t],v,s,y,u)===!1)return!1;break}default:throw new Error("Unknown Geometry Type")}}v++}}function R(e,r,i){var t=i;return B(e,function(n,f,o,a,l){f===0&&i===void 0?t=n:t=r(t,n,f,o,a,l)}),t}function C(e){var r=[1/0,1/0,-1/0,-1/0];return S(e,function(i){r[0]>i[0]&&(r[0]=i[0]),r[1]>i[1]&&(r[1]=i[1]),r[2]<i[0]&&(r[2]=i[0]),r[3]<i[1]&&(r[3]=i[1])}),r}C.default=C;function q(e){if(!e)throw new Error("coord is required");if(!Array.isArray(e)){if(e.type==="Feature"&&e.geometry!==null&&e.geometry.type==="Point")return e.geometry.coordinates;if(e.type==="Point")return e.coordinates}if(Array.isArray(e)&&e.length>=2&&!Array.isArray(e[0])&&!Array.isArray(e[1]))return e;throw new Error("coord must be GeoJSON Point or an Array of numbers")}function k(e){return e.type==="Feature"?e.geometry:e}function U(e,r,i){if(i===void 0&&(i={}),!e)throw new Error("point is required");if(!r)throw new Error("polygon is required");var t=q(e),n=k(r),f=n.type,o=r.bbox,a=n.coordinates;if(o&&N(t,o)===!1)return!1;f==="Polygon"&&(a=[a]);for(var l=!1,s=0;s<a.length&&!l;s++)if(G(t,a[s][0],i.ignoreBoundary)){for(var y=!1,u=1;u<a[s].length&&!y;)G(t,a[s][u],!i.ignoreBoundary)&&(y=!0),u++;y||(l=!0)}return l}function G(e,r,i){var t=!1;r[0][0]===r[r.length-1][0]&&r[0][1]===r[r.length-1][1]&&(r=r.slice(0,r.length-1));for(var n=0,f=r.length-1;n<r.length;f=n++){var o=r[n][0],a=r[n][1],l=r[f][0],s=r[f][1],y=e[1]*(o-l)+a*(l-e[0])+s*(e[0]-o)===0&&(o-e[0])*(l-e[0])<=0&&(a-e[1])*(s-e[1])<=0;if(y)return!i;var u=a>e[1]!=s>e[1]&&e[0]<(l-o)*(e[1]-a)/(s-a)+o;u&&(t=!t)}return t}function N(e,r){return r[0]<=e[0]&&r[1]<=e[1]&&r[2]>=e[0]&&r[3]>=e[1]}export{p as a,C as b,U as c,R as g,F as p};
