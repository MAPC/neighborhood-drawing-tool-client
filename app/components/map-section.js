import Ember from 'ember';
// import ClipperLib from 'npm:js-clipper';

export default Ember.Component.extend({
  geom: null,
  geoJsonLayer: null,
  updateMap: function() {
    var geoJsonLayer = this.get('geoJsonLayer');
    var data = this.get('geom.geometry');
    geoJsonLayer.clearLayers();
    geoJsonLayer.addData(data);

  }.observes('geom'),
  updateScope: function() {
    this.map.fitBounds(this.geoJsonLayer.getBounds());
  }.observes('geom'),

  makeSqlPolygon: function(coords) {
    var s = "ST_SETSRID(ST_PolygonFromText(\'POLYGON((";
    var firstCoord;
    coords.forEach(function(coord,i){
      s+=coord.lng + " " + coord.lat + ",";

      //remember the first coord
      if(i==0) {
        firstCoord = coord;
      }

      if(i==coords.length-1) {
        s+=firstCoord.lng + " " + firstCoord.lat;
      }
    });
    s+="))\'),4326)"
    return s;
  },
  // collection: Ember.computed("options") - implementation for doing a geo collection.
  didInsertElement: function() {
    var that = this;
    // var drawnLayer;
    this.map = L.map(this.$('#map').get(0));
    
    var options = {
        position: 'topright',
        draw: {
            polyline:true,
            polygon: {
                allowIntersection: false, // Restricts shapes to simple polygons
                drawError: {
                    color: '#e1e100', // Color the shape will turn when intersects
                    message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                },
                shapeOptions: {
                    color: '#000000'
                }
            },
            circle: false, // Turns off this drawing tool
            rectangle: {
                shapeOptions: {
                    clickable: false
                }
            },
            marker:false
        }
    };

    var drawControl = new L.Control.Draw(options);
    this.map.addControl(drawControl);

    // this.map.addLayer(new L.FreeDraw({ mode: L.FreeDraw.MODES.CREATE | L.FreeDraw.MODES.EDIT }));

    // var customPolygon;
    // this.map.on('draw:created', function (e) {
    //     //hide the arrow
    //     // $('.infoArrow').hide();

    //     var type = e.layerType,
    //         layer = e.layer;

    //     drawnLayer=e.layer;

    //     var coords = e.layer._latlngs;
    //     customPolygon = that.makeSqlPolygon(coords);
    //     // Do whatever else you need to. (save to db, add to map etc)
    //     // that.map
    //     console.log(customPolygon);
    //     var queryTemplate = 'https://wilburnforce.cartodb.com/api/v2/sql?q=SELECT the_geom FROM census_tracts a WHERE ST_INTERSECTS(' + customPolygon + ', a.the_geom)&format=geojson';
    //     $.getJSON(queryTemplate, function(response) {
    //       L.geoJson(response).addTo(that.map);
    //       that.map.addLayer(layer);
    //     });
    //     // $('.download').removeAttr('disabled');
    // });

    var geoJsonLayer = L.geoJson().addTo(this.map);
    var data = this.get('geom.geometry');
    geoJsonLayer.addData(data);
    this.set('geoJsonLayer', geoJsonLayer);
    this.map.fitBounds(geoJsonLayer.getBounds());
    this.map.invalidateSize();
    
    L.tileLayer('http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.png', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      subdomains: 'abcd',
    }).addTo(this.map);
  }
});
