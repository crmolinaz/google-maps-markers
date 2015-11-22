/**
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * A Marker Clusterer that clusters markers.
 *
 * @param {google.maps.Map} map The Google map to attach to.
 * @param {Array.<google.maps.Marker>} opt_markers Optional markers to add to
 *   the cluster.
 * @param {Object} opt_options support the following options:
 *     'gridSize': (number) The grid size of a cluster in pixels.
 *     'maxZoom': (number) The maximum zoom level that a marker can be part of a
 *                cluster.
 *     'zoomOnClick': (boolean) Whether the default behaviour of clicking on a
 *                    cluster is to zoom into it.
 *     'styles': (object) An object that has style properties:
 *       'url': (string) The image url.
 *       'height': (number) The image height.
 *       'width': (number) The image width.
 *       'anchor': (Array) The anchor position of the label text.
 *       'textColor': (string) The text color.
 *       'textSize': (number) The text size.
 * @constructor
 * @extends google.maps.OverlayView
 */
function MarkerClusterer(map, opt_markers, opt_options) {
  // MarkerClusterer implements google.maps.OverlayView interface. We use the
  // extend function to extend MarkerClusterer with google.maps.OverlayView
  // because it might not always be available when the code is defined so we
  // look for it at the last possible moment. If it doesn't exist now then
  // there is no point going ahead :)
  this.extend(MarkerClusterer, google.maps.OverlayView);
  this.map_ = map;
  this.markers_ = [];
  this.clusters_ = [];
  this.sizes = [53, 56, 66, 78, 90];
  this.styles_ = [];
  this.ready_ = false;

  var options = opt_options || {};

  this.gridSize_ = options['gridSize'] || 60;
  this.maxZoom_ = options['maxZoom'] || null;
  this.styles_ = options['styles'] || [];
  this.imagePath_ = options['imagePath'] ||
      this.MARKER_CLUSTER_IMAGE_PATH_;
  this.imageExtension_ = options['imageExtension'] ||
      this.MARKER_CLUSTER_IMAGE_EXTENSION_;
  this.zoomOnClick_ = options['zoomOnClick'] || true;

  this.setupStyles_();

  this.setMap(map);

  this.prevZoom_ = this.map_.getZoom();
    
  // Add the map event listeners
  var that = this;
  google.maps.event.addListener(this.map_, 'zoom_changed', function() {
  	//var maxZoom = that.map_.mapTypes[that.map_.getMapTypeId()].maxZoom;
	var maxZoom = that.getMaxZoom();
  	var zoom = that.map_.getZoom();
  	if (zoom < 0 || zoom > maxZoom) {
  	  return;
  	}
  	
    if (that.prevZoom_ != zoom) {
      that.prevZoom_ = that.map_.getZoom();
      that.resetViewport();
    }
  });

  google.maps.event.addListener(this.map_, 'bounds_changed', function() {
    that.redraw();
  });

  // Finally, add the markers
  if (opt_markers && opt_markers.length) {
    this.addMarkers(opt_markers, false);
  }
}


/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_ =
    'http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/' +
    'images/m';


/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_ = 'png';


/**
 * Extends a objects prototype by anothers.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
MarkerClusterer.prototype.extend = function(obj1, obj2) {
  return (function(object) {
    for (property in object.prototype) {
      this.prototype[property] = object.prototype[property];
    }
    return this;
  }).apply(obj1, [obj2]);
};


/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.onAdd = function() {
  this.setReady_(true);
};


/**
 * Implementation of the interface.
 * @ignore
 */
MarkerClusterer.prototype.idle = function() {};


/**
 * Implementation of the interface.
 * @ignore
 */
MarkerClusterer.prototype.draw = function() {};


/**
 * Sets up the styles object.
 *
 * @private
 */
MarkerClusterer.prototype.setupStyles_ = function() {
  for (var i = 0, size; size = this.sizes[i]; i++) {
    this.styles_.push({
      url: this.imagePath_ + (i + 1) + '.' + this.imageExtension_,
      height: size,
      width: size
    });
  }
};


/**
 *  Sets the styles.
 *
 *  @param {Object} styles The style to set.
 */
