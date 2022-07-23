"use strict";
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
var Api;
(function (Api) {
    function getBasesFromContinent(id) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, fetch(Api.getBasesFromContinentUrl(id))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error(response.statusText);
                        return [4, response.json()];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    }
    Api.getBasesFromContinent = getBasesFromContinent;
    function getBaseOwnership(continent_id, server_id) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, fetch(Api.getBaseOwnershipUrl(continent_id, server_id))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error(response.statusText);
                        return [4, response.json()];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    }
    Api.getBaseOwnership = getBaseOwnership;
})(Api || (Api = {}));
var Api;
(function (Api) {
    Api.restEndpoint = "http://127.0.0.1:5000/";
    function getContinentListUrl() {
        return "".concat(Api.restEndpoint, "continent");
    }
    Api.getContinentListUrl = getContinentListUrl;
    function getServerListUrl() {
        return "".concat(Api.restEndpoint, "server");
    }
    Api.getServerListUrl = getServerListUrl;
    function getBasesFromContinentUrl(id) {
        return "".concat(Api.restEndpoint, "base?continent_id=").concat(id);
    }
    Api.getBasesFromContinentUrl = getBasesFromContinentUrl;
    function getMinimapImagePath(code) {
        return "".concat(Api.restEndpoint, "static/minimap/").concat(code, ".jpg");
    }
    Api.getMinimapImagePath = getMinimapImagePath;
    function getTerrainTilePath(code, pos, lod) {
        var filename = "".concat(code, "_tile_").concat(pos[0], "_").concat(pos[1], "_lod").concat(lod, ".jpeg");
        return "".concat(Api.restEndpoint, "static/tile/").concat(filename);
    }
    Api.getTerrainTilePath = getTerrainTilePath;
    function getContinentOutlinesPath(code) {
        return "".concat(Api.restEndpoint, "static/hex/").concat(code, "-minimal.svg");
    }
    Api.getContinentOutlinesPath = getContinentOutlinesPath;
    function getBaseOwnershipUrl(continent_id, server_id) {
        return "".concat(Api.restEndpoint, "base/status?continent_id=").concat(continent_id, "&server_id=").concat(server_id);
    }
    Api.getBaseOwnershipUrl = getBaseOwnershipUrl;
    function getLatticePath(continentId) {
        return "".concat(Api.restEndpoint, "lattice?continent_id=").concat(continentId);
    }
    Api.getLatticePath = getLatticePath;
})(Api || (Api = {}));
var Api;
(function (Api) {
    function getContinentList() {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, fetch(Api.getContinentListUrl())];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error(response.statusText);
                        return [4, response.json()];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    }
    Api.getContinentList = getContinentList;
    function getContinentOutlinesSvg(continent) {
        return __awaiter(this, void 0, void 0, function () {
            var response, payload, factory, svg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, fetch(Api.getContinentOutlinesPath(continent.code))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error(response.statusText);
                        return [4, response.text()];
                    case 2:
                        payload = _a.sent();
                        factory = document.createElement("template");
                        factory.innerHTML = payload;
                        svg = factory.content.firstElementChild;
                        if (!(svg instanceof SVGElement))
                            throw "Unable to load contents from map hex SVG";
                        return [2, svg];
                }
            });
        });
    }
    Api.getContinentOutlinesSvg = getContinentOutlinesSvg;
    function getLatticeForContinent(continent) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, fetch(Api.getLatticePath(continent.id))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error(response.statusText);
                        return [4, response.json()];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    }
    Api.getLatticeForContinent = getLatticeForContinent;
})(Api || (Api = {}));
var Events;
(function (Events) {
    function continentChangedFactory(continent) {
        return new CustomEvent("ps2map_continentchanged", {
            detail: {
                continent: continent
            },
            bubbles: true,
            cancelable: true
        });
    }
    Events.continentChangedFactory = continentChangedFactory;
    function baseOwnershipChangedFactory(baseId, factionId) {
        return new CustomEvent("ps2map_baseownershipchanged", {
            detail: {
                baseId: baseId,
                factionId: factionId
            },
            bubbles: true,
            cancelable: true
        });
    }
    Events.baseOwnershipChangedFactory = baseOwnershipChangedFactory;
})(Events || (Events = {}));
var Utils;
(function (Utils) {
    function clamp(value, min, max) {
        if (max <= min)
            return min;
        if (value < min)
            return min;
        if (value > max)
            return max;
        return value;
    }
    Utils.clamp = clamp;
    function rafDebounce(target) {
        var isScheduled = false;
        var handle = 0;
        function wrapper() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (isScheduled)
                cancelAnimationFrame(handle);
            handle = requestAnimationFrame(function () {
                target.apply(wrapper, args);
                isScheduled = false;
            });
            isScheduled = true;
        }
        return wrapper;
    }
    Utils.rafDebounce = rafDebounce;
    function rectanglesIntersect(a, b) {
        return (a.left < b.right
            && a.right > b.left
            && a.top > b.bottom
            && a.bottom < b.top);
    }
    Utils.rectanglesIntersect = rectanglesIntersect;
    function remap(value, sourceLower, sourceUpper, targetLower, targetUpper) {
        var sourceSpan = sourceUpper - sourceLower;
        var targetSpan = targetUpper - targetLower;
        if (sourceSpan == 0)
            return targetLower;
        var relValue = value - sourceLower / sourceSpan;
        return targetLower + relValue * targetSpan;
    }
    Utils.remap = remap;
    function roundTo(value, decimals) {
        var factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }
    Utils.roundTo = roundTo;
})(Utils || (Utils = {}));
var MapCamera = (function () {
    function MapCamera(mapSize, viewportHeight, viewportWidth) {
        this._maxZoom = 4.0;
        this._zoomStep = 1.5;
        this._currentZoomIndex = -1;
        this._viewportHeight = viewportHeight;
        this._viewportWidth = viewportWidth;
        var zoom = this._maxZoom;
        this._zoomLevels = [this._maxZoom];
        var stepInverse = 1 / this._zoomStep;
        while (mapSize * zoom > Math.min(viewportHeight, viewportWidth)) {
            zoom *= stepInverse;
            this._zoomLevels.push(Utils.roundTo(zoom, 2));
        }
        this._currentZoomIndex = this._zoomLevels.length - 1;
        this.target = {
            x: mapSize * 0.5,
            y: mapSize * 0.5
        };
    }
    MapCamera.prototype.bumpZoomLevel = function (direction) {
        var newIndex = this._currentZoomIndex;
        if (direction == 0)
            return newIndex;
        if (direction < 0)
            newIndex--;
        else if (direction > 0)
            newIndex++;
        if (newIndex < 0)
            newIndex = 0;
        else if (newIndex >= this._zoomLevels.length)
            newIndex = this._zoomLevels.length - 1;
        this._currentZoomIndex = newIndex;
        return this._zoomLevels[newIndex];
    };
    MapCamera.prototype.getViewBox = function () {
        var viewBoxHeight = this._viewportHeight / this.getZoom();
        var viewBoxWidth = this._viewportWidth / this.getZoom();
        return {
            top: this.target.y + viewBoxHeight * 0.5,
            right: this.target.x + viewBoxWidth * 0.5,
            bottom: this.target.y - viewBoxHeight * 0.5,
            left: this.target.x - viewBoxWidth * 0.5
        };
    };
    MapCamera.prototype.getZoom = function () {
        return this._zoomLevels[this._currentZoomIndex];
    };
    MapCamera.prototype.zoomTo = function (direction, viewX, viewY) {
        if (viewX === void 0) { viewX = 0.5; }
        if (viewY === void 0) { viewY = 0.5; }
        var oldZoom = this.getZoom();
        var newZoom = this.bumpZoomLevel(direction);
        var pixelDeltaX = (this._viewportWidth / oldZoom) - (this._viewportWidth / newZoom);
        var pixelDeltaY = (this._viewportHeight / oldZoom) - (this._viewportHeight / newZoom);
        var sideRatioX = Utils.remap(viewX, 0.0, 1.0, -0.5, 0.5);
        var sideRatioY = -Utils.remap(viewY, 0.0, 1.0, -0.5, 0.5);
        var targetX = this.target.x + pixelDeltaX * sideRatioX;
        var targetY = this.target.y + pixelDeltaY * sideRatioY;
        this.target = {
            x: targetX,
            y: targetY
        };
        return this.target;
    };
    return MapCamera;
}());
var MapLayer = (function () {
    function MapLayer(id, mapSize) {
        var _this = this;
        this.isVisible = true;
        this._lastRedraw = null;
        this._runDeferredLayerUpdate = Utils.rafDebounce(function () {
            if (_this._lastRedraw == null)
                return;
            var _a = _this._lastRedraw, viewBox = _a[0], zoom = _a[1];
            _this.deferredLayerUpdate(viewBox, zoom);
        });
        this.id = id;
        this.mapSize = mapSize;
        this.element = document.createElement("div");
        this.element.id = id;
        this.element.classList.add("ps2map__layer");
        this.element.style.height = this.element.style.width = "".concat(mapSize, "px");
        this.element.addEventListener("transitionend", this._runDeferredLayerUpdate.bind(this), { passive: true });
    }
    MapLayer.prototype.setRedrawArgs = function (viewBox, zoom) {
        this._lastRedraw = [viewBox, zoom];
    };
    MapLayer.prototype.setVisibility = function (visible) {
        if (this.isVisible == visible)
            return;
        if (visible)
            this.element.style.removeProperty("display");
        else
            this.element.style.display = "none";
        this.isVisible = visible;
    };
    MapLayer.prototype.updateLayer = function () {
        this.element.dispatchEvent(new Event("transitionend"));
    };
    MapLayer.prototype.deferredLayerUpdate = function (viewBox, zoom) { };
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
    function StaticLayer(id, mapSize) {
        return _super.call(this, id, mapSize) || this;
    }
    StaticLayer.prototype.redraw = function (viewBox, zoom) {
        var targetX = (viewBox.right + viewBox.left) * 0.5;
        var targetY = (viewBox.top + viewBox.bottom) * 0.5;
        var halfMapSize = this.mapSize * 0.5;
        var offsetX = -halfMapSize;
        var offsetY = -halfMapSize;
        offsetX += (halfMapSize - targetX) * zoom;
        offsetY -= (halfMapSize - targetY) * zoom;
        this.element.style.transform = ("matrix(".concat(zoom, ", 0.0, 0.0, ").concat(zoom, ", ").concat(offsetX, ", ").concat(offsetY, ")"));
    };
    return StaticLayer;
}(MapLayer));
var MapRenderer = (function () {
    function MapRenderer(viewport, mapSize) {
        var _this = this;
        this._mapSize = 1024;
        this._layers = [];
        this._isPanning = false;
        this._onZoom = Utils.rafDebounce(function (evt) {
            evt.preventDefault();
            if (_this._isPanning)
                return;
            var view = _this.viewport.getBoundingClientRect();
            var relX = Utils.clamp((evt.clientX - view.left) / view.width, 0.0, 1.0);
            var relY = Utils.clamp((evt.clientY - view.top) / view.height, 0.0, 1.0);
            _this._camera.zoomTo(evt.deltaY, relX, relY);
            _this._constrainMapTarget();
            _this._redraw(_this._camera.getViewBox(), _this._camera.getZoom());
        });
        this.viewport = viewport;
        this.viewport.classList.add("ps2map__viewport");
        this._anchor = document.createElement("div");
        this._anchor.classList.add("ps2map__anchor");
        this.viewport.appendChild(this._anchor);
        this.setMapSize(mapSize);
        this._camera = new MapCamera(mapSize, this.viewport.clientHeight, this.viewport.clientWidth);
        this._panOffsetX = this.viewport.clientWidth * 0.5;
        this._panOffsetY = this.viewport.clientHeight * 0.5;
        this._anchor.style.left = "".concat(this._panOffsetX, "px");
        this._anchor.style.top = "".concat(this._panOffsetY, "px");
        this.viewport.addEventListener("wheel", this._onZoom.bind(this), {
            passive: false
        });
        this.viewport.addEventListener("mousedown", this._mousePan.bind(this), {
            passive: true
        });
        setInterval(function () {
            _this.viewport.dispatchEvent(_this._buildViewBoxChangedEvent(_this._camera.getViewBox()));
        }, 0.01);
    }
    MapRenderer.prototype.getCamera = function () {
        return this._camera;
    };
    MapRenderer.prototype.getMapSize = function () {
        return this._mapSize;
    };
    MapRenderer.prototype.addLayer = function (layer) {
        if (layer.mapSize != this._mapSize)
            throw "Map layer size must match the map renderer's.";
        this._layers.push(layer);
        this._anchor.appendChild(layer.element);
        this._redraw(this._camera.getViewBox(), this._camera.getZoom());
    };
    MapRenderer.prototype.getLayer = function (id) {
        for (var _i = 0, _a = this._layers; _i < _a.length; _i++) {
            var layer = _a[_i];
            if (layer.id == id)
                return layer;
        }
        return undefined;
    };
    MapRenderer.prototype.clearLayers = function () {
        this._anchor.innerText = "";
        this._layers = [];
    };
    MapRenderer.prototype.forEachLayer = function (callback) {
        var i = this._layers.length;
        while (i-- > 0)
            callback(this._layers[i]);
    };
    MapRenderer.prototype.jumpTo = function (target) {
        this._camera.target = target;
        this._constrainMapTarget();
        this._redraw(this._camera.getViewBox(), this._camera.getZoom());
    };
    MapRenderer.prototype.setMapSize = function (value) {
        if (this._layers.length > 0)
            throw "Remove all map layers before changing map size.";
        this._mapSize = value;
        this._camera = new MapCamera(value, this.viewport.clientHeight, this.viewport.clientWidth);
    };
    MapRenderer.prototype._mousePan = function (evtDown) {
        var _this = this;
        if (evtDown.button == 2)
            return;
        this._setPanLock(true);
        var refX = this._camera.target.x;
        var refY = this._camera.target.y;
        var zoom = this._camera.getZoom();
        var startX = evtDown.clientX;
        var startY = evtDown.clientY;
        var drag = Utils.rafDebounce(function (evtDrag) {
            var deltaX = evtDrag.clientX - startX;
            var deltaY = evtDrag.clientY - startY;
            _this._camera.target = {
                x: refX - deltaX / zoom,
                y: refY + deltaY / zoom
            };
            _this._constrainMapTarget();
            _this._redraw(_this._camera.getViewBox(), zoom);
        });
        var up = function () {
            _this._setPanLock(false);
            _this.viewport.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", up);
        };
        document.addEventListener("mouseup", up);
        this.viewport.addEventListener("mousemove", drag, {
            passive: true
        });
    };
    MapRenderer.prototype._setPanLock = function (locked) {
        this._isPanning = locked;
        var i = this._layers.length;
        while (i-- > 0) {
            var element = this._layers[i].element;
            if (locked)
                element.style.transition = "transform 0ms ease-out";
            else
                element.style.removeProperty("transition");
        }
    };
    MapRenderer.prototype._redraw = function (viewBox, zoom) {
        var i = this._layers.length;
        while (i-- > 0) {
            var layer = this._layers[i];
            layer.redraw(viewBox, zoom);
            layer.setRedrawArgs(viewBox, zoom);
        }
        this._anchor.dispatchEvent(this._buildViewBoxChangedEvent(viewBox));
    };
    MapRenderer.prototype._constrainMapTarget = function () {
        var targetX = this._camera.target.x;
        var targetY = this._camera.target.y;
        if (targetX < 0)
            targetX = 0;
        if (targetX > this._mapSize)
            targetX = this._mapSize;
        if (targetY < 0)
            targetY = 0;
        if (targetY > this._mapSize)
            targetY = this._mapSize;
        this._camera.target = {
            x: targetX,
            y: targetY
        };
    };
    MapRenderer.prototype._buildViewBoxChangedEvent = function (viewBox) {
        return new CustomEvent("ps2map_viewboxchanged", {
            detail: {
                viewBox: viewBox
            },
            bubbles: true,
            cancelable: true
        });
    };
    return MapRenderer;
}());
var SupportsBaseOwnership = (function () {
    function SupportsBaseOwnership() {
    }
    return SupportsBaseOwnership;
}());
;
var BasePolygonsLayer = (function (_super) {
    __extends(BasePolygonsLayer, _super);
    function BasePolygonsLayer(id, mapSize) {
        var _this = _super.call(this, id, mapSize) || this;
        _this.element.classList.add("ps2map__base-hexes");
        return _this;
    }
    BasePolygonsLayer.factory = function (continent, id) {
        return __awaiter(this, void 0, void 0, function () {
            var layer;
            return __generator(this, function (_a) {
                layer = new BasePolygonsLayer(id, continent.map_size);
                return [2, Api.getContinentOutlinesSvg(continent)
                        .then(function (svg) {
                        svg.classList.add("ps2map__base-hexes__svg");
                        layer.element.appendChild(svg);
                        layer.applyPolygonHoverFix(svg);
                        return layer;
                    })];
            });
        });
    };
    BasePolygonsLayer.prototype.updateBaseOwnership = function (baseOwnershipMap) {
        var _this = this;
        var svg = this.element.firstElementChild;
        if (svg == null)
            throw "Unable to find HexLayer SVG element";
        var colours = {
            0: "rgba(0, 0, 0, 1.0)",
            1: "rgba(160, 77, 183, 1.0)",
            2: "rgba(81, 123, 204, 1.0)",
            3: "rgba(226, 25, 25, 1.0)",
            4: "rgba(255, 255, 255, 1.0)"
        };
        svg.querySelectorAll("polygon").forEach(function (polygon) {
            var baseId = _this._polygonIdToBaseId(polygon.id);
            var factionId = baseOwnershipMap.get(baseId);
            if (factionId != undefined)
                polygon.style.fill = colours[factionId.toFixed()];
        });
    };
    BasePolygonsLayer.prototype.applyPolygonHoverFix = function (svg) {
        var _this = this;
        svg.querySelectorAll("polygon").forEach(function (polygon) {
            polygon.id = _this._baseIdToPolygonId(polygon.id);
            var addHoverFx = function () {
                svg.appendChild(polygon);
                var removeHoverFx = function () { return polygon.style.removeProperty("stroke"); };
                polygon.addEventListener("mouseleave", removeHoverFx, {
                    passive: true
                });
                polygon.addEventListener("touchend", removeHoverFx, {
                    passive: true
                });
                polygon.addEventListener("touchcancel", removeHoverFx, {
                    passive: true
                });
                polygon.style.stroke = "#ffffff";
                _this.element.dispatchEvent(_this._buildBaseHoverEvent(_this._polygonIdToBaseId(polygon.id), polygon));
            };
            polygon.addEventListener("mouseenter", addHoverFx, {
                passive: true
            });
            polygon.addEventListener("touchstart", addHoverFx, {
                passive: true
            });
        });
    };
    BasePolygonsLayer.prototype.deferredLayerUpdate = function (viewBox, zoom) {
        var svg = this.element.firstElementChild;
        if (svg != null) {
            var strokeWith = 10 / Math.pow(1.5, zoom);
            svg.style.setProperty("--ps2map__base-hexes__stroke-width", "".concat(strokeWith, "px"));
        }
    };
    BasePolygonsLayer.prototype._buildBaseHoverEvent = function (baseId, element) {
        return new CustomEvent("ps2map_basehover", {
            detail: {
                baseId: baseId,
                element: element
            },
            bubbles: true,
            cancelable: true
        });
    };
    BasePolygonsLayer.prototype._polygonIdToBaseId = function (id) {
        return parseInt(id.substring(id.lastIndexOf("-") + 1));
    };
    BasePolygonsLayer.prototype._baseIdToPolygonId = function (baseId) {
        return "base-outline-".concat(baseId);
    };
    return BasePolygonsLayer;
}(StaticLayer));
var LatticeLayer = (function (_super) {
    __extends(LatticeLayer, _super);
    function LatticeLayer(id, mapSize) {
        var _this = _super.call(this, id, mapSize) || this;
        _this._latticeLinkCache = [];
        _this.element.classList.add("ps2map__lattice");
        return _this;
    }
    LatticeLayer.factory = function (continent, id) {
        return __awaiter(this, void 0, void 0, function () {
            var layer;
            return __generator(this, function (_a) {
                layer = new LatticeLayer(id, continent.map_size);
                layer.element.addEventListener("ps2map_baseownershipchanged", function (event) {
                    var evt = event;
                    var map = new Map();
                    map.set(evt.detail.baseId, evt.detail.factionId);
                    layer.updateBaseOwnership(map);
                });
                return [2, Api.getLatticeForContinent(continent)
                        .then(function (links) {
                        layer._latticeLinkCache = [];
                        var i = links.length;
                        while (i-- > 0)
                            layer._latticeLinkCache.push(links[i]);
                        layer._createLatticeSvg();
                        return layer;
                    })];
            });
        });
    };
    LatticeLayer.prototype.updateBaseOwnership = function (baseOwnershipMap) {
        var colours = {
            0: "rgba(0, 0, 0, 1.0)",
            1: "rgba(120, 37, 143, 1.0)",
            2: "rgba(41, 83, 164, 1.0)",
            3: "rgba(186, 25, 25, 1.0)",
            4: "rgba(50, 50, 50, 1.0)"
        };
        var i = this._latticeLinkCache.length;
        while (i-- > 0) {
            var link = this._latticeLinkCache[i];
            var ownerA = baseOwnershipMap.get(link.base_a_id);
            var ownerB = baseOwnershipMap.get(link.base_b_id);
            if (ownerA == undefined || ownerB == undefined)
                continue;
            var id = "#lattice-link-".concat(link.base_a_id, "-").concat(link.base_b_id);
            var element = this.element.querySelector(id);
            if (!element)
                continue;
            if (ownerA == ownerB)
                element.style.stroke = colours[ownerA];
            else if (ownerA == 0 || ownerB == 0)
                element.style.stroke = "rgba(0, 0, 0, 0.5)";
            else
                element.style.stroke = "orange";
        }
    };
    LatticeLayer.prototype._createLatticeSvg = function () {
        var _this = this;
        this.element.innerHTML = "";
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 ".concat(this.mapSize, " ").concat(this.mapSize));
        this._latticeLinkCache.forEach(function (link) {
            svg.appendChild(_this._createLatticeLink(link));
        });
        this.element.appendChild(svg);
    };
    LatticeLayer.prototype._createLatticeLink = function (link) {
        var path = document.createElementNS("http://www.w3.org/2000/svg", "line");
        path.setAttribute("id", "lattice-link-".concat(link.base_a_id, "-").concat(link.base_b_id));
        path.setAttribute("x1", (link.map_pos_a_x + this.mapSize * 0.5).toFixed());
        path.setAttribute("y1", (-link.map_pos_a_y + this.mapSize * 0.5).toFixed());
        path.setAttribute("x2", (link.map_pos_b_x + this.mapSize * 0.5).toFixed());
        path.setAttribute("y2", (-link.map_pos_b_y + this.mapSize * 0.5).toFixed());
        return path;
    };
    return LatticeLayer;
}(StaticLayer));
var BaseNameFeature = (function () {
    function BaseNameFeature(pos, id, text, element, minZoom) {
        if (minZoom === void 0) { minZoom = 0; }
        this.visible = true;
        this.forceVisible = false;
        this.element = element;
        this.id = id;
        this.text = text;
        this.pos = pos;
        this.minZoom = minZoom;
    }
    return BaseNameFeature;
}());
var BaseNamesLayer = (function (_super) {
    __extends(BaseNamesLayer, _super);
    function BaseNamesLayer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.features = [];
        return _this;
    }
    BaseNamesLayer.factory = function (continent, id) {
        return __awaiter(this, void 0, void 0, function () {
            var layer;
            return __generator(this, function (_a) {
                layer = new BaseNamesLayer(id, continent.map_size);
                return [2, Api.getBasesFromContinent(continent.id)
                        .then(function (bases) {
                        layer._loadBaseInfo(bases);
                        layer.updateLayer();
                        return layer;
                    })];
            });
        });
    };
    BaseNamesLayer.prototype.updateBaseOwnership = function (baseOwnershipMap) {
        var colours = {
            0: "rgba(0, 0, 0, 1.0)",
            1: "rgba(120, 37, 143, 1.0)",
            2: "rgba(41, 83, 164, 1.0)",
            3: "rgba(186, 25, 25, 1.0)",
            4: "rgba(50, 50, 50, 1.0)"
        };
        var i = this.features.length;
        while (i-- > 0) {
            var feat = this.features[i];
            var factionId = baseOwnershipMap.get(feat.id);
            if (factionId != undefined)
                feat.element.style.setProperty("--ps2map__base-color", colours[factionId]);
        }
    };
    BaseNamesLayer.prototype._loadBaseInfo = function (bases) {
        var features = [];
        var i = bases.length;
        while (i-- > 0) {
            var baseInfo = bases[i];
            if (baseInfo.type_code == "no-mans-land")
                continue;
            var pos = {
                x: baseInfo.map_pos[0],
                y: baseInfo.map_pos[1]
            };
            var element = document.createElement("div");
            var name_1 = baseInfo.name;
            if (baseInfo.type_code == "amp-station" ||
                baseInfo.type_code == "bio-lab" ||
                baseInfo.type_code == "interlink" ||
                baseInfo.type_code == "tech-plant" ||
                baseInfo.type_code == "trident")
                name_1 += " ".concat(baseInfo.type_name);
            element.innerText = "".concat(name_1);
            element.classList.add("ps2map__base-names__icon");
            element.style.left = "".concat(this.mapSize * 0.5 + pos.x, "px");
            element.style.bottom = "".concat(this.mapSize * 0.5 + pos.y, "px");
            element.classList.add("ps2map__base-names__icon__".concat(baseInfo.type_code));
            var minZoom = 0;
            if (baseInfo.type_code == "small-outpost")
                minZoom = 0.60;
            if (baseInfo.type_code == "large-outpost")
                minZoom = 0.45;
            features.push(new BaseNameFeature(pos, baseInfo.id, baseInfo.name, element, minZoom));
            this.element.appendChild(element);
        }
        this.features = features;
    };
    BaseNamesLayer.prototype.onBaseHover = function (baseId, element) {
        var feat = null;
        var i = this.features.length;
        while (i-- > 0)
            if (this.features[i].id == baseId)
                feat = this.features[i];
        if (feat == null)
            return;
        var leave = function () {
            if (feat == null)
                throw "feature was unset";
            element.removeEventListener("mouseleave", leave);
            feat.forceVisible = false;
            if (feat.visible)
                feat.element.innerText = feat.text;
            else
                feat.element.innerText = "";
        };
        element.addEventListener("mouseleave", leave);
        feat.forceVisible = true;
        feat.element.innerText = feat.text;
    };
    BaseNamesLayer.prototype.deferredLayerUpdate = function (viewBox, zoom) {
        var unzoom = 1 / zoom;
        var i = this.features.length;
        while (i-- > 0) {
            var feat = this.features[i];
            feat.element.style.transform = ("translate(-50%, calc(var(--ps2map__base-icon-size) * ".concat(unzoom, ")) ") +
                "scale(".concat(unzoom, ", ").concat(unzoom, ")"));
            if (!feat.forceVisible)
                if (zoom >= feat.minZoom)
                    feat.element.innerText = feat.text;
                else
                    feat.element.innerText = "";
            feat.visible = zoom >= feat.minZoom;
        }
    };
    return BaseNamesLayer;
}(StaticLayer));
var MapTile = (function () {
    function MapTile(box, element, gridPos) {
        this.visible = true;
        this.box = box;
        this.element = element;
        this.gridPos = gridPos;
    }
    return MapTile;
}());
var TileLayer = (function (_super) {
    __extends(TileLayer, _super);
    function TileLayer(id, mapSize, initialLod) {
        var _this = _super.call(this, id, mapSize) || this;
        _this.tiles = [];
        _this.lod = initialLod;
        return _this;
    }
    TileLayer.prototype.defineTiles = function (gridSize) {
        var newTiles = [];
        var tileSize = this.mapSize / gridSize;
        var baseSize = this.mapSize / gridSize;
        var y = gridSize;
        while (y-- > 0)
            for (var x = 0; x < gridSize; x++) {
                var pos = {
                    x: x,
                    y: y
                };
                var tile = this.createTile(pos, gridSize);
                tile.element.style.height = tile.element.style.width = ("".concat(tileSize.toFixed(), "px"));
                tile.element.style.left = "".concat(pos.x * baseSize, "px");
                tile.element.style.bottom = "".concat(pos.y * baseSize, "px");
                var url = this.generateTilePath(pos, this.lod);
                tile.element.style.backgroundImage = "url(".concat(url, ")");
                newTiles.push(tile);
            }
        this.tiles = newTiles;
    };
    TileLayer.prototype.tileIsVisible = function (tile, viewBox) {
        return Utils.rectanglesIntersect(tile.box, viewBox);
    };
    TileLayer.prototype.updateTileVisibility = function (viewBox) {
        var _this = this;
        var activeTiles = [];
        var i = this.tiles.length;
        while (i-- > 0) {
            var tile = this.tiles[i];
            if (this.tileIsVisible(tile, viewBox))
                activeTiles.push(tile.element);
        }
        requestAnimationFrame(function () {
            _this.element.innerHTML = "";
            i = activeTiles.length;
            while (i-- > 0)
                _this.element.append(activeTiles[i]);
        });
    };
    TileLayer.prototype.deferredLayerUpdate = function (viewBox, zoom) {
        this.updateTileVisibility(viewBox);
    };
    TileLayer.prototype.redraw = function (viewBox, zoom) {
        var targetX = (viewBox.right + viewBox.left) * 0.5;
        var targetY = (viewBox.top + viewBox.bottom) * 0.5;
        var halfMapSize = this.mapSize * 0.5;
        var offsetX = -halfMapSize;
        var offsetY = -halfMapSize;
        offsetX += (halfMapSize - targetX) * zoom;
        offsetY -= (halfMapSize - targetY) * zoom;
        this.element.style.transform = ("matrix(".concat(zoom, ", 0.0, 0.0, ").concat(zoom, ", ").concat(offsetX, ", ").concat(offsetY, ")"));
    };
    return TileLayer;
}(MapLayer));
var TerrainLayer = (function (_super) {
    __extends(TerrainLayer, _super);
    function TerrainLayer(id, mapSize) {
        var _this = _super.call(this, id, mapSize, 3) || this;
        _this._code = "";
        _this.element.classList.add("ps2map__terrain");
        return _this;
    }
    TerrainLayer.factory = function (continent, id) {
        return __awaiter(this, void 0, void 0, function () {
            var layer;
            return __generator(this, function (_a) {
                layer = new TerrainLayer(id, continent.map_size);
                layer._setContinent(continent.code);
                layer.updateLayer();
                return [2, layer];
            });
        });
    };
    TerrainLayer.prototype._setContinent = function (code) {
        if (this._code == code)
            return;
        this._code = code;
        this.element.style.backgroundImage = ("url(".concat(Api.getMinimapImagePath(code), ")"));
        var gridSize = this._mapTilesPerAxis(this.mapSize, this.lod);
        this.defineTiles(gridSize);
    };
    TerrainLayer.prototype._calculateLod = function (zoom) {
        var adjustedZoom = zoom * devicePixelRatio;
        if (adjustedZoom < 0.125)
            return 3;
        if (adjustedZoom < 0.25)
            return 2;
        if (adjustedZoom < 0.5)
            return 1;
        return 0;
    };
    TerrainLayer.prototype.createTile = function (pos, gridSize) {
        var mapStep = this.mapSize / gridSize;
        var box = {
            left: mapStep * pos.x,
            right: mapStep * (pos.x + 1),
            top: mapStep * (pos.y + 1),
            bottom: mapStep * pos.y
        };
        var element = document.createElement("div");
        element.classList.add("ps2map__terrain__tile");
        return new MapTile(box, element, pos);
    };
    TerrainLayer.prototype._formatTileCoordinate = function (value) {
        var negative = value < 0;
        var coord = Math.abs(value).toFixed();
        if (coord.length < 3)
            coord = ("00" + coord).slice(-3);
        if (negative)
            coord = "-" + coord.slice(1);
        return coord;
    };
    TerrainLayer.prototype.generateTilePath = function (pos, lod) {
        var _a = this._gridPosToTilePos(pos, lod), tileX = _a[0], tileY = _a[1];
        var tilePos = [
            this._formatTileCoordinate(tileX),
            this._formatTileCoordinate(tileY)
        ];
        return Api.getTerrainTilePath(this._code, tilePos, lod);
    };
    TerrainLayer.prototype._gridPosToTilePos = function (pos, lod) {
        var min = this._mapGridLimits(this.mapSize, lod)[0];
        var stepSize = this._mapStepSize(this.mapSize, lod);
        return [min + (stepSize * pos.x), min + (stepSize * pos.y)];
    };
    TerrainLayer.prototype._mapStepSize = function (mapSize, lod) {
        if (lod == 0)
            return 4;
        if (lod == 1 || mapSize <= 1024)
            return 8;
        if (lod == 2 || mapSize <= 2048)
            return 16;
        return 32;
    };
    TerrainLayer.prototype._mapTileCount = function (mapSize, lod) {
        return Math.ceil(Math.pow(4, (Math.floor(Math.log2(mapSize)) - 8 - lod)));
    };
    TerrainLayer.prototype._mapTilesPerAxis = function (mapSize, lod) {
        return Math.floor(Math.sqrt(this._mapTileCount(mapSize, lod)));
    };
    TerrainLayer.prototype._mapGridLimits = function (mapSize, lod) {
        var stepSize = this._mapStepSize(mapSize, lod);
        var tilesPerAxis = this._mapTilesPerAxis(mapSize, lod);
        var halfSize = stepSize * Math.floor(tilesPerAxis / 2);
        if (halfSize <= 0)
            return [-stepSize, -stepSize];
        return [-halfSize, halfSize - stepSize];
    };
    TerrainLayer.prototype.deferredLayerUpdate = function (viewBox, zoom) {
        var newLod = this._calculateLod(zoom);
        if (newLod != this.lod) {
            this.lod = newLod;
            this.defineTiles(this._mapTilesPerAxis(this.mapSize, newLod));
        }
        this.updateTileVisibility(viewBox);
    };
    return TerrainLayer;
}(TileLayer));
var HeroMap = (function () {
    function HeroMap(viewport) {
        this._continent = undefined;
        this._server = undefined;
        this._baseOwnershipMap = new Map();
        this._baseUpdateIntervalId = undefined;
        this.renderer = new MapRenderer(viewport, 0);
    }
    HeroMap.prototype.continent = function () { return this._continent; };
    HeroMap.prototype.server = function () { return this._server; };
    HeroMap.prototype.updateBaseOwnership = function (baseOwnershipMap) {
        var _a;
        function supportsBaseOwnership(object) {
            return "updateBaseOwnership" in object;
        }
        (_a = this.renderer) === null || _a === void 0 ? void 0 : _a.forEachLayer(function (layer) {
            if (supportsBaseOwnership(layer))
                layer.updateBaseOwnership(baseOwnershipMap);
        });
    };
    HeroMap.prototype.setBaseOwnership = function (baseId, factionId) {
        if (this._baseOwnershipMap.get(baseId) == factionId)
            return;
        this._baseOwnershipMap.set(baseId, factionId);
        this.renderer.viewport.dispatchEvent(Events.baseOwnershipChangedFactory(baseId, factionId));
    };
    HeroMap.prototype.switchContinent = function (continent) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var terrain, hexes, lattice, names;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (continent.code == ((_a = this._continent) === null || _a === void 0 ? void 0 : _a.code))
                            return [2];
                        terrain = TerrainLayer.factory(continent, "terrain");
                        hexes = BasePolygonsLayer.factory(continent, "hexes");
                        lattice = LatticeLayer.factory(continent, "lattice");
                        names = BaseNamesLayer.factory(continent, "names");
                        return [4, Promise.all([terrain, hexes, lattice, names]).then(function (layers) {
                                _this.renderer.clearLayers();
                                _this.renderer.setMapSize(continent.map_size);
                                _this.jumpTo({ x: continent.map_size / 2, y: continent.map_size / 2 });
                                layers.forEach(function (layer) {
                                    _this.renderer.addLayer(layer);
                                    layer.updateLayer();
                                });
                                var hexes_layer = _this.renderer.getLayer("hexes");
                                var names_layer = _this.renderer.getLayer("names");
                                hexes_layer.element.addEventListener("ps2map_basehover", function (event) {
                                    var evt = event;
                                    names_layer.onBaseHover(evt.detail.baseId, evt.detail.element);
                                });
                                _this._continent = continent;
                                _this._startMapStatePolling();
                                _this.renderer.viewport.dispatchEvent(Events.continentChangedFactory(continent));
                            })];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    HeroMap.prototype.switchServer = function (server) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                if (server.id == ((_a = this._server) === null || _a === void 0 ? void 0 : _a.id))
                    return [2];
                this._server = server;
                this._startMapStatePolling();
                return [2];
            });
        });
    };
    HeroMap.prototype._pollBaseOwnership = function () {
        var _this = this;
        var _a, _b;
        var server_id = (_a = this._server) === null || _a === void 0 ? void 0 : _a.id;
        var continentId = (_b = this._continent) === null || _b === void 0 ? void 0 : _b.id;
        if (server_id == undefined || continentId == undefined)
            return;
        Api.getBaseOwnership(continentId, server_id).then(function (data) {
            var baseOwnershipMap = new Map();
            var i = data.length;
            while (i-- > 0)
                baseOwnershipMap.set(data[i].base_id, data[i].owning_faction_id);
            _this.updateBaseOwnership(baseOwnershipMap);
            i = data.length;
            while (i-- > 0)
                _this.setBaseOwnership(data[i].base_id, data[i].owning_faction_id);
        });
    };
    HeroMap.prototype.jumpTo = function (point) {
        var _a;
        (_a = this.renderer) === null || _a === void 0 ? void 0 : _a.jumpTo(point);
    };
    HeroMap.prototype._startMapStatePolling = function () {
        var _this = this;
        this._baseOwnershipMap.clear();
        if (this._baseUpdateIntervalId != undefined)
            clearInterval(this._baseUpdateIntervalId);
        this._pollBaseOwnership();
        this._baseUpdateIntervalId = setInterval(function () {
            _this._pollBaseOwnership();
        }, 5000);
    };
    return HeroMap;
}());
var Minimap = (function () {
    function Minimap(element, continent) {
        if (continent === void 0) { continent = undefined; }
        this._mapSize = 0;
        this._baseOutlineSvg = undefined;
        this._minimapHexAlpha = 0.5;
        this._polygons = new Map();
        this.element = element;
        this.element.classList.add("ps2map__minimap");
        this._cssSize = this.element.clientWidth;
        this.element.style.height = "".concat(this._cssSize, "px");
        this._viewBoxElement = document.createElement("div");
        this._viewBoxElement.classList.add("ps2map__minimap__viewbox");
        this.element.appendChild(this._viewBoxElement);
        if (continent != undefined)
            this.setContinent(continent);
        this.element.addEventListener("mousedown", this._jumpToPosition.bind(this), {
            passive: true
        });
    }
    Minimap.prototype._jumpToPosition = function (evtDown) {
        var _this = this;
        if (this._mapSize == 0)
            return;
        var drag = Utils.rafDebounce(function (evtDrag) {
            var rect = _this.element.getBoundingClientRect();
            var relX = (evtDrag.clientX - rect.left) / (rect.width);
            var relY = (evtDrag.clientY - rect.top) / (rect.height);
            var target = {
                x: Math.round(relX * _this._mapSize),
                y: Math.round((1 - relY) * _this._mapSize)
            };
            _this.element.dispatchEvent(_this._buildMinimapJumpEvent(target));
        });
        var up = function () {
            _this.element.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", up);
        };
        document.addEventListener("mouseup", up);
        this.element.addEventListener("mousemove", drag, {
            passive: true
        });
        drag(evtDown);
    };
    Minimap.prototype.setViewBox = function (viewBox) {
        var mapSize = this._mapSize;
        var relViewBox = {
            top: (viewBox.top + mapSize * 0.5) / mapSize,
            left: (viewBox.left + mapSize * 0.5) / mapSize,
            bottom: (viewBox.bottom + mapSize * 0.5) / mapSize,
            right: (viewBox.right + mapSize * 0.5) / mapSize
        };
        var relHeight = relViewBox.top - relViewBox.bottom;
        var relWidth = relViewBox.right - relViewBox.left;
        var relLeft = relViewBox.left - 0.5;
        var relTop = relViewBox.bottom - 0.5;
        this._viewBoxElement.style.height = "".concat(this._cssSize * relHeight, "px");
        this._viewBoxElement.style.width = "".concat(this._cssSize * relWidth, "px");
        this._viewBoxElement.style.left = "".concat(this._cssSize * relLeft, "px");
        this._viewBoxElement.style.bottom = "".concat(this._cssSize * relTop, "px");
    };
    Minimap.prototype.setBaseOwnership = function (baseId, factionId) {
        var colours = {
            0: "rgba(0, 0, 0, ".concat(this._minimapHexAlpha, ")"),
            1: "rgba(160, 77, 183, ".concat(this._minimapHexAlpha, ")"),
            2: "rgba(81, 123, 204, ".concat(this._minimapHexAlpha, ")"),
            3: "rgba(226, 25, 25, ".concat(this._minimapHexAlpha, ")"),
            4: "rgba(255, 255, 255, ".concat(this._minimapHexAlpha, ")")
        };
        var polygon = this._polygons.get(baseId);
        if (polygon)
            polygon.style.fill = colours[factionId];
    };
    Minimap.prototype.setContinent = function (continent) {
        var _this = this;
        this._mapSize = continent.map_size;
        this.element.style.backgroundImage =
            "url(".concat(Api.getMinimapImagePath(continent.code), ")");
        Api.getContinentOutlinesSvg(continent)
            .then(function (svg) {
            if (_this._baseOutlineSvg != undefined)
                _this.element.removeChild(_this._baseOutlineSvg);
            _this._polygons = new Map();
            svg.classList.add("ps2map__minimap__hexes");
            _this._baseOutlineSvg = svg;
            _this.element.appendChild(_this._baseOutlineSvg);
            var polygons = svg.querySelectorAll("polygon");
            var i = polygons.length;
            while (i-- > 0) {
                _this._polygons.set(parseInt(polygons[i].id), polygons[i]);
                polygons[i].id = _this._polygonIdFromBaseId(polygons[i].id);
            }
        });
    };
    Minimap.prototype._buildMinimapJumpEvent = function (target) {
        return new CustomEvent("ps2map_minimapjump", {
            detail: {
                target: target
            },
            bubbles: true,
            cancelable: true
        });
    };
    Minimap.prototype._polygonIdFromBaseId = function (baseId) {
        return "minimap-baseId-".concat(baseId);
    };
    return Minimap;
}());
var Tool = (function () {
    function Tool(viewport, map) {
        this.map = map;
        this.viewport = viewport;
        this.tool_panel = document.getElementById("tool-panel");
    }
    Tool.prototype.activate = function () {
        dispatchEvent(new CustomEvent("tool-activated", {
            detail: {
                tool: this
            }
        }));
    };
    Tool.prototype.deactivate = function () {
        dispatchEvent(new CustomEvent("tool-deactivated", {
            detail: {
                tool: this
            }
        }));
        this.tool_panel.innerHTML = "";
    };
    Tool.getDisplayName = function () {
        return "None";
    };
    Tool.getId = function () {
        return "default";
    };
    Tool.prototype.getMapPosition = function (event) {
        var clickRelX = (event.clientX - this.viewport.offsetLeft) / this.viewport.clientWidth;
        var clickRelY = 1 - (event.clientY - this.viewport.offsetTop) / this.viewport.clientHeight;
        var renderer = this.map.renderer;
        var viewBox = renderer.getCamera().getViewBox();
        var xMap = -renderer.getMapSize() * 0.5 + viewBox.left + (viewBox.right - viewBox.left) * clickRelX;
        var yMap = -renderer.getMapSize() * 0.5 + viewBox.bottom + (viewBox.top - viewBox.bottom) * clickRelY;
        return [xMap, yMap];
    };
    return Tool;
}());
var BaseInfo = (function (_super) {
    __extends(BaseInfo, _super);
    function BaseInfo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._callback = undefined;
        _this._bases = new Map();
        return _this;
    }
    BaseInfo.prototype.activate = function () {
        var _this = this;
        _super.prototype.activate.call(this);
        this._callback = this._onHover.bind(this);
        var hex_layer = this.map.renderer.getLayer("hexes");
        hex_layer.element.addEventListener("ps2map_basehover", this._callback);
        this._bases = new Map();
        var continent = this.map.continent();
        if (continent == undefined)
            return;
        Api.getBasesFromContinent(continent.id).then(function (bases) {
            _this._bases = new Map(bases.map(function (base) { return [base.id, base]; }));
        });
        var parent = this.tool_panel;
        if (parent)
            parent.style.display = "block";
    };
    BaseInfo.prototype.deactivate = function () {
        _super.prototype.deactivate.call(this);
        if (this._callback) {
            var hex_layer = this.map.renderer.getLayer("hexes");
            hex_layer.element.removeEventListener("ps2map_basehover", this._callback);
        }
        var parent = this.tool_panel;
        if (parent)
            parent.removeAttribute("style");
    };
    BaseInfo.getDisplayName = function () {
        return "Base Info";
    };
    BaseInfo.getId = function () {
        return "base-info";
    };
    BaseInfo.prototype._onHover = function (event) {
        if (event.type !== "ps2map_basehover")
            return;
        var evt = event;
        var base = evt.detail.baseId;
        var base_info = this._bases.get(base);
        if (base_info == undefined)
            return;
        this.tool_panel.innerHTML = "";
        var name = document.createElement("span");
        name.classList.add("ps2map__tool__base-info__name");
        name.textContent = base_info.name;
        this.tool_panel.appendChild(name);
        var type_icon = document.createElement("img");
        type_icon.classList.add("ps2map__tool__base-info__type-icon");
        type_icon.src = "img/icons/".concat(base_info.type_code, ".svg");
        this.tool_panel.appendChild(type_icon);
        var type = document.createElement("span");
        type.classList.add("ps2map__tool__base-info__type");
        type.textContent = base_info.type_name;
        this.tool_panel.appendChild(type);
        if (base_info.resource_code != undefined) {
            this.tool_panel.appendChild(document.createElement("br"));
            var resource_icon = document.createElement("img");
            resource_icon.classList.add("ps2map__tool__base-info__resource-icon");
            resource_icon.src = "img/icons/".concat(base_info.resource_code, ".png");
            this.tool_panel.appendChild(resource_icon);
            var resource_text = document.createElement("span");
            resource_text.classList.add("ps2map__tool__base-info__resource-text");
            resource_text.textContent = "".concat(base_info.resource_capture_amount, " ").concat(base_info.resource_name, " (").concat(base_info.resource_control_amount.toFixed(1), "/min)");
            this.tool_panel.appendChild(resource_text);
        }
    };
    return BaseInfo;
}(Tool));
var Crosshair = (function (_super) {
    __extends(Crosshair, _super);
    function Crosshair() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._callback = undefined;
        return _this;
    }
    Crosshair.prototype.activate = function () {
        _super.prototype.activate.call(this);
        this.viewport.style.cursor = "crosshair";
        this._callback = this._onMove.bind(this);
        this.viewport.addEventListener("mousemove", this._callback, { passive: true });
        this._setupToolPanel();
    };
    Crosshair.prototype.deactivate = function () {
        _super.prototype.deactivate.call(this);
        if (this._callback)
            this.viewport.removeEventListener("click", this._callback);
        this.viewport.style.removeProperty("cursor");
        var parent = this.tool_panel;
        if (parent)
            parent.removeAttribute("style");
    };
    Crosshair.getDisplayName = function () {
        return "Crosshair";
    };
    Crosshair.getId = function () {
        return "crosshair";
    };
    Crosshair.prototype._setupToolPanel = function () {
        var parent = this.tool_panel;
        if (!parent)
            return;
        parent.style.display = "grid";
        parent.style.gridTemplateColumns = "1fr 1fr";
        parent.style.gridTemplateRows = "1fr 1fr";
        var x_label = document.createElement("span");
        x_label.classList.add("ps2map__tool__crosshair__label");
        x_label.textContent = "X";
        parent.appendChild(x_label);
        var x_value = document.createElement("span");
        x_value.id = "tool-crosshair_x";
        x_value.classList.add("ps2map__tool__crosshair__value");
        parent.appendChild(x_value);
        var y_label = document.createElement("span");
        y_label.classList.add("ps2map__tool__crosshair__label");
        y_label.textContent = "Y";
        parent.appendChild(y_label);
        var y_value = document.createElement("span");
        y_value.id = "tool-crosshair_y";
        y_value.classList.add("ps2map__tool__crosshair__value");
        parent.appendChild(y_value);
        this._updateToolPanel(0, 0);
    };
    Crosshair.prototype._updateToolPanel = function (x, y) {
        var x_value = document.getElementById("tool-crosshair_x");
        x_value.textContent = x.toFixed(2);
        var y_value = document.getElementById("tool-crosshair_y");
        y_value.textContent = y.toFixed(2);
    };
    Crosshair.prototype._onMove = function (event) {
        var _a = this.getMapPosition(event), x = _a[0], y = _a[1];
        this._updateToolPanel(x, y);
    };
    return Crosshair;
}(Tool));
var DevTools;
(function (DevTools) {
    var BaseMarkers = (function (_super) {
        __extends(BaseMarkers, _super);
        function BaseMarkers(viewport, map) {
            var _this = _super.call(this, viewport, map) || this;
            _this._placedBases = [];
            _this._callback = undefined;
            var btn = document.getElementById("export-bases");
            if (btn)
                btn.addEventListener("click", function () { return _this["export"](); });
            return _this;
        }
        BaseMarkers.prototype.activate = function () {
            _super.prototype.activate.call(this);
            this.viewport.style.cursor = "crosshair";
            this._callback = this._onClick.bind(this);
            this.viewport.addEventListener("click", this._callback, { passive: true });
        };
        BaseMarkers.prototype.deactivate = function () {
            _super.prototype.deactivate.call(this);
            if (this._callback)
                this.viewport.removeEventListener("click", this._callback);
            this.viewport.style.removeProperty("cursor");
        };
        BaseMarkers.prototype.clear = function () {
            this._placedBases = [];
        };
        BaseMarkers.prototype["export"] = function () {
            var data = JSON.stringify(this._placedBases);
            var blob = new Blob([data], { type: "application/json" });
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = "bases.json";
            a.click();
        };
        BaseMarkers.prototype._onClick = function (event) {
            if (event.button !== 0)
                return;
            var pos = this.getMapPosition(event);
            var baseIdStr = prompt("Base ID (aka. map_region_id)");
            if (baseIdStr == null)
                return;
            var baseId = parseInt(baseIdStr);
            if (isNaN(baseId))
                return;
            var baseName = prompt("Base name");
            if (baseName == null)
                return;
            var typeIdStr = prompt("Base type ID\n\n" +
                "1: No Man's Land\n" +
                "2: Amp Station\n" +
                "3: Bio Lab\n" +
                "4: Tech Plant\n" +
                "5: Large Outpost\n" +
                "6: Small Outpost\n" +
                "7: Warpgate\n" +
                "8: Interlink\n" +
                "9: Construction Outpost\n" +
                "11: Containment Site\n" +
                "12: Trident", "6");
            if (typeIdStr == null)
                return;
            var typeId = parseInt(typeIdStr);
            if (isNaN(typeId))
                return;
            this._placedBases.push({
                id: baseId,
                name: baseName,
                map_pos: [
                    Math.round(pos[0] * 100) / 100,
                    Math.round(pos[1] * 100) / 100
                ],
                type_id: typeId
            });
        };
        BaseMarkers.getDisplayName = function () {
            return "[Dev] Place Base Markers";
        };
        BaseMarkers.getId = function () {
            return "base-markers";
        };
        return BaseMarkers;
    }(Tool));
    DevTools.BaseMarkers = BaseMarkers;
})(DevTools || (DevTools = {}));
var currentTool = undefined;
var heroMap = undefined;
var available_tools = [Tool, BaseInfo, Crosshair, DevTools.BaseMarkers];
function setupToolbox(map) {
    heroMap = map;
}
function setTool(tool) {
    if (tool === void 0) { tool = undefined; }
    currentTool === null || currentTool === void 0 ? void 0 : currentTool.deactivate();
    if (tool == undefined || currentTool instanceof tool)
        tool = Tool;
    var newTool = new tool(document.getElementById("hero-map"), heroMap);
    newTool.activate();
    currentTool = newTool;
    document.querySelectorAll(".toolbar__button").forEach(function (btn) {
        if (btn.id == "tool-".concat(tool === null || tool === void 0 ? void 0 : tool.getId()))
            btn.classList.add("toolbar__button__active");
        else
            btn.classList.remove("toolbar__button__active");
    });
}
function resetTool() {
    setTool();
}
document.addEventListener("DOMContentLoaded", function () {
    var toolbar_container = document.getElementById("toolbar-container");
    toolbar_container.innerHTML = "";
    available_tools.forEach(function (tool) {
        var btn = document.createElement("input");
        btn.type = "button";
        btn.value = tool.getDisplayName();
        btn.classList.add("toolbar__button");
        btn.id = "tool-".concat(tool.getId());
        btn.addEventListener("click", function () {
            setTool(tool);
        });
        toolbar_container.appendChild(btn);
    });
    document.addEventListener("keydown", function (event) {
        if (event.key == "Escape")
            resetTool();
    });
});
document.addEventListener("DOMContentLoaded", function () {
    var heroMap = new HeroMap(document.getElementById("hero-map"));
    var minimap = new Minimap(document.getElementById("minimap"));
    setupToolbox(heroMap);
    document.addEventListener("ps2map_baseownershipchanged", function (event) {
        var evt = event.detail;
        minimap.setBaseOwnership(evt.baseId, evt.factionId);
    }, { passive: true });
    document.addEventListener("ps2map_continentchanged", function (event) {
        var evt = event.detail;
        minimap.setContinent(evt.continent);
    }, { passive: true });
    document.addEventListener("ps2map_viewboxchanged", function (event) {
        var evt = event.detail;
        minimap.setViewBox(evt.viewBox);
    }, { passive: true });
    document.addEventListener("ps2map_minimapjump", function (event) {
        var evt = event.detail;
        heroMap.jumpTo(evt.target);
    }, { passive: true });
    var server_picker = document.getElementById("server-picker");
    server_picker.addEventListener("change", function () {
        var server = JSON.parse(server_picker.value);
        heroMap.switchServer(server);
    });
    Api.getServerList().then(function (servers) {
        servers.sort(function (a, b) { return b.name.localeCompare(a.name); });
        var i = servers.length;
        while (i-- > 0) {
            var server = servers[i];
            var option = document.createElement("option");
            option.value = JSON.stringify(server);
            option.text = server.name;
            server_picker.appendChild(option);
        }
        heroMap.switchServer(JSON.parse(server_picker.value));
    });
    var continent_picker = document.getElementById("continent-picker");
    continent_picker.addEventListener("change", function () {
        var cont = JSON.parse(continent_picker.value);
        heroMap.switchContinent(cont);
    });
    Api.getContinentList().then(function (continents) {
        continents.sort(function (a, b) { return b.name.localeCompare(a.name); });
        var i = continents.length;
        while (i-- > 0) {
            var cont = continents[i];
            var option = document.createElement("option");
            option.value = JSON.stringify(cont);
            option.text = cont.name;
            continent_picker.appendChild(option);
        }
        heroMap.switchContinent(JSON.parse(continent_picker.value));
    });
});
var Api;
(function (Api) {
    function getServerList() {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, fetch(Api.getServerListUrl())];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error(response.statusText);
                        return [4, response.json()];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    }
    Api.getServerList = getServerList;
})(Api || (Api = {}));
