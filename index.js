"use strict";
var MapLayer = (function () {
    function MapLayer(name, mapSize) {
        this.isVisible = true;
        this.element = document.createElement("div");
        this.element.classList.add("ps2map__layer");
        this.name = name;
        this.mapSize = mapSize;
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
        var _this = _super.call(this, name, mapSize) || this;
        _this.element.style.height = _this.element.style.width = mapSize + "px";
        return _this;
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
        this.element.style.transform =
            "matrix(" + cssScale + ", 0.0, 0.0, " + cssScale + ", " + -0.5 * this.mapSize + ", " + -0.5 * this.mapSize + ")";
    };
    return StaticLayer;
}(MapLayer));
var MapRenderer = (function () {
    function MapRenderer(viewport, mapSize) {
        this.layers = new Map();
        this.numZoomLevels = 12;
        this.viewport = viewport;
        this.viewport.classList.add("ps2map__viewport");
        this.anchor = document.createElement("div");
        this.anchor.classList.add("ps2map__anchor");
        this.viewport.appendChild(this.anchor);
        this.mapSize = mapSize;
        this.scale = mapSize / this.viewportSizeInMetres();
        this.cameraTarget = { x: mapSize * 0.5, y: mapSize * 0.5 };
        this.zoomLevels = this.calculateZoomLevels();
        this.zoom = this.zoomLevels[this.zoomLevels.length - 1];
        this.viewport.addEventListener("wheel", this.onZoom.bind(this), { passive: false });
    }
    MapRenderer.prototype.addLayer = function (layer) {
        layer.setMapSize(this.mapSize);
        this.layers.set(layer.name, layer);
        this.anchor.appendChild(layer.element);
    };
    MapRenderer.prototype.setScale = function (value) {
        this.scale = value;
    };
    MapRenderer.prototype.onZoom = function (evt) {
        evt.preventDefault();
        var newZoom = this.bumpZoomLevel(evt.deltaY);
        var newScale = this.zoomLevels[newZoom];
        var boundingRec = this.viewport.getBoundingClientRect();
        var vportHeight = this.viewport.clientHeight;
        var vportWidth = this.viewport.clientWidth;
        var _a = this.clientSpaceToViewportSpace(evt.clientX, evt.clientY), relX = _a[0], relY = _a[1];
        var currentViewbox = this.viewboxFromCameraTarget(this.cameraTarget, this.scale);
        var newTarget = {
            x: currentViewbox.left + (currentViewbox.right - currentViewbox.left) * relX,
            y: currentViewbox.bottom + (currentViewbox.top - currentViewbox.bottom) * relY
        };
        var newViewbox = this.viewboxFromCameraTarget(newTarget, newScale);
        this.updateMinimap(newViewbox);
        this.setScale(newScale);
        this.layers.forEach(function (layer) {
            layer.redraw(newViewbox, newScale);
        });
    };
    MapRenderer.prototype.calculateZoomLevels = function () {
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
    MapRenderer.prototype.viewportMinorAxis = function () {
        var height = this.viewport.clientHeight;
        var width = this.viewport.clientWidth;
        return height < width ? height : width;
    };
    MapRenderer.prototype.viewportSizeInMetres = function () {
        return this.viewportMinorAxis() / 4000;
    };
    MapRenderer.prototype.bumpZoomLevel = function (direction) {
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
    MapRenderer.prototype.cssPxToMetres = function (length, scale) {
        return length / 4000 * scale;
    };
    MapRenderer.prototype.viewboxFromCameraTarget = function (target, scale) {
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
    MapRenderer.prototype.updateMinimap = function (viewbox) {
        var minimap = document.getElementById("debug-minimap");
        var box = document.getElementById("debug-minimap__viewbox");
        if (minimap == null || box == null)
            return;
        var minimapSize = minimap.clientHeight;
        var relViewbox = {
            top: (viewbox.top + this.mapSize * 0.5) / this.mapSize,
            left: (viewbox.left + this.mapSize * 0.5) / this.mapSize,
            bottom: (viewbox.bottom + this.mapSize * 0.5) / this.mapSize,
            right: (viewbox.right + this.mapSize * 0.5) / this.mapSize
        };
        var relHeight = relViewbox.top - relViewbox.bottom;
        var relWidth = relViewbox.right - relViewbox.left;
        var relLeft = relViewbox.left - 0.5;
        var relTop = relViewbox.bottom - 0.5;
        box.style.height = minimapSize * relHeight + "px";
        box.style.width = minimapSize * relWidth + "px";
        box.style.left = minimapSize * relLeft + "px";
        box.style.bottom = minimapSize * relTop + "px";
    };
    MapRenderer.prototype.clientSpaceToViewportSpace = function (clientX, clientY) {
        var bbox = this.viewport.getBoundingClientRect();
        var relX = 1 - (bbox.width + bbox.left - clientX) / bbox.width;
        var relY = (bbox.height + bbox.top - clientY) / bbox.height;
        return [relX, relY];
    };
    return MapRenderer;
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
        this.controller = new MapRenderer(viewport, mapSize);
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