MarkerClusterer.prototype.setStyles = function(styles) {
  this.styles_ = styles;
};


/**
 *  Gets the styles.
 *
 *  @return {Object} The styles object.
 */
MarkerClusterer.prototype.getStyles = function() {
  return this.styles_;
};


/**
 * Whether zoom on click is set.
 *
 * @return {boolean} True if zoomOnClick_ is set.
 */
MarkerClusterer.prototype.isZoomOnClick = function() {
  return this.zoomOnClick_;
};


/**
 *  Returns the array of markers in the clusterer.
 *
 *  @return {Array.<google.maps.Marker>} The markers.
 */
MarkerClusterer.prototype.getMarkers = function() {
  return this.markers_;
};


/**
 *  Returns the array of markers in the clusterer.
 *
 *  @return {Array.<google.maps.Marker>} The number of markers.
 */
MarkerClusterer.prototype.getTotalMarkers = function() {
  return this.markers_;
};


/**
 *  Sets the max zoom for the clusterer.
 *
 *  @param {number} maxZoom The max zoom level.
 */
MarkerClusterer.prototype.setMaxZoom = function(maxZoom) {
  this.maxZoom_ = maxZoom;
};


/**
 *  Gets the max zoom for the clusterer.
 *
 *  @return {number} The max zoom level.
 */
MarkerClusterer.prototype.getMaxZoom = function() {
  return this.maxZoom_ || this.map_.mapTypes[this.map_.getMapTypeId()].maxZoom;
};


/**
 *  The function for calculating the cluster icon image.
 *
 *  @param {Array.<google.maps.Marker>} markers The markers in the clusterer.
 *  @param {number} numStyles The number of styles available.
 *  @return {Object} A object properties: 'text' (string) and 'index' (number).
 *  @private
 */
MarkerClusterer.prototype.calculator_ = function(markers, numStyles) {
  var index = 0;
  var count = markers.length;
  var dv = count;
  while (dv !== 0) {
    dv = parseInt(dv / 10, 10);
    index++;
  }

  index = Math.min(index, numStyles);
  return {
    text: count,
    index: index
  };
};


/**
 * Set the calculator function.
 *
 * @param {function(Array, number)} calculator The function to set as the
 *     calculator. The function should return a object properties:
 *     'text' (string) and 'index' (number).
 *
 */
MarkerClusterer.prototype.setCalculator = function(calculator) {
  this.calculator_ = calculator;
};


/**
 * Get the calculator function.
 *
 * @return {function(Array, number)} the calculator function.
 */
MarkerClusterer.prototype.getCalculator = function() {
  return this.calculator_;
};


/**
 * Add an array of markers to the clusterer.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to add.
 * @param {boolean} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarkers = function(markers, opt_nodraw) {
  for (var i = 0, marker; marker = markers[i]; i++) {
    this.pushMarkerTo_(marker);
  }
  if (!opt_nodraw) {
    this.redraw();
  }
};


/**
 * Pushes a marker to the clusterer.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.pushMarkerTo_ = function(marker) {
  marker.setVisible(false);
  marker.setMap(null);
  marker.isAdded = false;
  if (marker['draggable']) {
    // If the marker is draggable add a listener so we update the clusters on
    // the drag end.
    var that = this;
    google.maps.event.addListener(marker, 'dragend', function() {
      marker.isAdded = false;
      that.resetViewport();
      that.redraw();
    });
  }
  this.markers_.push(marker);
};


/**
 * Adds a marker to the clusterer and redraws if needed.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @param {boolean} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarker = function(marker, opt_nodraw) {
  this.pushMarkerTo_(marker);
  if (!opt_nodraw) {
    this.redraw();
  }
};


/**
 * Remove a marker from the cluster.
 *
 * @param {google.maps.Marker} marker The marker to remove.
 * @return {boolean} True if the marker was removed.
 */
