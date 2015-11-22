
function addUserToMap(map, markerCluster, user){
    
    var m = new UserThumbOverlay(user, map);
    google.maps.event.addListener(m, 'overlayclick', function(c){
        
        var overlay = c[0];
        
        // "objetos" sin agrupar
        if (overlay.getCluster() == null) {
            var url = 'detalle.php?id=' + overlay.getUser().id;
            window.open(url, '_blank');
        }
        
        // Objects group by ids
        else {
            var users = [];
            var markers = overlay.getCluster().getMarkers();
            for (var i in markers) {
                var marker = markers[i];
                users.push(marker.getUser().id);
            }
            //url to get the profiles
            var _url = 'usermaps.php?ids=' + users.join('-');
            $.ajax({
                type: "GET",
                url: _url,
                cache: false
            })
            .success(function( data ) {
                // when we have success, we show the result into a modal
                $('#usersmaPpopup').modal('show');
                $('#usersmaPpopup').find('.modal-body').html(data);
            });
        }
        
    });

    m.show();
    markerCluster.addMarker(m, false);
}

function map_fit(map, center){
	
    google.maps.event.trigger(map, 'resize');
    map.setCenter(center);
    
}

function buildDefaultMap(canvas){
    var map_settings = {
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        mapTypeControl: false,
        streetViewControl: false
    };
    return new google.maps.Map(canvas, map_settings);
}

//==============================================================================
// init_map
//==============================================================================
function init_map(){
    // location icon
    var locationIcon = 'img/location.png';
    // initial coords to center the map
    var str_coords = '38.7767926,-77.2117386';
    // id of the container, to build the map
    var map = buildDefaultMap(document.getElementById("map-container"));
	
    map_fit(map);
    
    if (str_coords != null && str_coords.indexOf(",") != -1) {
        
        var coords = str_coords.split(',');
        var coords = {
            latitude: coords[0],
            longitude: coords[1]
        };
        
        var latLng = new google.maps.LatLng(coords.latitude, coords.longitude);

        map.setCenter(latLng);
        loadUsersByAjax();
        
        // we add the mark 
        new google.maps.Marker({
            position: latLng,
            map: map,
            icon: locationIcon
        });
    } 
    
   
    function loadUsersByAjax() {
        // inicializar markercluster
        var markerCluster = new MarkerClusterer(map, [], {
            zoomOnClick: false,
            maxZoom: 20
        });
        markerCluster.zoomOnClick_ = false;
        markerCluster.gridSize_ = 70;
        $.ajax({
            type: "POST",
            url: 'search.php',
            data: { },
            cache: false
        })
        .success(function( data ) {
            
            for (var i in data) {
                var user = data[i];
                addUserToMap(map, markerCluster, user);
            }
        });
    }
}
