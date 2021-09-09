"use strict";
var MapLayer = (function () {
    function MapLayer(name, mapSize) {
        this.isVisible = true;
        this.element = document.createElement("div");
        this.element.classList.add("ps2map__layer");
        this.name = name;
        this.mapSize = mapSize;
        this.element.style.width = this.element.style.height = mapSize + "px";
    }
    MapLayer.prototype.getMapSize = function () {
        return this.mapSize;
    };
    MapLayer.prototype.setMapSize = function (value) {
        this.mapSize = value;
    };
    MapLayer.prototype.hide = function () {
        this.isVisible = false;
    };
    MapLayer.prototype.show = function () {
        this.isVisible = true;
    };
    return MapLayer;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var StaticLayer = (function (_super) {
    __extends(StaticLayer, _super);
    function StaticLayer(name, mapSize) {
        return _super.call(this, name, mapSize) || this;
    }
    StaticLayer.prototype.addChild = function (element) {
        this.element.appendChild(element);
    };
    StaticLayer.prototype.removeChild = function (element) {
        this.element.removeChild(element);
    };
    StaticLayer.prototype.clearChildren = function () {
        this.element.innerHTML = "";
    };
    StaticLayer.prototype.redraw = function (viewbox, scale) {
        var factor = 1 / scale;
        this.element.style.transform = "scale3D(" + factor + ", " + factor + ", 0.0)";
    };
    return StaticLayer;
}(MapLayer));
var MapController = (function () {
    function MapController(viewport, mapSize) {
        this.layers = new Map();
        this.viewport = viewport;
        this.content = document.createElement("div");
        this.viewport.appendChild(this.content);
        this.mapSize = mapSize;
        var viewportSize = viewport.clientWidth / 10;
        this.scale = mapSize / viewportSize;
    }
    MapController.prototype.addLayer = function (layer) {
        layer.setMapSize(this.mapSize);
        this.layers.set(layer.name, layer);
        this.content.appendChild(layer.element);
    };
    MapController.prototype.getMapSize = function () {
        return this.mapSize;
    };
    MapController.prototype.setMapSize = function (value) {
        this.mapSize = value;
        this.layers.forEach(function (mapLayer) {
            mapLayer.setMapSize(value);
        });
    };
    MapController.prototype.getScale = function () {
        return this.scale;
    };
    MapController.prototype.setScale = function (value) {
        this.scale = value;
    };
    return MapController;
}());
var Api;
(function (Api) {
    var restEndpoint = "http://127.0.0.1:5000/";
    function getBasesFromContinent(continentId) {
        var rounded = Math.round(continentId);
        var url = restEndpoint + "bases/info?continent_id=" + rounded;
        return fetch(url).then(function (value) {
            return value.json();
        });
    }
    Api.getBasesFromContinent = getBasesFromContinent;
    function getContinent(continentId) {
        var url = restEndpoint + "continents/info";
        return fetch(url)
            .then(function (value) {
            return value.json();
        })
            .then(function (contList) {
            for (var i = 0; i < contList.length; i++) {
                var cont = contList[i];
                if (cont.id == continentId) {
                    return cont;
                }
            }
            throw "unknown continent ID: " + continentId;
        });
    }
    Api.getContinent = getContinent;
})(Api || (Api = {}));
var HeroMap = (function () {
    function HeroMap(viewport, initialContinentId, endpoint) {
        this.continentId = initialContinentId;
        var mapSize = 8192;
        this.controller = new MapController(viewport, mapSize);
        var hexLayer = new StaticLayer("hexes", mapSize);
        hexLayer.element.classList.add("ps2map__base-hexes");
        Api.getContinent(this.continentId).then(function (continent) {
            return fetch(endpoint + "/static/hex/" + continent.code + ".svg");
        }).then(function (data) {
            return data.text();
        }).then(function (payload) {
            var factory = document.createElement("template");
            factory.innerHTML = payload.trim();
            var svg = factory.content.firstElementChild;
            if (svg == null) {
                throw "Unable to load map hexes";
            }
            svg.classList.add("ps2map__base-hexes__hex");
            svg.querySelectorAll("polygon").forEach(function (polygon) {
                var promoteElement = function () {
                    svg.appendChild(polygon);
                    if (navigator.userAgent.toLowerCase().indexOf("firefox") == -1) {
                        return;
                    }
                    var removeHover = function () {
                        polygon.removeAttribute("style");
                    };
                    polygon.addEventListener("mouseleave", removeHover, {
                        passive: true
                    });
                    polygon.addEventListener("touchend", removeHover, {
                        passive: true
                    });
                    polygon.addEventListener("touchcancel", removeHover, {
                        passive: true
                    });
                    polygon.style.stroke = '#ffffff';
                };
                polygon.addEventListener("mouseenter", promoteElement, {
                    passive: true
                });
                polygon.addEventListener("touchstart", promoteElement, {
                    passive: true
                });
            });
            hexLayer.addChild(svg);
        });
        this.controller.addLayer(hexLayer);
    }
    return HeroMap;
}());
document.addEventListener("DOMContentLoaded", function () {
    var apiEndpoint = "http://127.0.0.1:5000";
    var continentId = 2;
    var viewport = document.getElementById("hero-map");
    if (viewport == null) {
        throw "Unable to locate viewport element";
    }
    if (viewport.tagName != "DIV") {
        throw "Expected viewport of type \"DIV\" (got " + viewport.tagName + ")";
    }
    new HeroMap(viewport, continentId, apiEndpoint);
});