MarkerClusterer.prototype.removeMarker = function(marker) {
  var index = -1;
  if (this.markers_.indexOf) {
    index = this.markers_.indexOf(marker);
  } else {
    for (var i = 0, m; m = this.markers_[i]; i++) {
      if (m == marker) {
        index = i;
        continue;
      }
    }
  }

  if (index == -1) {
    // Marker is not in our list of markers.
    return false;
  }

  this.markers_.splice(index, 1);
  marker.setVisible(false);
  marker.setMap(null);

  this.resetViewport();
  this.redraw();
  return true;
};


/**
 * Sets the clusterer's ready state.
 *
 * @param {boolean} ready The state.
 * @private
 */
MarkerClusterer.prototype.setReady_ = function(ready) {
  if (!this.ready_) {
    this.ready_ = ready;
    this.createClusters_();
  }
};


/**
 * Returns the number of clusters in the clusterer.
 *
 * @return {number} The number of clusters.
 */
MarkerClusterer.prototype.getTotalClusters = function() {
  return this.clusters_.length;
};


/**
 * Returns the google map that the clusterer is associated with.
 *
 * @return {google.maps.Map} The map.
 */
MarkerClusterer.prototype.getMap = function() {
  return this.map_;
};


/**
 * Sets the google map that the clusterer is associated with.
 *
 * @param {google.maps.Map} map The map.
 */
MarkerClusterer.prototype.setMap = function(map) {
  this.map_ = map;
};


/**
 * Returns the size of the grid.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getGridSize = function() {
  return this.gridSize_;
};


/**
 * Returns the size of the grid.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setGridSize = function(size) {
  this.gridSize_ = size;
};


/**
 * Extends a bounds object by the grid size.
 *
 * @param {google.maps.LatLngBounds} bounds The bounds to extend.
 * @return {google.maps.LatLngBounds} The extended bounds.
 */
MarkerClusterer.prototype.getExtendedBounds = function(bounds) {
  var projection = this.getProjection();

  // Turn the bounds into latlng.
  var tr = new google.maps.LatLng(bounds.getNorthEast().lat(),
      bounds.getNorthEast().lng());
  var bl = new google.maps.LatLng(bounds.getSouthWest().lat(),
      bounds.getSouthWest().lng());

  // Convert the points to pixels and the extend out by the grid size.
  var trPix = projection.fromLatLngToDivPixel(tr);
  trPix.x += this.gridSize_;
  trPix.y -= this.gridSize_;

  var blPix = projection.fromLatLngToDivPixel(bl);
  blPix.x -= this.gridSize_;
  blPix.y += this.gridSize_;

  // Convert the pixel points back to LatLng
  var ne = projection.fromDivPixelToLatLng(trPix);
  var sw = projection.fromDivPixelToLatLng(blPix);

  // Extend the bounds to contain the new bounds.
  bounds.extend(ne);
  bounds.extend(sw);

  return bounds;
};


/**
 * Determins if a marker is contained in a bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @param {google.maps.LatLngBounds} bounds The bounds to check against.
 * @return {boolean} True if the marker is in the bounds.
 * @private
 */
MarkerClusterer.prototype.isMarkerInBounds_ = function(marker, bounds) {
  return bounds.contains(marker.getPosition());
};


/**
 * Clears all clusters and markers from the clusterer.
 */
MarkerClusterer.prototype.clearMarkers = function() {
  this.resetViewport();

  // Set the markers a empty array.
  this.markers_ = [];
};


/**
 * Clears all existing clusters and recreates them.
 */
MarkerClusterer.prototype.resetViewport = function() {
  // Remove all the clusters
  for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
    cluster.remove();
  }

  // Reset the markers to not be added and to be invisible.
  for (var i = 0, marker; marker = this.markers_[i]; i++) {
    marker.isAdded = false;
    marker.setMap(null);
    marker.setVisible(false);
  }

  this.clusters_ = [];
};


/**
 * Redraws the clusters.
 */
MarkerClusterer.prototype.redraw = function() {
  this.createClusters_();
};


/**
 * Creates the clusters.
 *
 * @private
 */
