//Store the JSON endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let tectonicsLayerUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

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
    //Create the base layers (outdoors, grayscalle, satellite) from mapbox.
    let outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/{z}/{x}/{y}?access_token={access_token}', 
    {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    zoom: 13,
    access_token: api_key
    })

    let grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token={access_token}', 
    {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    zoom: 13,
    access_token: api_key
    })

    let dark = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token={access_token}', 
    {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    zoom: 13,
    access_token: api_key
    })

    let satellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token={access_token}', 
    {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    zoom: 13,
    access_token: api_key
    });

    //Create a plate tectonics layer.
    tPlates = L.layerGroup();

        d3.json(tectonicsLayerUrl).then(function(data) {

            console.log(data);
            L.geoJSON(data, {
                color: "red",
                weight: 1
            }).addTo(tPlates);
        });

    //Create a baseMaps object.
    let baseMaps =
    {
        Outdoors: outdoors,
        Satellite: satellite,
        Light: grayscale,
        Dark: dark
    };

    //Create an overlay object to hold our overlay.
    let overlayMaps =
    {
        Earthquakes: earthquakes,
        "Tectonic Plates": tPlates
    };

    //Create our map
    let myMap = L.map("map",
    {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [outdoors, earthquakes, tPlates]
    });

    //Create a layer control.
    //Passit it the baseMaps and overlayMaps
    //Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


    //Create legend
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





