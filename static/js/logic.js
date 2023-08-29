// let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// let map = L.map("map", {
//   center: [0,0],
//   zoom: 2,
// });

// let getColor = depth =>{
//   switch (true) {
//     case depth<10: return 'green';break;
//     case depth<30: return 'lightgreen';break;
//     case depth<50: return 'yellow';break;
//     case depth<70: return 'lightorange';break;
//     case depth<90: return 'orange';break;
//     case depth>90: return 'red';break;
//   };
// }

// // Perform a GET request to the query URL/
// d3.json(queryUrl).then(function ({ features }) {

//   L.geoJSON(features, {
//       style: ({properties:{mag},geometry}) => {return {
//         radius: mag*4, 
//         fillOpacity:.7,
//         color: 'black',
//         fillColor: getColor(geometry.coordinates[2]),
//         weight: 1
//       }},
//       pointToLayer: (geoJsonPoint, latlng) => L.circleMarker(latlng)
//   })
//   .bindPopup(({ feature: { properties: { place, mag } } }) => 
//       `<h5>${place}<br>Magniture: ${mag}</h5>`)
//   .addTo(map);
// })

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

// // legend
// let legend = L.control({position: "bottomright"});

// legend.onAdd = function(map) {
//   let div = L.DomUtil.create("div", "info legend"),
//       depths = [10, 30, 50, 70, 90];
  
//   div.innerHTML = '<h4>Depth</h4>';
  
//   for (let i = 0; i < depths.length; i++) {
//       div.innerHTML +=
//           '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
//           depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
//   }

//   return div;
// };

// legend.addTo(map);

//Store the JSON endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//Perform a GET request to the query URL.
d3.json(queryUrl).then(function(data) 
{
    console.log(data);
    createFeatures(data.features);
});

//Create function for the size of the circle based on magnitude of earthquake.
function circleSize(mag) {
    return mag * 20000;
};

//Create function for the color of the circle based on depth of the earthquake..
function colorDepth(depth)
{   
    if (depth < 10) {
        return "lime";
    }
    else if (depth < 30) {
        return "green";
    }
    else if (depth < 50) {
        return "yellow";
    }
    else if (depth < 70) {
        return "orange";
    }
    else if (depth < 90) {
        return "red";
    }
    else {
        return "maroon";
    }
}

//Create 
function createFeatures(quakeData) {
    //Define a function that displays each feature in the features array.
    // Give each feature a popup that tells the place and time of the earthquake.
    function onEachFeature(feature, layer)
    {
        layer.bindPopup(`<h2>${feature.properties.place}<h2><hr>\
        <h3>Earthquake Magnitude: ${feature.properties.mag}<h3>\
        <h3>Earthquake Depth: ${feature.geometry.coordinates[2]} km<h3><p>${new Date(feature.properties.time)}</p>`);
    }
    
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(quakeData,
        {
            onEachFeature: onEachFeature,
        
        pointToLayer: function(feature, latlng) {
        
            let circleMarkerFeatures =
            {
                radius: circleSize(feature.properties.mag),
                fillColor: colorDepth(feature.geometry.coordinates[2]),
                color: "black",
                fillOpacity: 0.6,
                weight: 0.5,
                stroke: true
                
            }
            return L.circle(latlng, circleMarkerFeatures);
        }
    });
;
    //Send the earthquakes layer to the createmap function.
    createMap(earthquakes);
}

function createMap(earthquakes)
{
    //Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', 
    {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    //Create a baseMaps object.
    let baseMaps =
    {
        Street: street,
        Topo: topo
    };

    //Create an overlay object to hold our overlay.
    let overlayMaps =
    {
        Earthquakes: earthquakes
    };

    //Create our map
    let myMap = L.map("map",
    {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [street, earthquakes]
    });

    //Create a layer control.
    //Passit it the baseMaps and overlayMaps
    //Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


    // let legend = L.control({position: 'bottomright'});
    // legend.onAdd = function () {
    //     let div = L.DomUtil.create('div', 'info legend');
    //     let categories = [-10, 10, 30, 50, 70, 90];
    //     let labels = [];
    //     let legendTitle = "Earthquake Depth";

    //     div.innerHTML += "<h4>" + legendTitle + "</h4>";

    //     for (let i = 0; i < categories.length; i++) {
    //         labels.push('<ul style="background:' + colorDepth(categories[i] + 1) + '"></i>' + categories[i] + (categories[i + 1] ? '&ndash;' + categories[i + 1] + '' : '+') + '</i></ul>');
    //         }

    //         div.innerHTML += "<ul>" + labels.join('') + "</ul>";
    //     return div;
    //     };
    
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend"),
        depth = [-10, 10, 30, 50, 70, 90];
    
        div.innerHTML += "<h3 style='text-align: right'>Quake Depth</h3>"
    
        for (var i = 0; i < depth.length; i++) {
        div.innerHTML +=
        '<i style="background:' + colorDepth(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };
        
        legend.addTo(myMap);


}