MarkerClusterer.prototype.createClusters_ = function() {
  if (!this.ready_) {
    return;
  }

  // Get our current map view bounds.
  // Create a new bounds object so we don't affect the map.
  var mapBounds = new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),
      this.map_.getBounds().getNorthEast());
  var bounds = this.getExtendedBounds(mapBounds);

  for (var i = 0, marker; marker = this.markers_[i]; i++) {
    var added = false;
    if (!marker.isAdded && this.isMarkerInBounds_(marker, bounds)) {
      for (var j = 0, cluster; cluster = this.clusters_[j]; j++) {
        if (!added && cluster.getCenter() &&
            cluster.isMarkerInClusterBounds(marker)) {
          added = true;
          cluster.addMarker(marker);
          break;
        }
      }
//      console.log(cluster.getCenter());
//      this.map_.fitBounds(bounds);
      if (!added) {
          
        // Create a new cluster.
        var cluster = new Cluster(this);
        cluster.addMarker(marker);
        this.clusters_.push(cluster);
      }
    }
  }
};


/**
 * A cluster that contains markers.
 *
 * @param {MarkerClusterer} markerClusterer The markerclusterer that this
 *     cluster is associated with.
 * @constructor
 * @ignore
 */
function Cluster(markerClusterer) {
  this.markerClusterer_ = markerClusterer;
  this.map_ = markerClusterer.getMap();
  this.gridSize_ = markerClusterer.getGridSize();
  this.center_ = null;
  this.markers_ = [];
  this.bounds_ = null;
 /* 
  this.clusterIcon_ = new ClusterIcon(this, markerClusterer.getStyles(),
      markerClusterer.getGridSize());
	*/
}


/**
 * Determins if a marker is already added to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker is already added.
 */
Cluster.prototype.isMarkerAlreadyAdded = function(marker) {
  if (this.markers_.indexOf) {
    return this.markers_.indexOf(marker) != -1;
  } else {
    for (var i = 0, m; m = this.markers_[i]; i++) {
      if (m == marker) {
        return true;
      }
    }
  }
  return false;
};


/**
 * Add a marker the cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @return {boolean} True if the marker was added.
 */
Cluster.prototype.addMarker = function(marker) {
  if (this.isMarkerAlreadyAdded(marker)) {
    return false;
  }

  if (!this.center_) {
    this.center_ = marker.getPosition();
    this.calculateBounds_();
  }

  if (this.markers_.length == 0) {
    // Only 1 marker in this cluster so show the marker.
    marker.setMap(this.map_);
    marker.setVisible(true);
  } else if (this.markers_.length == 1) {
    // Hide the 1 marker that was showing.
    this.markers_[0].setMap(null);
    this.markers_[0].setVisible(false);
  }

  marker.isAdded = true;
  this.markers_.push(marker);

  this.updateIcon();
  return true;
};


/**
 * Returns the marker clusterer that the cluster is associated with.
 *
 * @return {MarkerClusterer} The associated marker clusterer.
 */
Cluster.prototype.getMarkerClusterer = function() {
  return this.markerClusterer_;
};


/**
 * Returns the bounds of the cluster.
 *
 * @return {google.maps.LatLngBounds} the cluster bounds.
 */
Cluster.prototype.getBounds = function() {
  this.calculateBounds_();
  return this.bounds_;
};


/**
 * Removes the cluster
 */
Cluster.prototype.remove = function() {
  /*this.clusterIcon_.remove();*/
  delete this.markers_;
};


/**
 * Returns the center of the cluster.
 *
 * @return {google.maps.LatLng} The cluster center.
 */
Cluster.prototype.getCenter = function() {
  return this.center_;
};


/**
 * Calculated the bounds of the cluster with the grid.
 *
 * @private
 */
Cluster.prototype.calculateBounds_ = function() {
  var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
  this.bounds_ = this.markerClusterer_.getExtendedBounds(bounds);
};


/**
 * Determines if a marker lies in the clusters bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker lies in the bounds.
 */
Cluster.prototype.isMarkerInClusterBounds = function(marker) {
  return this.bounds_.contains(marker.getPosition());
};


/**
 * Returns the map that the cluster is associated with.
 *
 * @return {google.maps.Map} The map.
 */
Cluster.prototype.getMap = function() {
  return this.map_;
};

Cluster.prototype.getMarkers = function() {
  return this.markers_;
};


/**
 * Updates the cluster icon
 */
