'use strict';

$(document).ready(function () {

  var map = L.map('map').setView([48.864947, 2.398451], 18);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

  var scene;
  var process = false;

  $('#start').on('click', function () {
    $('#modal-render').modal();
    process = true;
  });

  $('#modal').on('click', function () {
    $('#modal-render').modal();
  });

  $('#modal-render').on('shown.bs.modal', function () {
    if (!process) return;
    scene = new ThreeScene('#render-scene');
    scene.animate();
    start();
    process = false;
  });

  $('#export').on('click', function () {
    scene.export()
  });

  function start() {
    var mapCenter = map.getCenter();
    var mapZoom = map.getZoom();

    var bounds = map.getBounds();
    var box = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()];
    var url = 'http://overpass-api.de/api/interpreter?data=[out:json];((way(' + box.join(',') + ')[%22building%22]);(._;node(w);););out;';

    function filterData(data) {
      var nodes = _.filter(data.elements, function (item) {
        return 'node' === item.type;
      });
      var features = _.filter(data.elements, function (item) {
        return 'way' === item.type && item.tags.building;
      });

      _.each(features, function (feature) {
        var levels = feature.tags['building:levels'] || 2;
        var outlinePath = filterNodes(feature, nodes);
        var points = _.map(outlinePath, function (coord) {
          return convertProjection(coord)
        });
        scene.renderBuilding(points, levels)
      });
      scene.render();
      end()
    }

    function filterNodes(feature, nodes) {
      var path = _(nodes).chain().filter(function (node) {
        // Find nodes that are part of this feature
        return 0 <= feature.nodes.indexOf(node.id);
      }).sortBy(function (node) {
        // Order nodes in the order that they are specified in the feature
        return feature.nodes.indexOf(node.id);
      }).map(function (node) {
        // Convert node objects to lat/lng array for passing to polygon function
        return [node.lon, node.lat];
      }).value();
      return path;
    }

    function convertProjection(coords) {
      var tileSize = 128; // Pixel size of a single map tile
      var zoom = mapZoom; // Zoom level
      var projection = d3.geo.mercator()
        .center([mapCenter.lng, mapCenter.lat]) // Geographic coordinates of map centre
        .translate([0, 0]) // Pixel coordinates of .center()
        .scale(tileSize << zoom); // Scaling value
      var pixelValue = projection(coords); // Returns [x, y]
      return [pixelValue[1] * -1, pixelValue[0] * -1];
    }

    $.getJSON(url, filterData);
  }


  function end() {
    $('#modal').show();
    $('#export-footer').show();
  }
});
