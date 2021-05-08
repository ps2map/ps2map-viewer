"use strict";
var ownershipColorsCSS = [
    getComputedStyle(document.documentElement)
        .getPropertyValue("--COLOR-FG-CAPPED-NULL")
        .trim(),
    getComputedStyle(document.documentElement)
        .getPropertyValue("--COLOR-FG-CAPPED-VS")
        .trim(),
    getComputedStyle(document.documentElement)
        .getPropertyValue("--COLOR-FG-CAPPED-NC")
        .trim(),
    getComputedStyle(document.documentElement)
        .getPropertyValue("--COLOR-FG-CAPPED-TR")
        .trim(),
];
function cycleFactionColour(base) {
    var num = Math.round(Math.random() * 3);
    base.style.fill = ownershipColorsCSS[num];
    return num;
}
var Zoomable = (function () {
    function Zoomable(content, container, initialZoom, minZoom, maxZoom) {
        if (initialZoom === void 0) { initialZoom = 1.0; }
        if (minZoom === void 0) { minZoom = 1.0; }
        if (maxZoom === void 0) { maxZoom = 10.0; }
        this.onZoom = [];
        this.scrollDistY = 0.0;
        this.lastScrollCursor = [0.0, 0.0];
        this.rafPending = false;
        this.target = content;
        this.container = container;
        this.zoom = initialZoom;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        content.addEventListener("mousedown", this.mousePan.bind(this));
        content.addEventListener("wheel", this.mouseWheel.bind(this), {
            passive: false
        });
        content.addEventListener("touchstart", this.pinchZoom.bind(this), {
            passive: true
        });
    }
    Zoomable.prototype.registerZoomCallback = function (callback) {
        this.onZoom.push(callback);
    };
    Zoomable.prototype.unregisterZoomCallback = function (callback) {
        for (var i = 0; i < this.onZoom.length; i++) {
            if (this.onZoom[i] == callback) {
                this.onZoom.splice(i);
                return;
            }
        }
    };
    Zoomable.prototype.bumpZoomLevel = function (increase) {
        var _this = this;
        var zoomLevel = this.zoom;
        var zoomLevels = Array();
        for (var i = this.minZoom; i < this.maxZoom; i++) {
            zoomLevels.push(i);
        }
        var index = zoomLevels.indexOf(this.zoom);
        if (index < 0) {
            for (var i = 0; i < zoomLevels.length; i++) {
                var refLevel = zoomLevels[i];
                if (refLevel > this.zoom) {
                    if (increase) {
                        zoomLevel = refLevel;
                        break;
                    }
                    zoomLevel = zoomLevels[i - 1];
                    break;
                }
            }
        }
        else {
            zoomLevel += increase ? 1 : -1;
        }
        if (this.rafPending) {
            return;
        }
        this.rafPending = true;
        requestAnimationFrame(function () {
            _this.applyZoomLevel(zoomLevel);
            _this.rafPending = false;
        });
    };
    Zoomable.prototype.mousePan = function (evtDown) {
        if (evtDown.button != 0) {
            return;
        }
        var self = this;
        var container = this.container;
        var element = this.target;
        var initialScrollLeft = container.scrollLeft;
        var initialScrollTop = container.scrollTop;
        function mouseDrag(evtDrag) {
            if (self.rafPending) {
                return;
            }
            requestAnimationFrame(function () {
                var deltaX = evtDrag.clientX - evtDown.clientX;
                var deltaY = evtDrag.clientY - evtDown.clientY;
                container.scrollLeft = initialScrollLeft - deltaX;
                container.scrollTop = initialScrollTop - deltaY;
                self.rafPending = false;
            });
            self.rafPending = true;
        }
        function mouseUp() {
            element.removeEventListener("mousemove", mouseDrag);
            document.removeEventListener("mouseup", mouseUp);
        }
        element.addEventListener("mousemove", mouseDrag);
        document.addEventListener("mouseup", mouseUp);
    };
    Zoomable.prototype.constrainZoom = function (value) {
        var zoomLevel = value;
        if (zoomLevel < this.minZoom) {
            zoomLevel = this.minZoom;
        }
        else if (zoomLevel > this.maxZoom) {
            zoomLevel = this.maxZoom;
        }
        return zoomLevel;
    };
    Zoomable.prototype.applyZoomLevel = function (zoomLevel, relX, relY) {
        if (relX === void 0) { relX = 0.5; }
        if (relY === void 0) { relY = 0.5; }
        var vport = this.container;
        var screenX = relX * vport.clientWidth;
        var screenY = relY * vport.clientHeight;
        var newZoom = this.constrainZoom(zoomLevel);
        var zoomDelta = newZoom / this.zoom;
        var relScrollX = (screenX + vport.scrollLeft) * zoomDelta;
        var relScrollY = (screenY + vport.scrollTop) * zoomDelta;
        var scrollLeft = relScrollX - screenX;
        var scrollTop = relScrollY - screenY;
        var offset = (newZoom - 1.0) * 50.0;
        this.zoom = newZoom;
        this.target.style.transform =
            "translate3D(" + offset + "%, " + offset + "%, 0) " + ("scale(" + this.zoom + ")");
        vport.scrollTo({
            top: scrollTop,
            left: scrollLeft,
            behavior: "auto"
        });
        this.invokeZoomCallbacks();
    };
    Zoomable.prototype.mouseWheel = function (evt) {
        var _this = this;
        evt.preventDefault();
        this.lastScrollCursor = [evt.clientX, evt.clientY];
        var deltaY = evt.deltaY;
        if (evt.deltaMode == 0) {
            deltaY *= 0.0125;
        }
        this.scrollDistY = deltaY * 0.4;
        if (this.rafPending) {
            return;
        }
        requestAnimationFrame(function () {
            var relX = _this.lastScrollCursor[0] / _this.container.clientWidth;
            var relY = _this.lastScrollCursor[1] / _this.container.clientHeight;
            var zoomRel = 1 + _this.scrollDistY * 0.2;
            if (zoomRel < 1) {
                zoomRel = 1 / zoomRel;
            }
            else {
                zoomRel = 2 - zoomRel;
            }
            _this.applyZoomLevel(_this.zoom * zoomRel, relX, relY);
            _this.scrollDistY = 0.0;
            _this.rafPending = false;
        });
        this.rafPending = true;
    };
    Zoomable.prototype.invokeZoomCallbacks = function () {
        var _this = this;
        this.onZoom.forEach(function (callback) {
            callback(_this.zoom);
        });
    };
    Zoomable.prototype.getTouchesCenter = function (touches) {
        var avgX = 0.0;
        var avgY = 0.0;
        if (touches.length == 0) {
            return [NaN, NaN];
        }
        for (var i = 0; i < touches.length; i++) {
            var touch = touches.item(i);
            avgX += touch.clientX;
            avgY += touch.clientY;
        }
        avgX /= touches.length;
        avgY /= touches.length;
        return [avgX, avgY];
    };
    Zoomable.prototype.getTouchesDistance = function (touches) {
        if (touches.length != 2) {
            throw "distance only valid between two points";
        }
        var pt1 = touches.item(0);
        var pt2 = touches.item(1);
        return Math.sqrt(Math.pow((pt2.clientX - pt1.clientX), 2) + Math.pow((pt2.clientY - pt1.clientY), 2));
    };
    Zoomable.prototype.pinchZoom = function (evt) {
        if (evt.touches.length != 2) {
            return;
        }
        var con = this;
        var touchStartDist = this.getTouchesDistance(evt.touches);
        var zoomStart = this.zoom;
        function touchMove(evt) {
            if (con.rafPending) {
                return;
            }
            if (evt.touches.length != 2) {
                return;
            }
            requestAnimationFrame(function () {
                var touchCenter = con.getTouchesCenter(evt.touches);
                var touchDist = con.getTouchesDistance(evt.touches);
                var distRel = touchDist / touchStartDist;
                var relX = touchCenter[0] / con.container.clientWidth;
                var relY = touchCenter[1] / con.container.clientHeight;
                con.applyZoomLevel(zoomStart * distRel, relX, relY);
                con.rafPending = false;
            });
            con.rafPending = true;
        }
        function touchEnd(evt) {
            con.target.removeEventListener("touchmove", touchMove);
            document.removeEventListener("touchend", touchEnd);
            document.removeEventListener("touchcancel", touchEnd);
        }
        con.target.addEventListener("touchmove", touchMove, {
            passive: true
        });
        document.addEventListener("touchend", touchEnd);
        document.addEventListener("touchcancel", touchEnd);
    };
    return Zoomable;
}());
var MapLayer = (function () {
    function MapLayer(layer, initialContinentId) {
        this.continentId = 0;
        this.layer = layer;
        this.switchContinent(initialContinentId);
    }
    MapLayer.prototype.switchContinent = function (continentId, force) {
        if (force === void 0) { force = false; }
        if (this.continentId != continentId && !force) {
            return;
        }
        this.continentId = continentId;
    };
    MapLayer.prototype.setVisibility = function (visible) {
        this.layer.style.display = visible ? "grid" : "none";
    };
    MapLayer.prototype.onZoom = function (zoomLevel) { };
    MapLayer.prototype.clear = function () {
        this.layer.innerHTML = "";
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
var BaseNameLayer = (function (_super) {
    __extends(BaseNameLayer, _super);
    function BaseNameLayer(layer, initialContinentId) {
        var _this = _super.call(this, layer, initialContinentId) || this;
        _this.domObjectMap = new Map();
        return _this;
    }
    BaseNameLayer.prototype.onZoom = function (zoomLevel) {
        for (var i = 0; i < this.layer.children.length; i++) {
            var base = this.layer.children.item(i);
            base.style.transform = "scale(" + 1 / zoomLevel + ")";
        }
    };
    BaseNameLayer.prototype.switchContinent = function (continentId) {
        var _this = this;
        getBasesFromContinent(continentId).then(function (bases) {
            var elements = [];
            bases.forEach(function (base) {
                var anchor = document.createElement("div");
                anchor.setAttribute("class", "layer-names__anchor");
                anchor.setAttribute("data-base-id", base.id.toString());
                _this.domObjectMap.set(base.id, anchor);
                elements.push(anchor);
                var posX = (4096 + base.map_pos[0]) / 81.92;
                var posY = (4096 + base.map_pos[1]) / 81.92;
                anchor.style.left = posX + "%";
                anchor.style.bottom = posY + "%";
                var iconBox = document.createElement("div");
                anchor.appendChild(iconBox);
                iconBox.setAttribute("class", "layer-names__icon");
                var layerImage = document.createElement("div");
                iconBox.appendChild(layerImage);
                var icon = document.createElement("img");
                layerImage.appendChild(icon);
                icon.setAttribute("alt", base.type_name);
                icon.setAttribute("src", _this.getBaseIconFromType(base.type_id));
                var label = document.createElement("p");
                anchor.appendChild(label);
                label.classList.add("layer-names__label");
                label.innerHTML = base.name;
                var labelShadow = document.createElement("p");
                anchor.appendChild(labelShadow);
                labelShadow.classList.add("layer-names__label", "layer-names__label--shadow");
                labelShadow.innerHTML = base.name;
            });
            _this.clear();
            elements.forEach(function (element) { return _this.layer.appendChild(element); });
        });
    };
    BaseNameLayer.prototype.setBaseOwnership = function (baseId, factionId) {
        var _this = this;
        var newColour = this.getFactionColour(factionId);
        var idList = baseId instanceof Array ? baseId : [baseId];
        idList.forEach(function (id) {
            var anchor = _this.domObjectMap.get(id);
            if (anchor == null) {
                console.warn("Ignoring unknown base ID " + id);
                return;
            }
            _this.setBaseIconColour(anchor, newColour);
        });
    };
    BaseNameLayer.prototype.getBaseIconFromType = function (typeId) {
        var fileName = "containment-site";
        switch (typeId) {
            case 2:
                fileName = "amp-station";
                break;
            case 3:
                fileName = "bio-lab";
                break;
            case 4:
                fileName = "tech-plant";
                break;
            case 5:
                fileName = "large-outpost";
                break;
            case 6:
                fileName = "small-outpost";
                break;
            case 7:
                fileName = "warpgate";
                break;
            case 9:
                fileName = "construction-outpost";
                break;
            default:
                console.warn("Encountered unknown facility type ID: " + typeId);
                break;
        }
        return "img/icons/" + fileName + ".svg";
    };
    BaseNameLayer.prototype.getFactionColour = function (factionId) {
        switch (factionId) {
            case 1:
                return "var(--COLOR-FG-CAPPED-VS)";
            case 2:
                return "var(--COLOR-FG-CAPPED-NC)";
            case 3:
                return "var(--COLOR-FG-CAPPED-TR)";
            default:
                return "#333333";
        }
    };
    BaseNameLayer.prototype.setBaseIconColour = function (base, newColour) {
        var elem = base.firstElementChild;
        if (!(elem instanceof HTMLElement)) {
            return;
        }
        elem.style.setProperty("--baseIconColour", newColour);
    };
    return BaseNameLayer;
}(MapLayer));
var HexLayer = (function (_super) {
    __extends(HexLayer, _super);
    function HexLayer(layer, initialContinentId) {
        var _this = _super.call(this, layer, initialContinentId) || this;
        _this.baseHoverCallback = function () { return null; };
        return _this;
    }
    HexLayer.prototype.switchContinent = function (continentId) {
        var _this = this;
        if (this.continentId == continentId) {
            return;
        }
        this.continentId = continentId;
        getContinent(continentId)
            .then(function (continent) {
            return fetch("http://127.0.0.1:5000/static/hex/" + continent.code + ".svg");
        })
            .then(function (data) {
            _this.clear();
            data.text().then(function (payload) {
                var factory = document.createElement("template");
                factory.innerHTML = payload.trim();
                var svg = factory.content.firstElementChild;
                if (svg == null) {
                    return;
                }
                svg.classList.add("layer-hexes__hex");
                svg.querySelectorAll("polygon").forEach(function (poly) {
                    var promoteElement = function () {
                        svg.appendChild(poly);
                    };
                    poly.addEventListener("mouseenter", promoteElement, {
                        passive: true
                    });
                    poly.addEventListener("touchstart", promoteElement, {
                        passive: true
                    });
                });
                _this.layer.appendChild(svg);
            });
        });
    };
    HexLayer.prototype.registerHoverCallback = function (element) {
        var _this = this;
        element.addEventListener("mouseover", function (evt) {
            if (evt.buttons % 4 > 0) {
                return;
            }
            _this.baseHoverCallback(parseInt(element.id));
        });
    };
    return HexLayer;
}(MapLayer));
var restEndpoint = "http://127.0.0.1:5000/";
function getBasesFromContinent(continentId) {
    var rounded = Math.round(continentId);
    var url = restEndpoint + "bases/info?continent_id=" + rounded;
    return fetch(url).then(function (value) {
        return value.json();
    });
}
function getBase(baseId) {
    var rounded = Math.round(baseId);
    var url = restEndpoint + "bases/info?base_id=" + rounded;
    return fetch(url)
        .then(function (value) {
        return value.json();
    })
        .then(function (contInfoList) {
        return contInfoList[0];
    });
}
function getContinent(continentId) {
    var rounded = Math.round(continentId);
    var url = restEndpoint + "continents/info?continent_id=" + rounded;
    return fetch(url)
        .then(function (value) {
        return value.json();
    })
        .then(function (contInfoList) {
        return contInfoList[0];
    });
}
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var mapBaseRes = 8192;
var TileLayer = (function (_super) {
    __extends(TileLayer, _super);
    function TileLayer(layer, initialContinentId, tileBaseUrl) {
        var _this = _super.call(this, layer, initialContinentId) || this;
        _this.isThrottled = false;
        _this.lod = _this.getLod(1.0);
        _this.tileSet = "bogus";
        _this.tileBaseUrl = tileBaseUrl;
        return _this;
    }
    TileLayer.prototype.switchContinent = function (continentId) {
        if (this.continentId == continentId) {
            return;
        }
        this.continentId = continentId;
        this.setTileSet(continentId);
    };
    TileLayer.prototype.onZoom = function (zoomLevel) {
        var _this = this;
        if (this.isThrottled) {
            return;
        }
        this.isThrottled = true;
        var lod = this.getLod(zoomLevel);
        setTimeout(function () {
            _this.isThrottled = false;
        }, 100);
        if (lod == this.lod) {
            return;
        }
        this.lod = lod;
        this.updateTiles();
    };
    TileLayer.prototype.getLod = function (zoomLevel) {
        var density = window.devicePixelRatio || 1;
        var minLod = zoomLevel * density;
        var lod = 3;
        if (minLod >= 8) {
            lod = 0;
        }
        else if (minLod >= 4) {
            lod = 1;
        }
        else if (minLod >= 2) {
            lod = 2;
        }
        return lod;
    };
    TileLayer.prototype.setTileSet = function (continentId) {
        return __awaiter(this, void 0, void 0, function () {
            var cont;
            var _this = this;
            return __generator(this, function (_a) {
                cont = getContinent(continentId);
                cont.then(function (contInfo) {
                    _this.tileSet = contInfo.code;
                    _this.updateTiles();
                });
                return [2];
            });
        });
    };
    TileLayer.prototype.updateTiles = function () {
        var _this = this;
        var numTiles = this.getNumTiles(this.lod);
        var newTiles = [];
        if (numTiles <= 1) {
            var tile = this.getMapTilePath(this.tileSet.toLowerCase(), this.lod, 0, 0);
            newTiles.push(this.createTile(tile));
        }
        else {
            for (var y = numTiles / 2; y > -numTiles / 2 - 1; y--) {
                if (y == 0) {
                    continue;
                }
                for (var x = -numTiles / 2; x < numTiles / 2 + 1; x++) {
                    if (x == 0) {
                        continue;
                    }
                    var tile = this.getMapTilePath(this.tileSet.toLowerCase(), this.lod, x, y);
                    newTiles.push(this.createTile(tile));
                }
            }
        }
        requestAnimationFrame(function () {
            _this.layer.style.setProperty("--MAP-TILES-PER-AXIS", numTiles.toString());
            _this.clear();
            newTiles.forEach(function (tile) { return _this.layer.appendChild(tile); });
        });
    };
    TileLayer.prototype.createTile = function (url) {
        var tile = document.createElement("div");
        tile.classList.add("layer-terrain__tile");
        var img = new Image();
        img.onload = function () {
            tile.style.backgroundImage = "url(" + url + ")";
            img = null;
        };
        img.src = url;
        return tile;
    };
    TileLayer.prototype.getNumTiles = function (lod) {
        if (lod < 0) {
            throw "lod must be greater than zero";
        }
        return Math.pow(2, (3 - lod));
    };
    TileLayer.prototype.getMapTilePath = function (tileName, lod, tileX, tileY) {
        return this.tileBaseUrl + (tileName + "/lod" + lod + "_" + tileX + "_" + tileY + ".jpg");
    };
    return TileLayer;
}(MapLayer));
var MapController = (function (_super) {
    __extends(MapController, _super);
    function MapController(map, mapContainer, viewport, initialContinentId) {
        var _this = _super.call(this, mapContainer, viewport, 1.0) || this;
        _this.layers = [];
        _this.map = map;
        _this.continentId = initialContinentId;
        var terrain = _this.createTileLayer("layer-terrain", initialContinentId, "http://127.0.0.1:5000/static/tile/");
        _this.layers.push(terrain);
        var hexes = _this.createHexLayer("layer-hexes", initialContinentId);
        _this.layers.push(hexes);
        var names = _this.createBaseNameLayer("layer-names", initialContinentId);
        _this.layers.push(names);
        _this.registerZoomCallback(terrain.onZoom.bind(terrain));
        _this.registerZoomCallback(names.onZoom.bind(names));
        hexes.layer.addEventListener("auxclick", function (evt) {
            if (!(evt.target instanceof SVGPolygonElement) || evt.button != 1) {
                return;
            }
            names.setBaseOwnership(parseInt(evt.target.id), cycleFactionColour(evt.target));
        });
        return _this;
    }
    MapController.prototype.switchContinent = function (continentId, force) {
        if (force === void 0) { force = false; }
        if (continentId == this.continentId && !force) {
            console.debug("Continent switch skipped; already on this map");
            return;
        }
        this.continentId = continentId;
        this.layers.forEach(function (layer) {
            layer.switchContinent(continentId, force);
        });
    };
    MapController.prototype.createTileLayer = function (layerId, initialContinentId, tileBaseUrl) {
        var div = document.createElement("div");
        div.id = layerId;
        div.classList.add("map__layer", "layer-terrain");
        this.map.appendChild(div);
        return new TileLayer(div, initialContinentId, tileBaseUrl);
    };
    MapController.prototype.createHexLayer = function (layerId, initialContinentId) {
        var div = document.createElement("div");
        div.id = layerId;
        div.classList.add("map__layer", "layer-hexes");
        this.map.appendChild(div);
        return new HexLayer(div, initialContinentId);
    };
    MapController.prototype.createBaseNameLayer = function (layerId, initialContinentId) {
        var div = document.createElement("div");
        div.id = layerId;
        div.classList.add("map__layer", "layer-names");
        this.map.appendChild(div);
        return new BaseNameLayer(div, initialContinentId);
    };
    return MapController;
}(Zoomable));
function onDOMLoaded() {
    var initialContinentId = 6;
    var map = document.getElementById("map");
    var viewport = document.getElementById("map-container");
    var mapContainer = (document.getElementById("map-background"));
    new MapController(map, mapContainer, viewport, initialContinentId);
}
window.addEventListener("DOMContentLoaded", onDOMLoaded);