Cluster.prototype.updateIcon = function() {
  var zoom = this.map_.getZoom();
  var mz = this.markerClusterer_.getMaxZoom();

  if (zoom > mz) {
    // The zoom is greater than our max zoom so show all the markers in cluster.
    for (var i = 0, marker; marker = this.markers_[i]; i++) {
      marker.setMap(this.map_);
      marker.setVisible(true);
	  marker.setCluster(null);
    }
    return;
  }

  if (this.markers_.length < 2) {
    // We have 0 or 1 markers so hide the icon.
    /*this.clusterIcon_.hide();*/
	
    for (var i = 0, marker; marker = this.markers_[i]; i++) {
	  marker.setCluster(null);
    }
	
    return;
  }

	this.markers_[0].setMap(this.map_);
	this.markers_[0].show();
	this.markers_[0].setCluster(this);
};


// Export Symbols for Closure
// If you are not going to compile with closure then you can remove the
// code below.
window['MarkerClusterer'] = MarkerClusterer;
MarkerClusterer.prototype['addMarker'] = MarkerClusterer.prototype.addMarker;
MarkerClusterer.prototype['addMarkers'] = MarkerClusterer.prototype.addMarkers;
MarkerClusterer.prototype['clearMarkers'] =
    MarkerClusterer.prototype.clearMarkers;
MarkerClusterer.prototype['getCalculator'] =
    MarkerClusterer.prototype.getCalculator;
MarkerClusterer.prototype['getGridSize'] =
    MarkerClusterer.prototype.getGridSize;
MarkerClusterer.prototype['getMap'] = MarkerClusterer.prototype.getMap;
MarkerClusterer.prototype['getMarkers'] = MarkerClusterer.prototype.getMarkers;
MarkerClusterer.prototype['getMaxZoom'] = MarkerClusterer.prototype.getMaxZoom;
MarkerClusterer.prototype['getStyles'] = MarkerClusterer.prototype.getStyles;
MarkerClusterer.prototype['getTotalClusters'] =
    MarkerClusterer.prototype.getTotalClusters;
MarkerClusterer.prototype['getTotalMarkers'] =
    MarkerClusterer.prototype.getTotalMarkers;
MarkerClusterer.prototype['redraw'] = MarkerClusterer.prototype.redraw;
MarkerClusterer.prototype['removeMarker'] =
    MarkerClusterer.prototype.removeMarker;
MarkerClusterer.prototype['resetViewport'] =
    MarkerClusterer.prototype.resetViewport;
MarkerClusterer.prototype['setCalculator'] =
    MarkerClusterer.prototype.setCalculator;
MarkerClusterer.prototype['setGridSize'] =
    MarkerClusterer.prototype.setGridSize;
MarkerClusterer.prototype['onAdd'] = MarkerClusterer.prototype.onAdd;
MarkerClusterer.prototype['draw'] = MarkerClusterer.prototype.draw;
MarkerClusterer.prototype['idle'] = MarkerClusterer.prototype.idle;

function UserThumbOverlay(user, map){
    this.init(user,map);
}

UserThumbOverlay.prototype = new google.maps.OverlayView();

UserThumbOverlay.prototype.init = function(user, map) {

    // image as JS object in format the snapr api returns
    this.user_ = user;
    this.map_ = map;

    // keep position object (latlng)
    this.position_ = new google.maps.LatLng( user.location_latitude, user.location_longitude );

    // We define a property to hold the image's
    // div. We'll actually create this div
    // upon receipt of the add() method so we'll
    // leave it null for now.
    this.div_ = null;

    // custom cluster
    this.cluster_ = null;

    // Explicitly call setMap() on this overlay
    this.setMap(map);
}

UserThumbOverlay.prototype.setCluster = function(cluster) {
    this.cluster_ = cluster;
}

UserThumbOverlay.prototype.getCluster = function(cluster) {
    return this.cluster_;
}

UserThumbOverlay.prototype.triggerOverlayClick = function() {
    google.maps.event.trigger(this, 'overlayclick', [this]);
}

