// function initMap() {

//     map = new google.maps.Map(document.getElementById('map'), {
//         center: { lat: 26.2389, lng: 73.0243 },
//         zoom: 12,
//         mapTypeId: google.maps.MapTypeId.ROADMAP,
//         streetViewControl: false,
//         zoomControl: true,
//         fullscreenControl: false,
//         mapTypeControlOptions: {
//             mapTypeIds: ['roadmap', 'satellite'],
//             position: google.maps.ControlPosition.RIGHT_TOP,
//             style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
//         },
//         styles: [
//             {
//                 "featureType": "all",
//                 "elementType": "all",
//             }
//         ],
//     });
// }
// initMap();

let map;
let markers = [];
let infowindow;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 26.2389, lng: 73.0243 },
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        zoomControl: true,
        fullscreenControl: false,
        mapTypeControlOptions: {
            mapTypeIds: ['roadmap', 'satellite'],
            position: google.maps.ControlPosition.RIGHT_TOP,
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
        },
        styles: [
            {
                "featureType": "all",
                "elementType": "all",
            }
        ],
    });
    infowindow = new google.maps.InfoWindow();

    const request = {
        location: map.getCenter(),
        radius: '10000',
        type: ['restaurant']
    };

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        clearMarkers();
        for (let i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }
}

function createMarker(place) {
    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });
    markers.push(marker);

    google.maps.event.addListener(marker, 'click', function() {
        const request = {
            placeId: place.place_id,
            fields: ['name', 'formatted_address', 'formatted_phone_number', 'website']
        };

        const service = new google.maps.places.PlacesService(map);
        service.getDetails(request, function (placeDetails, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                const content = `
                    <strong>${placeDetails.name}</strong><br>
                    ${placeDetails.formatted_address}<br>
                    ${placeDetails.formatted_phone_number}<br>
                    <a href="https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat()},${place.geometry.location.lng()}" target="_blank">View in Google Maps</a>
                `;
                infowindow.setContent(content);
                infowindow.open(map, marker);
            }
        });
    });
}

function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

initMap();

//find restrorent using api
let locationInput = document.getElementById('locationInput');
var options = {
    componentRestrictions: { country: 'IN' },
};
var autocomplete = new google.maps.places.Autocomplete(locationInput, options);

autocomplete.addListener('place_changed', function () {
    let place = autocomplete.getPlace();
    $('input[name=lat]').val(place.geometry.location.lat());
    $('input[name=lng]').val(place.geometry.location.lng());

    console.log($('input[name=lat]').val(), $('input[name=lng]').val());
});

function findRestaurants() {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const location = $('input[name=lat]').val() + ',' + $('input[name=lng]').val();
    const radius = document.getElementById('radiusInput').value;

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&key=${apiKey}`;

    $.ajax({
        url: proxyUrl + encodeURIComponent(url),
        method: 'GET',
        success: function (data) {
            console.log(data);
            const restaurants = data.results;
            const restaurantsList = document.getElementById('restaurantsList');
            restaurantsList.innerHTML = '';

            restaurants.forEach(function (restaurant) {
                const name = restaurant.name;
                const listItem = document.createElement('p');
                listItem.textContent = name;
                restaurantsList.appendChild(listItem);
            });
        },
        error: function (error) {
            console.error('Error fetching data:', error);
        }
    });
}