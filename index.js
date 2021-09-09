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
        var cssScale = 4000 / scale;
        var viewboxWidth = 8192;
        var viewboxHeight = 8192;
        this.element.style.transform =
            "matrix(" + cssScale + ", 0.0, 0.0, " + cssScale + ", " + -0.5 * viewboxWidth + ", " + -0.5 * viewboxHeight + ")";
    };
    return StaticLayer;
}(MapLayer));
var MapController = (function () {
    function MapController(viewport, mapSize) {
        this.layers = new Map();
        this.numZoomLevels = 12;
        this.viewport = viewport;
        this.content = document.createElement("div");
        this.viewport.appendChild(this.content);
        this.mapSize = mapSize;
        this.scale = mapSize / this.viewportSizeInMetres();
        this.cameraTarget = { x: mapSize * 0.5, y: mapSize * 0.5 };
        this.zoomLevels = this.calculateZoomLevels();
        this.zoom = this.zoomLevels[this.zoomLevels.length - 1];
        this.viewport.addEventListener("wheel", this.onZoom.bind(this), { passive: true });
    }
    MapController.prototype.addLayer = function (layer) {
        layer.setMapSize(this.mapSize);
        this.layers.set(layer.name, layer);
        this.content.appendChild(layer.element);
        layer.element.style.left = this.viewport.clientWidth * 0.5 + "px";
        layer.element.style.top = this.viewport.clientHeight * 0.5 + "px";
    };
    MapController.prototype.setScale = function (value) {
        this.scale = value;
    };
    MapController.prototype.onZoom = function (evt) {
        var newZoom = this.bumpZoomLevel(evt.deltaY);
        var newScale = this.zoomLevels[newZoom];
        var boundingRec = this.viewport.getBoundingClientRect();
        var vportHeight = this.viewport.clientHeight;
        var vportWidth = this.viewport.clientWidth;
        var posRelY = (vportHeight + boundingRec.top - evt.clientY) / vportHeight;
        var posRelX = 1 - (vportWidth + boundingRec.left - evt.clientX) / vportWidth;
        var currentViewbox = this.viewboxFromCameraTarget(this.cameraTarget, this.scale);
        var newTarget = {
            x: currentViewbox.left + (currentViewbox.right - currentViewbox.left) * posRelX,
            y: currentViewbox.bottom + (currentViewbox.top - currentViewbox.bottom) * posRelY
        };
        var newViewbox = this.viewboxFromCameraTarget(newTarget, newScale);
        this.setScale(newScale);
        this.layers.forEach(function (layer) {
            layer.redraw(newViewbox, newScale);
        });
    };
    MapController.prototype.calculateZoomLevels = function () {
        var vportMetres = this.viewportSizeInMetres();
        var min_scale = this.mapSize / vportMetres;
        var max_scale = 100 / vportMetres;
        var map_scale_step = Math.pow(Math.round(min_scale / max_scale / 50)
            * 50, 1 / (this.numZoomLevels - 1));
        var scale = Math.floor(max_scale / 100) * 100;
        var zoomLevels = [scale];
        for (var i = 1; i < this.numZoomLevels; i++) {
            scale *= map_scale_step;
            zoomLevels.push(Math.round(scale / 200) * 200);
        }
        return zoomLevels;
    };
    MapController.prototype.viewportMinorAxis = function () {
        var height = this.viewport.clientHeight;
        var width = this.viewport.clientWidth;
        return height < width ? height : width;
    };
    MapController.prototype.viewportSizeInMetres = function () {
        return this.viewportMinorAxis() / 4000;
    };
    MapController.prototype.bumpZoomLevel = function (direction) {
        var newZoom = this.zoom;
        if (direction == 0)
            return newZoom;
        if (direction < 0)
            newZoom--;
        else if (direction > 0)
            newZoom++;
        if (newZoom < 0)
            newZoom = 0;
        else if (newZoom >= this.numZoomLevels)
            newZoom = this.numZoomLevels - 1;
        this.zoom = newZoom;
        return newZoom;
    };
    MapController.prototype.cssPxToMetres = function (length, scale) {
        return length / 4000 * scale;
    };
    MapController.prototype.viewboxFromCameraTarget = function (target, scale) {
        var viewportWidth = this.viewport.clientWidth;
        var viewportHeight = this.viewport.clientHeight;
        var viewboxWidth = this.cssPxToMetres(viewportWidth, scale);
        var viewboxHeight = this.cssPxToMetres(viewportHeight, scale);
        return {
            top: target.y + viewboxHeight * 0.5,
            right: target.x + viewboxWidth * 0.5,
            bottom: target.y - viewboxHeight * 0.5,
            left: target.x - viewboxWidth * 0.5
        };
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