UserThumbOverlay.prototype.onAdd = function() {
    // Note: an overlay's receipt of onAdd() indicates that
    // the map's panes are now available for attaching
    // the overlay to the map via the DOM.

    var div = $('#userthumbtemplate').clone();

    if ( this.getCluster() )
    {
        div.find('.clustercount').text(this.getCluster().getMarkers().length).show();
    }
    else
    {
        div.find('.clustercount').hide();
    }

    div.show();
    var that = this;

    div.find('img.usermapthumbimage').unbind('click');
    div.find('img.usermapthumbimage').click(function(e){
        e.stopPropagation();
        e.preventDefault();
        that.triggerOverlayClick();
        return false;
    });

    var image = div.find('.usermapthumbimage'); 
    image.attr('src', this.getUser().thumb);
    var w = this.getUser().thumb_x || 86;
    var h = this.getUser().thumb_y || 64;

    image.attr('height', h +'px');
    image.attr('width' , w +'px');
    div = div[0];

    // Set the overlay's div_ property to this DIV
    this.div_ = div;

    // We add an overlay to a map via one of the map's panes.
    // We'll add this overlay to the overlayImage pane.
    //console.log(this);
    var panes = this.getPanes();
    panes.floatPane.appendChild(div);
    //panes.overlayLayer.appendChild(div);
}

UserThumbOverlay.prototype.draw = function() {
    var overlayProjection = this.getProjection();
    var position = this.position_;
    var px = overlayProjection.fromLatLngToDivPixel( position );

    var div = this.div_;
    div.style.left = (px.x) + 'px';
    div.style.top = (px.y) + 'px';
}

UserThumbOverlay.prototype.getPosition = function() {
	return this.position_;
}

UserThumbOverlay.prototype.getUser = function() {
	return this.user_;
}


UserThumbOverlay.prototype.setVisible = function(value) {
    if ( value ) {
        this.show();
    }
    else {
        this.hide();
    }
}

UserThumbOverlay.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
}
UserThumbOverlay.prototype.hide = function() {
    if (this.div_) {
      this.div_.style.visibility = "hidden";
    }
}

UserThumbOverlay.prototype.show = function() {
    if (this.div_) {
      this.div_.style.visibility = "visible";
    }
}

UserThumbOverlay.prototype.toggle = function() {
    if (this.div_) {
      if (this.div_.style.visibility == "hidden") {
        this.show();
      } else {
        this.hide();
      }
    }
}

UserThumbOverlay.prototype.toggleDOM = function() {
    if (this.getMap()) {
      this.setMap(null);
    } else {
      this.setMap(this.map_);
    }
}

