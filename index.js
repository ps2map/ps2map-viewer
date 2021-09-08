"use strict";
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
var MapLayer = (function () {
    function MapLayer(name, mapSize) {
        this.isVisible = true;
        this.layer = document.createElement("div");
        this.layer.classList.add("ps2map__layer");
        this.name = name;
        this.mapSize = mapSize;
        this.layer.style.width = this.layer.style.height = mapSize + " px";
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
    function StaticLayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StaticLayer.prototype.addChild = function (element) {
        this.layer.appendChild(element);
    };
    StaticLayer.prototype.removeChild = function (element) {
        this.layer.removeChild(element);
    };
    StaticLayer.prototype.clearChildren = function () {
        this.layer.innerHTML = "";
    };
    StaticLayer.prototype.redraw = function (viewbox, scale) {
        var factor = 1 / scale;
        this.layer.style.transform = "scale3D(" + factor + ", " + factor + ", 0.0)";
    };
    return StaticLayer;
}(MapLayer));
