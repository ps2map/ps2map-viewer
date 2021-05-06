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
    if (!base.style.fill) {
        base.style.fill = ownershipColorsCSS[0];
    }
    for (var i = 0; i < ownershipColorsCSS.length; i++) {
        if (base.style.fill == ownershipColorsCSS[i]) {
            if (i + 1 < ownershipColorsCSS.length) {
                base.style.fill = ownershipColorsCSS[i + 1];
                return i + 1;
            }
            else {
                base.style.fill = ownershipColorsCSS[0];
                return 0;
            }
        }
    }
    return 0;
}
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
function elementFromString(html) {
    var factory = document.createElement("template");
    factory.innerHTML = html.trim();
    var child = factory.content.firstChild;
    if (child == null) {
        throw "given string did not result in a valid DOM object";
    }
    return child;
}
var MapLayer = (function () {
    function MapLayer(layer, initialContinentId) {
        this.continentId = 0;
        this.layer = layer;
        this.setContinent(initialContinentId);
    }
    MapLayer.prototype.setContinent = function (continentId) {
        if (this.continentId != continentId) {
            return;
        }
        this.continentId = continentId;
    };
    MapLayer.prototype.setVisibility = function (visible) {
        this.layer.style.display = visible ? "grid" : "none";
    };
    MapLayer.prototype.onZoom = function (zoomLevel) { };
    MapLayer.prototype.clear = function () {
        var numChildren = this.layer.children.length;
        for (var i = numChildren - 1; i >= 0; i--) {
            var child = this.layer.children[i];
            this.layer.removeChild(child);
        }
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
    function BaseNameLayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseNameLayer.prototype.onZoom = function (zoomLevel) {
        for (var i = 0; i < this.layer.children.length; i++) {
            var base = this.layer.children.item(i);
            base.style.transform = "scale(" + 1 / zoomLevel + ")";
        }
    };
    BaseNameLayer.prototype.setContinent = function (continentId) {
        var _this = this;
        getBasesFromContinent(continentId).then(function (bases) {
            var elements = [];
            bases.forEach(function (base) {
                var anchor = document.createElement("div");
                var posX = (4096 + base.map_pos[0]) / 81.92;
                var posY = (4096 + base.map_pos[1]) / 81.92;
                anchor.setAttribute("class", "mapAnchor");
                anchor.setAttribute("baseId", base.id.toString());
                anchor.style.left = posX + "%";
                anchor.style.bottom = posY + "%";
                var iconBox = document.createElement("div");
                anchor.appendChild(iconBox);
                iconBox.setAttribute("class", "iconBox");
                var layerImage = document.createElement("div");
                iconBox.appendChild(layerImage);
                layerImage.setAttribute("class", "layeredIcon");
                var icon = document.createElement("img");
                layerImage.appendChild(icon);
                icon.setAttribute("alt", "Amp Station");
                icon.setAttribute("src", _this.getBaseIconFromType(base.type_id));
                var label = document.createElement("p");
                anchor.appendChild(label);
                label.setAttribute("class", "baseLabel");
                label.innerHTML = base.name;
                var labelShadow = document.createElement("p");
                anchor.appendChild(labelShadow);
                labelShadow.setAttribute("class", "baseLabelShadow");
                labelShadow.innerHTML = base.name;
                elements.push(anchor);
            });
            _this.clear();
            elements.forEach(function (element) { return _this.layer.appendChild(element); });
        });
    };
    BaseNameLayer.prototype.setBaseOwnership = function (baseId, factionId) {
        var newColour = this.getFactionColour(factionId);
        for (var i = 0; i < this.layer.children.length; i++) {
            var base = this.layer.children.item(i);
            var attrId = base.getAttribute("baseId");
            if (attrId == null) {
                continue;
            }
            if ((baseId instanceof Array && parseInt(attrId) in baseId) ||
                parseInt(attrId) == baseId) {
                this.setBaseIconColour(base, newColour);
                if (baseId instanceof Number) {
                    break;
                }
            }
        }
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
        var icon = base.children[0];
        icon.style.setProperty("--baseIconColour", newColour);
    };
    return BaseNameLayer;
}(MapLayer));
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
var HexLayer = (function (_super) {
    __extends(HexLayer, _super);
    function HexLayer(layer, initialContinentId) {
        var _this = _super.call(this, layer, initialContinentId) || this;
        _this.baseHoverCallback = function () { return null; };
        return _this;
    }
    HexLayer.prototype.setContinent = function (continentId) {
        var _this = this;
        if (this.continentId == continentId) {
            return;
        }
        this.continentId = continentId;
        var outlines = this.getBaseHexes(continentId);
        outlines.then(function (elements) {
            _this.clear();
            elements.forEach(function (child) { return _this.layer.appendChild(child); });
        });
    };
    HexLayer.prototype.getBaseHexes = function (continentId) {
        return __awaiter(this, void 0, void 0, function () {
            var cont, elements;
            var _this = this;
            return __generator(this, function (_a) {
                cont = getContinent(continentId);
                elements = cont.then(function (contInfo) {
                    var svgs = [];
                    for (var key in contInfo.map_base_svgs) {
                        var element = elementFromString(contInfo.map_base_svgs[key]);
                        _this.registerHoverCallback(element);
                        svgs.push(element);
                    }
                    return svgs;
                });
                return [2, elements];
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
var mapBaseRes = 8192;
var TileLayer = (function (_super) {
    __extends(TileLayer, _super);
    function TileLayer(layer, initialContinentId, tileBaseUrl) {
        var _this = _super.call(this, layer, initialContinentId) || this;
        _this.lod = _this.getLod(1.0);
        _this.tileSet = "bogus";
        _this.tileBaseUrl = tileBaseUrl;
        return _this;
    }
    TileLayer.prototype.setContinent = function (continentId) {
        if (this.continentId == continentId) {
            return;
        }
        this.continentId = continentId;
        this.setTileSet(continentId);
    };
    TileLayer.prototype.onZoom = function (zoomLevel) {
        var lod = this.getLod(zoomLevel);
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
                    _this.tileSet = contInfo.map_tileset;
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
        tile.classList.add("terrainTile");
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
function onDOMLoaded() {
    var initialContinentId = 6;
    var hexLayerDiv = document.getElementById("baseOutlines");
    var hexLayer = new HexLayer(hexLayerDiv, initialContinentId);
    var tileLayerDiv = document.getElementById("terrain");
    var tileUrl = "http://127.0.0.1:5000/static/map/";
    var tileLayer = new TileLayer(tileLayerDiv, initialContinentId, tileUrl);
    var baseNameLayerDiv = (document.getElementById("baseNames"));
    var baseNameLayer = new BaseNameLayer(baseNameLayerDiv, initialContinentId);
    var map = document.getElementById("map");
    var viewport = document.getElementById("viewport");
    var mapContainer = (document.getElementById("mapContainer"));
    var controller = new MapController(map, mapContainer, viewport, initialContinentId);
    controller.registerZoomCallback(tileLayer.onZoom.bind(tileLayer));
    controller.registerZoomCallback(baseNameLayer.onZoom.bind(baseNameLayer));
    hexLayer.layer.addEventListener("auxclick", function (evt) {
        if (!(evt.target instanceof SVGElement)) {
            return;
        }
        if (evt.button != 1) {
            return;
        }
        var newColour = cycleFactionColour(evt.target);
        var svgElement = evt.target.parentElement;
        if (svgElement != null) {
            baseNameLayer.setBaseOwnership(parseInt(svgElement.id), newColour);
        }
    });
}
window.addEventListener("DOMContentLoaded", onDOMLoaded);
var Zoomable = (function () {
    function Zoomable(content, container, initialZoom, minZoom, maxZoom) {
        if (initialZoom === void 0) { initialZoom = 1.0; }
        if (minZoom === void 0) { minZoom = 1.0; }
        if (maxZoom === void 0) { maxZoom = 10.0; }
        this.onZoom = [];
        this.animFrameScheduled = false;
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
        if (this.animFrameScheduled) {
            return;
        }
        this.animFrameScheduled = true;
        requestAnimationFrame(function () {
            _this.applyZoomLevel(zoomLevel);
            _this.animFrameScheduled = false;
        });
    };
    Zoomable.prototype.mousePan = function (evtDown) {
        if (evtDown.button != 0) {
            return;
        }
        var container = this.container;
        var element = this.target;
        var initialScrollLeft = container.scrollLeft;
        var initialScrollTop = container.scrollTop;
        var nextScrollTargetLeft = 0.0;
        var nextScrollTargetTop = 0.0;
        var animFrameScheduled = false;
        function mouseDrag(evtDrag) {
            var deltaX = evtDrag.clientX - evtDown.clientX;
            var deltaY = evtDrag.clientY - evtDown.clientY;
            nextScrollTargetLeft = initialScrollLeft - deltaX;
            nextScrollTargetTop = initialScrollTop - deltaY;
            if (animFrameScheduled) {
                return;
            }
            animFrameScheduled = true;
            requestAnimationFrame(function () {
                container.scrollLeft = nextScrollTargetLeft;
                container.scrollTop = nextScrollTargetTop;
                animFrameScheduled = false;
            });
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
        var deltaY = evt.deltaY;
        if (evt.deltaMode == 0) {
            deltaY /= 80;
        }
        var relX = evt.clientX / this.container.clientWidth;
        var relY = evt.clientY / this.container.clientHeight;
        if (this.animFrameScheduled) {
            return;
        }
        this.animFrameScheduled = true;
        requestAnimationFrame(function () {
            _this.applyZoomLevel(_this.zoom - deltaY * 0.25, relX, relY);
            _this.animFrameScheduled = false;
        });
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
            if (evt.touches.length != 2) {
                return;
            }
            var touchCenter = con.getTouchesCenter(evt.touches);
            var touchDist = con.getTouchesDistance(evt.touches);
            var distRel = touchDist / touchStartDist;
            if (con.animFrameScheduled) {
                return;
            }
            var relX = touchCenter[0] / con.container.clientWidth;
            var relY = touchCenter[1] / con.container.clientHeight;
            con.animFrameScheduled = true;
            requestAnimationFrame(function () {
                con.applyZoomLevel(zoomStart * distRel, relX, relY);
                con.animFrameScheduled = false;
            });
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
var MapController = (function (_super) {
    __extends(MapController, _super);
    function MapController(map, mapContainer, viewport, initialContinentId) {
        var _this = _super.call(this, mapContainer, viewport, 1.0) || this;
        _this.map = map;
        _this.continentId = initialContinentId;
        return _this;
    }
    return MapController;
}(Zoomable));