// From
// http://google-ajax-examples.googlecode.com/svn/trunk/whereareyou/scripts/geometa.js
function prepareGeolocation(opt_force) {
if ( opt_force || typeof navigator.geolocation == "undefined" || navigator.geolocation.shim ) (function(){

// -- BEGIN GEARS_INIT
(function() {
  // We are already defined. Hooray!
  if (window.google && google.gears) {
    return;
  }

  var factory = null;

  // Firefox
  if (typeof GearsFactory != 'undefined') {
    factory = new GearsFactory();
  } else {
    // IE
    try {
      factory = new ActiveXObject('Gears.Factory');
      // privateSetGlobalObject is only required and supported on WinCE.
      if (factory.getBuildInfo().indexOf('ie_mobile') != -1) {
        factory.privateSetGlobalObject(this);
      }
    } catch (e) {
      // Safari
      if ((typeof navigator.mimeTypes != 'undefined')
           && navigator.mimeTypes["application/x-googlegears"]) {
        factory = document.createElement("object");
        factory.style.display = "none";
        factory.width = 0;
        factory.height = 0;
        factory.type = "application/x-googlegears";
        document.documentElement.appendChild(factory);
      }
    }
  }

  // *Do not* define any objects if Gears is not installed. This mimics the
  // behavior of Gears defining the objects in the future.
  if (!factory) {
    return;
  }

  // Now set up the objects, being careful not to overwrite anything.
  //
  // Note: In Internet Explorer for Windows Mobile, you can't add properties to
  // the window object. However, global objects are automatically added as
  // properties of the window object in all browsers.
  if (!window.google) {
    google = {};
  }

  if (!google.gears) {
    google.gears = {factory: factory};
  }
})();
// -- END GEARS_INIT

var GearsGeoLocation = (function() {
    // -- PRIVATE
    if (!google || !google.gears || !google.gears.factory) {
    	return null;
    }
    var geo = google.gears.factory.create('beta.geolocation');

    var wrapSuccess = function(callback, self) { // wrap it for lastPosition love
        return function(position) {
            callback(position);
            self.lastPosition = position;
        }
    }

    // -- PUBLIC
    return {
        shim: true,

        type: "Gears",

        lastPosition: null,

        getCurrentPosition: function(successCallback, errorCallback, options) {
            var self = this;
            var sc = wrapSuccess(successCallback, self);
            geo.getCurrentPosition(sc, errorCallback, options);
        },

        watchPosition: function(successCallback, errorCallback, options) {
            geo.watchPosition(successCallback, errorCallback, options);
        },

        clearWatch: function(watchId) {
            geo.clearWatch(watchId);
        },

        getPermission: function(siteName, imageUrl, extraMessage) {
            geo.getPermission(siteName, imageUrl, extraMessage);
        }

    };
})();

var AjaxGeoLocation = (function() {
    // -- PRIVATE
    var loading = false;
    var loadGoogleLoader = function() {
        if (!hasGoogleLoader() && !loading) {
            loading = true;
            var s = document.createElement('script');
            s.src = 'http://www.google.com/jsapi?callback=_google_loader_apiLoaded';
            s.type = "text/javascript";
            document.getElementsByTagName('body')[0].appendChild(s);
        }
    };

    var queue = [];
    var addLocationQueue = function(callback) {
        queue.push(callback);
    }

    var runLocationQueue = function() {
        if (hasGoogleLoader()) {
            while (queue.length > 0) {
                var call = queue.pop();
                call();
            }
        }
    }

    window['_google_loader_apiLoaded'] = function() {
        runLocationQueue();
    }

    var hasGoogleLoader = function() {
        return (window['google'] && google['loader']);
    }

    var checkGoogleLoader = function(callback) {
        if (hasGoogleLoader()) return true;

        addLocationQueue(callback);

        loadGoogleLoader();

        return false;
    };

    loadGoogleLoader(); // start to load as soon as possible just in case

    // -- PUBLIC
    return {
        shim: true,

        type: "ClientLocation",

        lastPosition: null,

        getCurrentPosition: function(successCallback, errorCallback, options) {
            var self = this;
            if (!checkGoogleLoader(function() {
                self.getCurrentPosition(successCallback, errorCallback, options);
            })) return;

            if (google.loader.ClientLocation) {
                var cl = google.loader.ClientLocation;

                var position = {
                    latitude: cl.latitude,
                    longitude: cl.longitude,
                    altitude: null,
                    accuracy: 43000, // same as Gears accuracy over wifi?
                    altitudeAccuracy: null,
                    heading: null,
                    velocity: null,
                    timestamp: new Date(),

                    // extra info that is outside of the bounds of the core API
                    address: {
                        city: cl.address.city,
                        country: cl.address.country,
                        country_code: cl.address.country_code,
                        region: cl.address.region
                    }
                };

                successCallback(position);

                this.lastPosition = position;
            } else if (errorCallback === "function")  {
                errorCallback({ code: 3, message: "Using the Google ClientLocation API and it is not able to calculate a location."});
            }
        },

        watchPosition: function(successCallback, errorCallback, options) {
            this.getCurrentPosition(successCallback, errorCallback, options);

            var self = this;
            var watchId = setInterval(function() {
                self.getCurrentPosition(successCallback, errorCallback, options);
            }, 10000);

            return watchId;
        },

        clearWatch: function(watchId) {
            clearInterval(watchId);
        },

        getPermission: function(siteName, imageUrl, extraMessage) {
            // for now just say yes :)
            return true;
        }

    };
})();

// If you have Gears installed use that, else use Ajax ClientLocation
navigator.geolocation = (window.google && google.gears && google.gears.factory.create) ? GearsGeoLocation : AjaxGeoLocation;

})();
}
