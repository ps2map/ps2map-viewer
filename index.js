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
var GameData = (function () {
    function GameData() {
        this._continents = [];
        this._servers = [];
        this._bases = [];
    }
    GameData.prototype.continents = function () { return this._continents; };
    GameData.prototype.servers = function () { return this._servers; };
    GameData.prototype.getBase = function (id) {
        return this._bases.find(function (b) { return b.id === id; });
    };
    GameData.prototype.getFaction = function (id) {
        switch (id) {
            case 0: return { code: "ns" };
            case 1: return { code: "vs" };
            case 2: return { code: "nc" };
            case 3: return { code: "tr" };
            default: throw new Error("Invalid faction ID ".concat(id));
        }
    };
    GameData.prototype.setActiveContinent = function (continent) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this._bases = [];
                if (continent)
                    return [2, fetchBasesForContinent(continent.id)
                            .then(function (bases) {
                            _this._bases = bases;
                        })];
                else
                    return [2, Promise.resolve()];
                return [2];
            });
        });
    };
    GameData.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this._loaded)
                    return [2, this._instance];
                if (this._loading)
                    return [2, this._loading];
                this._loading = this._loadInternal();
                return [2, this._loading];
            });
        });
    };
    GameData.getInstance = function () {
        if (!this._loaded)
            throw new Error("Game data not loaded");
        return this._instance;
    };
    GameData._loadInternal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, Promise.all([fetchContinents(), fetchServers()])
                        .then(function (_a) {
                        var continents = _a[0], servers = _a[1];
                        var instance = new GameData();
                        instance._continents = continents;
                        instance._servers = servers;
                        _this._instance = instance;
                        _this._loaded = true;
                        return instance;
                    })];
            });
        });
    };
    GameData._loaded = false;
    return GameData;
}());
var Camera = (function () {
    function Camera(mapSize, viewportSize, stepSize, maxZoom) {
        if (stepSize === void 0) { stepSize = undefined; }
        if (maxZoom === void 0) { maxZoom = undefined; }
        this._maxZoom = 4.0;
        this._stepSize = 1.5;
        this._zoomLevels = [];
        this._zoomIndex = -1;
        this._viewportSize = viewportSize;
        if (stepSize !== undefined)
            this._stepSize = stepSize;
        if (maxZoom !== undefined)
            this._maxZoom = maxZoom;
        this._zoomLevels = this._calculateZoomLevels(mapSize);
        this._zoomIndex = this._zoomLevels.length - 1;
        var factor = 0.5;
        this.target = {
            x: mapSize.width * factor,
            y: mapSize.height * factor
        };
    }
    Camera.prototype.viewBox = function () {
        var zoom = this.zoom();
        var half = 0.5;
        var halfViewboxHeight = this._viewportSize.height * half / zoom;
        var halfViewboxWidth = this._viewportSize.width * half / zoom;
        return {
            top: this.target.y + halfViewboxHeight,
            right: this.target.x + halfViewboxWidth,
            bottom: this.target.y - halfViewboxHeight,
            left: this.target.x - halfViewboxWidth
        };
    };
    Camera.prototype.zoom = function () {
        var zoom = this._zoomLevels[this._zoomIndex];
        if (zoom === undefined)
            throw new Error("Invalid zoom level");
        return zoom;
    };
    Camera.prototype.bumpZoom = function (value) {
        var index = this._zoomIndex;
        if (value < 0)
            index--;
        else if (value > 0)
            index++;
        if (index < 0)
            index = 0;
        else if (index >= this._zoomLevels.length)
            index = this._zoomLevels.length - 1;
        this._zoomIndex = index;
        var zoom = this._zoomLevels[index];
        if (zoom === undefined)
            throw new Error("Invalid zoom level");
        return zoom;
    };
    Camera.prototype.resetZoom = function (max) {
        if (max === void 0) { max = false; }
        this._zoomIndex = max ? 0 : this._zoomLevels.length - 1;
    };
    Camera.prototype.updateViewportSize = function (mapSize, viewportSize) {
        this._viewportSize = viewportSize;
        var zoomIndex = this._zoomIndex;
        this._zoomLevels = this._calculateZoomLevels(mapSize);
        this._zoomIndex = zoomIndex;
    };
    Camera.prototype.jumpTo = function (point) {
        this.target = point;
    };
    Camera.prototype.zoomTowards = function (value, viewportRelPos) {
        var oldZoom = this.zoom();
        var zoom = this.bumpZoom(value);
        var deltaX = (this._viewportSize.width / oldZoom)
            - (this._viewportSize.width / zoom);
        var deltaY = (this._viewportSize.height / oldZoom)
            - (this._viewportSize.height / zoom);
        var half = 0.5;
        var ratioX = -half + viewportRelPos.x;
        var ratioY = half - viewportRelPos.y;
        this.target = {
            x: Math.round(this.target.x + deltaX * ratioX),
            y: Math.round(this.target.y + deltaY * ratioY)
        };
        return this.target;
    };
    Camera.prototype._calculateZoomLevels = function (mapDimensions) {
        var minViewport = Math.min(this._viewportSize.width, this._viewportSize.height);
        var maxMap = Math.max(mapDimensions.width, mapDimensions.height);
        var zoomLevels = [this._maxZoom];
        if (minViewport === 0)
            return zoomLevels;
        var base = 10;
        var numDecimals = 2;
        var round = function (value) {
            var scale = Math.pow(base, numDecimals);
            return Math.round((value + Number.EPSILON) * scale) / scale;
        };
        var factor = 1 / this._stepSize;
        var zoom = this._maxZoom;
        while (maxMap * zoom > minViewport) {
            zoom *= factor;
            zoomLevels.push(round(zoom));
        }
        return zoomLevels;
    };
    return Camera;
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
var MapLayer = (function () {
    function MapLayer(id, size) {
        var _this = this;
        this.isVisible = true;
        this._lastRedraw = null;
        this._runDeferredLayerUpdate = rafDebounce(function () {
            if (!_this._lastRedraw)
                return;
            var _a = _this._lastRedraw, viewBox = _a[0], zoom = _a[1];
            _this.deferredLayerUpdate(viewBox, zoom);
        });
        this.id = id;
        this.size = size;
        this.element = document.createElement("div");
        this.element.id = id;
        this.element.classList.add("ps2map__layer");
        this.element.style.height = "".concat(size.height, "px");
        this.element.style.width = "".concat(size.width, "px");
        this.element.addEventListener("transitionend", this._runDeferredLayerUpdate.bind(this), { passive: true });
    }
    MapLayer.prototype.setRedrawArgs = function (viewBox, zoom) {
        this._lastRedraw = [viewBox, zoom];
    };
    MapLayer.prototype.setVisibility = function (visible) {
        if (this.isVisible === visible)
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
    return MapLayer;
}());
var StaticLayer = (function (_super) {
    __extends(StaticLayer, _super);
    function StaticLayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StaticLayer.prototype.deferredLayerUpdate = function (_, __) {
    };
    StaticLayer.prototype.redraw = function (viewBox, zoom) {
        var targetX = (viewBox.right + viewBox.left) * 0.5;
        var targetY = (viewBox.top + viewBox.bottom) * 0.5;
        var halfSizeX = this.size.width * 0.5;
        var halfSizeY = this.size.height * 0.5;
        var offsetX = -halfSizeX;
        var offsetY = -halfSizeY;
        offsetX += (halfSizeX - targetX) * zoom;
        offsetY -= (halfSizeY - targetY) * zoom;
        this.element.style.transform = ("matrix(".concat(zoom, ", 0.0, 0.0, ").concat(zoom, ", ").concat(offsetX, ", ").concat(offsetY, ")"));
    };
    return StaticLayer;
}(MapLayer));
var LayerManager = (function () {
    function LayerManager(viewport, mapSize) {
        this._layers = [];
        this.mapSize = mapSize;
        var anchor = document.createElement("div");
        anchor.style.position = "absolute";
        anchor.style.left = "50%";
        anchor.style.top = "50%";
        anchor.style.transform = "translate(-50%, -50%)";
        viewport.appendChild(anchor);
        this.anchor = anchor;
    }
    LayerManager.prototype.addLayer = function (layer) {
        if (layer.size.width !== this.mapSize.width &&
            layer.size.height !== this.mapSize.height)
            throw new Error("Size of added layer \"".concat(layer.id, "\" does not ") +
                "match current map size.");
        if (this._layers.some(function (l) { return l.id === layer.id; }))
            throw new Error("A layer with the id \"".concat(layer.id, "\" already exists."));
        this._layers.push(layer);
        this.anchor.appendChild(layer.element);
    };
    LayerManager.prototype.allLayers = function () {
        return this._layers;
    };
    LayerManager.prototype.clear = function () {
        this.anchor.innerHTML = "";
        this._layers = [];
    };
    LayerManager.prototype.forEachLayer = function (callback) {
        this._layers.forEach(callback);
    };
    LayerManager.prototype.getLayer = function (id) {
        var layer = this._layers.find(function (l) { return l.id === id; });
        if (layer instanceof MapLayer)
            return layer;
        return null;
    };
    LayerManager.prototype.isEmpty = function () {
        return this._layers.length === 0;
    };
    LayerManager.prototype.removeLayer = function (id) {
        var layer = this.getLayer(id);
        if (layer) {
            this._layers = this._layers.filter(function (l) { return l !== layer; });
            this.anchor.removeChild(layer.element);
        }
    };
    LayerManager.prototype.updateAll = function () {
        this._layers.forEach(function (layer) { return layer.updateLayer(); });
    };
    return LayerManager;
}());
var MapEngine = (function () {
    function MapEngine(viewport) {
        var _this = this;
        this._mapSize = { width: 0, height: 0 };
        this.allowPan = true;
        this._isPanning = false;
        this._onZoom = rafDebounce(function (evt) {
            evt.preventDefault();
            if (_this._isPanning)
                return;
            var view = _this.viewport.getBoundingClientRect();
            var relX = (evt.clientX - view.left) / view.width;
            var relY = (evt.clientY - view.top) / view.height;
            _this.camera.zoomTowards(evt.deltaY, { x: relX, y: relY });
            _this._constrainMapTarget();
            _this.renderer.redraw();
            _this.viewport.dispatchEvent(_this._buildViewBoxChangedEvent(_this.camera.viewBox()));
        });
        this.viewport = viewport;
        this.viewport.classList.add("ps2map__viewport");
        this.layers = new LayerManager(viewport, this._mapSize);
        this.camera = new Camera(this._mapSize, { width: viewport.clientWidth, height: viewport.clientHeight });
        this.renderer = new MapRenderer(this.camera, this.layers);
        var observer = new ResizeObserver(function () {
            var width = _this.viewport.clientWidth;
            var height = _this.viewport.clientHeight;
            _this.camera.updateViewportSize(_this._mapSize, { width: width, height: height });
            _this.viewport.dispatchEvent(_this._buildViewBoxChangedEvent(_this.camera.viewBox()));
        });
        observer.observe(this.viewport);
        this.viewport.addEventListener("wheel", this._onZoom.bind(this), { passive: false });
        this.viewport.addEventListener("mousedown", this._mousePan.bind(this), { passive: true });
    }
    MapEngine.prototype.getZoom = function () {
        return this.camera.zoom();
    };
    MapEngine.prototype.getMapSize = function () {
        return this._mapSize;
    };
    MapEngine.prototype.setMapSize = function (mapSize) {
        if (mapSize === this._mapSize)
            return;
        this.layers.clear();
        this.layers = new LayerManager(this.viewport, mapSize);
        this.renderer.updateLayerManager(this.layers);
        this.camera.updateViewportSize(mapSize, {
            width: this.viewport.clientWidth,
            height: this.viewport.clientHeight
        });
        this._mapSize = mapSize;
    };
    MapEngine.prototype.screenToMap = function (screen) {
        var vp = this.viewport;
        var relX = (screen.x - vp.offsetLeft) / vp.clientWidth;
        var relY = (screen.y - vp.offsetTop) / vp.clientHeight;
        var box = this.camera.viewBox();
        var halfSize = this.layers.mapSize.height * 0.5;
        return {
            x: -halfSize + box.left + (box.right - box.left) * relX,
            y: -halfSize + box.bottom + (box.top - box.bottom) * (1 - relY)
        };
    };
    MapEngine.prototype._mousePan = function (evtDown) {
        var _this = this;
        if (evtDown.button === 2)
            return;
        if (!this.allowPan && evtDown.button === 0)
            return;
        this._setPanLock(true);
        var panStart = {
            x: this.camera.target.x,
            y: this.camera.target.y
        };
        var zoom = this.camera.zoom();
        var startX = evtDown.clientX;
        var startY = evtDown.clientY;
        var drag = rafDebounce(function (evtDrag) {
            _this.camera.jumpTo({
                x: panStart.x - (evtDrag.clientX - startX) / zoom,
                y: panStart.y + (evtDrag.clientY - startY) / zoom
            });
            _this._constrainMapTarget();
            _this.renderer.redraw();
            _this.dispatchViewportChangedEvent();
        });
        var up = function () {
            _this._setPanLock(false);
            _this.viewport.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", up);
            _this.layers.updateAll();
        };
        document.addEventListener("mouseup", up);
        this.viewport.addEventListener("mousemove", drag, { passive: true });
    };
    MapEngine.prototype._constrainMapTarget = function () {
        var targetX = this.camera.target.x;
        var targetY = this.camera.target.y;
        var mapSize = this.layers.mapSize;
        if (targetX < 0)
            targetX = 0;
        if (targetX > mapSize.width)
            targetX = mapSize.width;
        if (targetY < 0)
            targetY = 0;
        if (targetY > mapSize.height)
            targetY = mapSize.height;
        this.camera.target = { x: targetX, y: targetY };
    };
    MapEngine.prototype._setPanLock = function (locked) {
        this._isPanning = locked;
        this.layers.forEachLayer(function (layer) {
            var element = layer.element;
            if (locked)
                element.style.transition = "transform 0ms ease-out";
            else
                element.style.removeProperty("transition");
        });
    };
    MapEngine.prototype.dispatchViewportChangedEvent = function () {
        this.viewport.dispatchEvent(this._buildViewBoxChangedEvent(this.camera.viewBox()));
    };
    MapEngine.prototype._buildViewBoxChangedEvent = function (viewBox) {
        return new CustomEvent("ps2map_viewboxchanged", {
            detail: { viewBox: viewBox }, bubbles: true, cancelable: true
        });
    };
    return MapEngine;
}());
var SupportsBaseOwnership = (function () {
    function SupportsBaseOwnership() {
    }
    return SupportsBaseOwnership;
}());
var CanvasLayer = (function (_super) {
    __extends(CanvasLayer, _super);
    function CanvasLayer(id, size, canvas) {
        var _this = _super.call(this, id, size) || this;
        _this.canvas = canvas;
        _this.element.classList.add("ps2map__canvas");
        return _this;
    }
    CanvasLayer.factory = function (continent, id) {
        return __awaiter(this, void 0, void 0, function () {
            var canvas, size, layer;
            return __generator(this, function (_a) {
                canvas = document.createElement("canvas");
                if (!canvas.getContext)
                    return [2, Promise.reject("HTML Canvas not supported")];
                canvas.width = canvas.height = continent.map_size;
                size = { width: continent.map_size, height: continent.map_size };
                layer = new CanvasLayer(id, size, canvas);
                layer.element.appendChild(canvas);
                return [2, layer];
            });
        });
    };
    CanvasLayer.prototype.calculateStrokeWidth = function (zoom) {
        return 1.6 + 23.67 / Math.pow(2, zoom / 0.23);
    };
    return CanvasLayer;
}(StaticLayer));
var UrlGen = (function () {
    function UrlGen() {
    }
    UrlGen.serverList = function () {
        return "".concat(this.restEndpoint, "server");
    };
    UrlGen.continentList = function () {
        return "".concat(this.restEndpoint, "continent");
    };
    UrlGen.latticeForContinent = function (continentId) {
        return "".concat(this.restEndpoint, "lattice?continent_id=").concat(continentId);
    };
    UrlGen.basesForContinent = function (continentId) {
        return "".concat(this.restEndpoint, "base?continent_id=").concat(continentId);
    };
    UrlGen.mapBackground = function (code) {
        return "".concat(this.restEndpoint, "static/minimap/").concat(code, ".jpg");
    };
    UrlGen.terrainTile = function (code, pos, lod) {
        var filename = "".concat(code, "_tile_").concat(pos[0], "_").concat(pos[1], "_lod").concat(lod, ".jpeg");
        return "".concat(this.restEndpoint, "static/tile/").concat(filename);
    };
    UrlGen.continentOutlines = function (code) {
        return "".concat(this.restEndpoint, "static/hex/").concat(code, "-minimal.svg");
    };
    UrlGen.baseStatus = function (continentId, serverId) {
        return "".concat(this.restEndpoint, "base/status") +
            "?continent_id=".concat(continentId, "&server_id=").concat(serverId);
    };
    UrlGen.restEndpoint = "http://127.0.0.1:5000/";
    return UrlGen;
}());
function fetchServers() {
    return fetch(UrlGen.serverList())
        .then(function (response) { return response.json(); });
}
function fetchContinents() {
    return fetch(UrlGen.continentList())
        .then(function (response) { return response.json(); });
}
function fetchContinentLattice(continentId) {
    return fetch(UrlGen.latticeForContinent(continentId))
        .then(function (response) { return response.json(); });
}
function fetchBasesForContinent(continentId) {
    return fetch(UrlGen.basesForContinent(continentId))
        .then(function (response) { return response.json(); });
}
function fetchBaseStatus(continentId, serverId) {
    return fetch(UrlGen.baseStatus(continentId, serverId))
        .then(function (response) { return response.json(); });
}
function fetchContinentOutlines(continentCode) {
    return fetch(UrlGen.continentOutlines(continentCode))
        .then(function (response) { return response.text(); })
        .then(function (payload) {
        var factory = document.createElement("template");
        factory.innerHTML = payload;
        var svg = factory.content.firstElementChild;
        if (!(svg instanceof SVGElement))
            throw new Error("Failed to extract outline SVG.");
        return svg;
    });
}
var BasePolygonsLayer = (function (_super) {
    __extends(BasePolygonsLayer, _super);
    function BasePolygonsLayer(id, size, svg) {
        var _this = _super.call(this, id, size) || this;
        _this.svg = svg;
        return _this;
    }
    BasePolygonsLayer.factory = function (continent, id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, fetchContinentOutlines(continent.code)
                        .then(function (svg) {
                        var size = {
                            width: continent.map_size,
                            height: continent.map_size
                        };
                        var layer = new BasePolygonsLayer(id, size, svg);
                        layer.element.appendChild(svg);
                        layer._initialisePolygons(svg);
                        var data = GameData.getInstance();
                        layer.element.querySelectorAll("polygon").forEach(function (element) {
                            var _a;
                            var baseId = layer._polygonIdToBaseId(element.id);
                            if (((_a = data.getBase(baseId)) === null || _a === void 0 ? void 0 : _a.type_code) === undefined)
                                element.remove();
                        });
                        return layer;
                    })];
            });
        });
    };
    BasePolygonsLayer.prototype.updateBaseOwnership = function (map) {
        var _this = this;
        map.forEach(function (owner, baseId) {
            var query = "#".concat(_this._baseIdToPolygonId(baseId));
            var polygon = _this.svg.querySelector(query);
            if (polygon) {
                if (owner !== 0) {
                    polygon.style.removeProperty("display");
                    polygon.style.fill =
                        "var(".concat(_this._factionIdToCssVar(owner), ")");
                }
                else {
                    polygon.style.display = "none";
                }
            }
            else {
                console.warn("Could not find polygon for base ".concat(baseId));
            }
        });
    };
    BasePolygonsLayer.prototype._factionIdToCssVar = function (factionId) {
        var code = GameData.getInstance().getFaction(factionId).code;
        return "--ps2map__faction-".concat(code, "-colour");
    };
    BasePolygonsLayer.prototype._initialisePolygons = function (svg) {
        var _this = this;
        svg.querySelectorAll("polygon").forEach(function (polygon) {
            polygon.id = _this._baseIdToPolygonId(polygon.id);
            var addHoverFx = function () {
                svg.appendChild(polygon);
                var removeHoverFx = function () {
                    polygon.style.removeProperty("stroke");
                };
                polygon.addEventListener("mouseleave", removeHoverFx, { passive: true });
                polygon.addEventListener("touchend", removeHoverFx, { passive: true });
                polygon.addEventListener("touchcancel", removeHoverFx, { passive: true });
                polygon.style.stroke = "#ffffff";
                _this.element.dispatchEvent(_this._buildBaseHoverEvent(_this._polygonIdToBaseId(polygon.id), polygon));
            };
            polygon.addEventListener("mouseenter", addHoverFx, { passive: true });
            polygon.addEventListener("touchstart", addHoverFx, { passive: true });
        });
    };
    BasePolygonsLayer.prototype.deferredLayerUpdate = function (_, zoom) {
        var strokeWith = 10 / Math.pow(1.5, zoom);
        this.svg.style.setProperty("--ps2map__base-hexes__stroke-width", "".concat(strokeWith, "px"));
    };
    BasePolygonsLayer.prototype._buildBaseHoverEvent = function (baseId, element) {
        return new CustomEvent("ps2map_basehover", {
            detail: { baseId: baseId, element: element },
            bubbles: true,
            cancelable: true
        });
    };
    BasePolygonsLayer.prototype._polygonIdToBaseId = function (id) {
        return parseInt(id.substring(id.lastIndexOf("-") + 1), 10);
    };
    BasePolygonsLayer.prototype._baseIdToPolygonId = function (baseId) {
        return "base-outline-".concat(baseId);
    };
    return BasePolygonsLayer;
}(StaticLayer));
var LatticeLayer = (function (_super) {
    __extends(LatticeLayer, _super);
    function LatticeLayer(id, size) {
        var _this = _super.call(this, id, size) || this;
        _this._links = [];
        _this.element.classList.add("ps2map__lattice");
        return _this;
    }
    LatticeLayer.factory = function (continent, id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, fetchContinentLattice(continent.id)
                        .then(function (links) {
                        var size = {
                            width: continent.map_size,
                            height: continent.map_size
                        };
                        var layer = new LatticeLayer(id, size);
                        layer._links = links;
                        layer.element.innerHTML = "";
                        layer.element.appendChild(layer._createLatticeSvg());
                        return layer;
                    })];
            });
        });
    };
    LatticeLayer.prototype.updateBaseOwnership = function (map) {
        var _this = this;
        map.forEach(function (_, baseId) {
            var links = _this._links.filter(function (l) { return l.base_a_id === baseId || l.base_b_id === baseId; });
            links.forEach(function (link) {
                var ownerA = map.get(link.base_a_id);
                var ownerB = map.get(link.base_b_id);
                var id = "#lattice-link-".concat(link.base_a_id, "-").concat(link.base_b_id);
                var element = _this.element.querySelector(id);
                if (element) {
                    var colour = "var(--ps2map__lattice-disabled)";
                    if (ownerA === undefined || ownerB === undefined) {
                    }
                    else if (ownerA === ownerB) {
                        if (ownerA !== 0)
                            colour = "var(".concat(_this._factionIdToCssVar(ownerA), ")");
                    }
                    else if (ownerA !== 0 && ownerB !== 0) {
                        colour = "var(--ps2map__lattice-contested)";
                    }
                    element.style.stroke = colour;
                }
            });
        });
    };
    LatticeLayer.prototype._createLatticeSvg = function () {
        var _this = this;
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 ".concat(this.size.width, " ").concat(this.size.height));
        this._links.forEach(function (link) {
            svg.appendChild(_this._createLatticeLink(link));
        });
        return svg;
    };
    LatticeLayer.prototype._createLatticeLink = function (link) {
        var path = document.createElementNS("http://www.w3.org/2000/svg", "line");
        path.setAttribute("id", "lattice-link-".concat(link.base_a_id, "-").concat(link.base_b_id));
        var offsetX = this.size.width * 0.5;
        var offsetY = this.size.height * 0.5;
        path.setAttribute("x1", (link.map_pos_a_x + offsetX).toFixed());
        path.setAttribute("y1", (-link.map_pos_a_y + offsetY).toFixed());
        path.setAttribute("x2", (link.map_pos_b_x + offsetX).toFixed());
        path.setAttribute("y2", (-link.map_pos_b_y + offsetY).toFixed());
        return path;
    };
    LatticeLayer.prototype._factionIdToCssVar = function (factionId) {
        var code = GameData.getInstance().getFaction(factionId).code;
        return "--ps2map__faction-".concat(code, "-colour");
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
    function BaseNamesLayer(id, size) {
        var _this = _super.call(this, id, size) || this;
        _this.features = [];
        return _this;
    }
    BaseNamesLayer.factory = function (continent, id) {
        return __awaiter(this, void 0, void 0, function () {
            var size, layer;
            return __generator(this, function (_a) {
                size = { width: continent.map_size, height: continent.map_size };
                layer = new BaseNamesLayer(id, size);
                return [2, fetchBasesForContinent(continent.id)
                        .then(function (bases) {
                        layer._loadBaseInfo(bases);
                        layer.updateLayer();
                        return layer;
                    })];
            });
        });
    };
    BaseNamesLayer.prototype.updateBaseOwnership = function (map) {
        var _this = this;
        map.forEach(function (owner, baseId) {
            var feat = _this.features.find(function (f) { return f.id === baseId; });
            if (feat)
                feat.element.style.setProperty("--ps2map__base-color", "var(".concat(_this._factionIdToCssVar(owner)));
        });
    };
    BaseNamesLayer.prototype._factionIdToCssVar = function (factionId) {
        var code = GameData.getInstance().getFaction(factionId).code;
        return "--ps2map__faction-".concat(code, "-colour");
    };
    BaseNamesLayer.prototype._loadBaseInfo = function (bases) {
        var _this = this;
        var features = [];
        bases.forEach(function (baseInfo) {
            if (baseInfo.type_code === "no-mans-land")
                return;
            var pos = {
                x: baseInfo.map_pos[0],
                y: baseInfo.map_pos[1]
            };
            var element = document.createElement("div");
            var name = baseInfo.name;
            ["amp-station", "bio-lab", "interlink", "tech-plant", "trident"]
                .forEach(function (type) {
                if (baseInfo.type_code === type)
                    name += " ".concat(baseInfo.type_name);
            });
            element.innerText = "".concat(name);
            element.classList.add("ps2map__base-names__icon");
            element.style.left = "".concat(_this.size.width * 0.5 + pos.x, "px");
            element.style.bottom = "".concat(_this.size.height * 0.5 + pos.y, "px");
            element.classList.add("ps2map__base-names__icon__".concat(baseInfo.type_code));
            var minZoom = 0;
            if (baseInfo.type_code === "small-outpost")
                minZoom = 0.60;
            if (baseInfo.type_code === "large-outpost")
                minZoom = 0.45;
            features.push(new BaseNameFeature(pos, baseInfo.id, baseInfo.name, element, minZoom));
            _this.element.appendChild(element);
        });
        this.features = features;
    };
    BaseNamesLayer.prototype.setHoveredBase = function (base) {
        this.features.forEach(function (feat) {
            if (feat.id === (base === null || base === void 0 ? void 0 : base.id)) {
                feat.forceVisible = true;
                feat.element.innerText = feat.text;
            }
            else {
                feat.forceVisible = false;
                if (!feat.visible)
                    feat.element.innerText = "";
            }
        });
    };
    BaseNamesLayer.prototype.deferredLayerUpdate = function (_, zoom) {
        var unzoom = 1 / zoom;
        this.features.forEach(function (feat) {
            feat.element.style.transform = ("translate(-50%, calc(var(--ps2map__base-icon-size) " +
                "* ".concat(unzoom, ")) scale(").concat(unzoom, ", ").concat(unzoom, ")"));
            if (!feat.forceVisible)
                if (zoom >= feat.minZoom)
                    feat.element.innerText = feat.text;
                else
                    feat.element.innerText = "";
            feat.visible = zoom >= feat.minZoom;
        });
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
    function TileLayer(id, size, initialLod) {
        var _this = this;
        if (size.height !== size.width)
            throw new Error("Non-square tile layers are not supported.");
        _this = _super.call(this, id, size) || this;
        _this.tiles = [];
        _this.lod = initialLod;
        _this._sizeNum = size.width;
        return _this;
    }
    TileLayer.prototype.defineTiles = function (gridSize) {
        var newTiles = [];
        var tileSize = this._sizeNum / gridSize;
        var baseSize = this._sizeNum / gridSize;
        var y = gridSize;
        while (y-- > 0)
            for (var x = 0; x < gridSize; x++) {
                var pos = { x: x, y: y };
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
        return (tile.box.left < viewBox.right && tile.box.right > viewBox.left
            && tile.box.top > viewBox.bottom && tile.box.bottom < viewBox.top);
    };
    TileLayer.prototype.updateTileVisibility = function (viewBox) {
        var _this = this;
        var activeTiles = [];
        this.tiles.forEach(function (tile) {
            if (_this.tileIsVisible(tile, viewBox))
                activeTiles.push(tile.element);
        });
        requestAnimationFrame(function () {
            _this.element.innerHTML = "";
            activeTiles.forEach(function (tile) { return _this.element.appendChild(tile); });
        });
    };
    TileLayer.prototype.deferredLayerUpdate = function (viewBox, _) {
        this.updateTileVisibility(viewBox);
    };
    TileLayer.prototype.redraw = function (viewBox, zoom) {
        var targetX = (viewBox.right + viewBox.left) * 0.5;
        var targetY = (viewBox.top + viewBox.bottom) * 0.5;
        var halfSize = this._sizeNum * 0.5;
        var offsetX = -halfSize;
        var offsetY = -halfSize;
        offsetX += (halfSize - targetX) * zoom;
        offsetY -= (halfSize - targetY) * zoom;
        this.element.style.transform = ("matrix(".concat(zoom, ", 0.0, 0.0, ").concat(zoom, ", ").concat(offsetX, ", ").concat(offsetY, ")"));
    };
    return TileLayer;
}(MapLayer));
var TerrainLayer = (function (_super) {
    __extends(TerrainLayer, _super);
    function TerrainLayer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._code = "";
        return _this;
    }
    TerrainLayer.factory = function (continent, id) {
        return __awaiter(this, void 0, void 0, function () {
            var size, initialLod, layer;
            return __generator(this, function (_a) {
                size = { width: continent.map_size, height: continent.map_size };
                initialLod = 3;
                layer = new TerrainLayer(id, size, initialLod);
                layer.element.classList.add("ps2map__terrain");
                layer._setContinent(continent.code);
                layer.updateLayer();
                return [2, layer];
            });
        });
    };
    TerrainLayer.prototype._setContinent = function (code) {
        if (this._code === code)
            return;
        this._code = code;
        this.element.style.backgroundImage = ("url(".concat(UrlGen.mapBackground(code), ")"));
        var gridSize = this._mapTilesPerAxis(this.size.width, this.lod);
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
        var mapStep = this.size.width / gridSize;
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
        return UrlGen.terrainTile(this._code, tilePos, lod);
    };
    TerrainLayer.prototype._gridPosToTilePos = function (pos, lod) {
        var min = this._mapGridLimits(this.size.width, lod)[0];
        var stepSize = this._mapStepSize(this.size.width, lod);
        return [min + (stepSize * pos.x), min + (stepSize * pos.y)];
    };
    TerrainLayer.prototype._mapStepSize = function (size, lod) {
        if (lod === 0)
            return 4;
        if (lod === 1 || size <= 1024)
            return 8;
        if (lod === 2 || size <= 2048)
            return 16;
        return 32;
    };
    TerrainLayer.prototype._mapTileCount = function (size, lod) {
        return Math.ceil(Math.pow(4, (Math.floor(Math.log2(size)) - 8 - lod)));
    };
    TerrainLayer.prototype._mapTilesPerAxis = function (size, lod) {
        return Math.floor(Math.sqrt(this._mapTileCount(size, lod)));
    };
    TerrainLayer.prototype._mapGridLimits = function (size, lod) {
        var stepSize = this._mapStepSize(size, lod);
        var tilesPerAxis = this._mapTilesPerAxis(size, lod);
        var halfSize = stepSize * Math.floor(tilesPerAxis / 2);
        if (halfSize <= 0)
            return [-stepSize, -stepSize];
        return [-halfSize, halfSize - stepSize];
    };
    TerrainLayer.prototype.deferredLayerUpdate = function (viewBox, zoom) {
        var newLod = this._calculateLod(zoom);
        if (this.lod !== newLod) {
            this.lod = newLod;
            this.defineTiles(this._mapTilesPerAxis(this.size.width, newLod));
        }
        this.updateTileVisibility(viewBox);
    };
    return TerrainLayer;
}(TileLayer));
var HeroMap = (function (_super) {
    __extends(HeroMap, _super);
    function HeroMap(viewport) {
        var _this = _super.call(this, viewport) || this;
        _this._continent = undefined;
        return _this;
    }
    HeroMap.prototype.getCanvasContext = function () {
        var elem = this.viewport.querySelector("canvas");
        if (!elem)
            throw new Error("No canvas element found");
        var ctx = elem.getContext("2d");
        if (!ctx)
            throw new Error("Failed to get canvas context");
        return ctx;
    };
    HeroMap.prototype.getLayer = function (id) {
        var layer = this.layers.getLayer(id);
        if (!layer)
            throw new Error("Layer '".concat(id, "' does not exist"));
        return layer;
    };
    HeroMap.prototype.updateBaseOwnership = function (map) {
        var _this = this;
        var data = GameData.getInstance();
        var continentMap = new Map();
        map.forEach(function (owner, baseId) {
            var _a;
            var base = data.getBase(baseId);
            if (base && base.continent_id === ((_a = _this._continent) === null || _a === void 0 ? void 0 : _a.id))
                continentMap.set(baseId, owner);
        });
        function supportsBaseOwnership(object) {
            return "updateBaseOwnership" in object;
        }
        this.layers.forEachLayer(function (layer) {
            if (supportsBaseOwnership(layer))
                layer.updateBaseOwnership(continentMap);
        });
    };
    HeroMap.prototype.switchContinent = function (continent) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var allLayers;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (continent.code === ((_a = this._continent) === null || _a === void 0 ? void 0 : _a.code))
                            return [2];
                        allLayers = [
                            TerrainLayer.factory(continent, "terrain"),
                            BasePolygonsLayer.factory(continent, "hexes"),
                            LatticeLayer.factory(continent, "lattice"),
                            BaseNamesLayer.factory(continent, "names"),
                            CanvasLayer.factory(continent, "canvas"),
                        ];
                        return [4, Promise.all(allLayers).then(function (layers) {
                                _this.layers.clear();
                                var size = continent.map_size;
                                if (_this._mapSize.width !== size) {
                                    _this.setMapSize({ width: size, height: size });
                                }
                                _this.camera.resetZoom();
                                _this.jumpTo({ x: size / 2, y: size / 2 });
                                _this.dispatchViewportChangedEvent();
                                layers.forEach(function (layer) {
                                    _this.layers.addLayer(layer);
                                    layer.updateLayer();
                                });
                                _this._continent = continent;
                            })];
                    case 1:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    HeroMap.prototype.jumpTo = function (point) {
        this.camera.jumpTo(point);
        this.renderer.redraw();
    };
    return HeroMap;
}(MapEngine));
var Minimap = (function () {
    function Minimap(element) {
        var _this = this;
        this._mapSize = 0;
        this._baseOutlineSvg = undefined;
        this._polygons = new Map();
        this.element = element;
        this.element.classList.add("ps2map__minimap");
        this._cssSize = this.element.clientWidth;
        this.element.style.height = "".concat(this._cssSize, "px");
        this.element.style.fillOpacity = "0.5";
        this._viewBoxElement = document.createElement("div");
        this._viewBoxElement.classList.add("ps2map__minimap__viewbox");
        this.element.appendChild(this._viewBoxElement);
        this.element.addEventListener("mousedown", this._jumpToPosition.bind(this), { passive: true });
        var obj = new ResizeObserver(function () {
            _this._cssSize = _this.element.clientWidth;
            _this.element.style.height = "".concat(_this._cssSize, "px");
        });
        obj.observe(this.element);
    }
    Minimap.prototype.updateViewbox = function (viewBox) {
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
    Minimap.prototype.updateBaseOwnership = function (map) {
        var _this = this;
        map.forEach(function (factionId, baseId) {
            var polygon = _this._polygons.get(baseId);
            if (polygon)
                polygon.style.fill =
                    "var(".concat(_this._factionIdToCssVar(factionId), ")");
        });
    };
    Minimap.prototype._factionIdToCssVar = function (factionId) {
        var code = GameData.getInstance().getFaction(factionId).code;
        return "--ps2map__faction-".concat(code, "-colour");
    };
    Minimap.prototype.switchContinent = function (continent) {
        return __awaiter(this, void 0, void 0, function () {
            var svg;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, fetchContinentOutlines(continent.code)];
                    case 1:
                        svg = _a.sent();
                        this._mapSize = continent.map_size;
                        this.element.style.backgroundImage =
                            "url(".concat(UrlGen.mapBackground(continent.code), ")");
                        if (this._baseOutlineSvg)
                            this.element.removeChild(this._baseOutlineSvg);
                        this._polygons = new Map();
                        svg.classList.add("ps2map__minimap__hexes");
                        this._baseOutlineSvg = svg;
                        this.element.appendChild(this._baseOutlineSvg);
                        svg.querySelectorAll("polygon").forEach(function (poly) {
                            _this._polygons.set(parseInt(poly.id, 10), poly);
                            poly.id = _this._polygonIdFromBaseId(poly.id);
                        });
                        return [2];
                }
            });
        });
    };
    Minimap.prototype._buildMinimapJumpEvent = function (target) {
        return new CustomEvent("ps2map_minimapjump", {
            detail: { target: target }, bubbles: true, cancelable: true
        });
    };
    Minimap.prototype._jumpToPosition = function (evtDown) {
        var _this = this;
        if (this._mapSize === 0 || evtDown.button !== 0)
            return;
        var drag = rafDebounce(function (evtDrag) {
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
        this.element.addEventListener("mousemove", drag, { passive: true });
        drag(evtDown);
    };
    Minimap.prototype._polygonIdFromBaseId = function (baseId) {
        return "minimap-baseId-".concat(baseId);
    };
    return Minimap;
}());
var MapListener = (function () {
    function MapListener(server) {
        if (server === void 0) { server = undefined; }
        this._server = server;
        this._subscribers = [];
        this._baseUpdateIntervalId = null;
    }
    MapListener.prototype.subscribe = function (callback) {
        this._subscribers.push(callback);
    };
    MapListener.prototype.unsubscribe = function (callback) {
        this._subscribers = this._subscribers.filter(function (subscriber) { return subscriber !== callback; });
    };
    MapListener.prototype.notify = function (event, data) {
        this._subscribers.forEach(function (subscriber) { return subscriber(event, data); });
    };
    MapListener.prototype.clear = function () {
        this._subscribers = [];
    };
    MapListener.prototype.switchServer = function (server) {
        this._server = server;
        this._startMapStatePolling();
    };
    MapListener.prototype._pollBaseOwnership = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!this._server)
                    return [2];
                fetchContinents().then(function (continents) {
                    var bases = [];
                    continents.forEach(function (continent) {
                        if (!_this._server)
                            return;
                        bases.push(fetchBaseStatus(continent.id, _this._server.id));
                    });
                    var baseOwnership = new Map();
                    Promise.all(bases).then(function (results) {
                        results.forEach(function (status) {
                            status.forEach(function (base) {
                                baseOwnership.set(base.base_id, base.owning_faction_id);
                            });
                        });
                    }).then(function () {
                        _this.notify("baseCaptured", baseOwnership);
                    });
                });
                return [2];
            });
        });
    };
    MapListener.prototype._startMapStatePolling = function () {
        var _this = this;
        if (this._baseUpdateIntervalId)
            clearInterval(this._baseUpdateIntervalId);
        this._pollBaseOwnership();
        this._baseUpdateIntervalId = setInterval(function () {
            _this._pollBaseOwnership();
        }, 5000);
    };
    return MapListener;
}());
var Tool = (function () {
    function Tool(viewport, map, toolPanel) {
        this._isActive = false;
        this._map = map;
        this._viewport = viewport;
        this._toolPanel = toolPanel;
    }
    Tool.prototype.activate = function () {
        this._isActive = true;
        this._setUpToolPanel();
    };
    Tool.prototype.deactivate = function () {
        this._isActive = false;
        this._toolPanel.innerHTML = "";
        this._toolPanel.removeAttribute("style");
    };
    Tool.prototype.isActive = function () {
        return this._isActive;
    };
    Tool.prototype.getId = function () {
        return Tool.id;
    };
    Tool.prototype._setUpToolPanel = function () {
    };
    Tool.id = "none";
    Tool.displayName = "None";
    Tool.hotkey = null;
    return Tool;
}());
var CanvasTool = (function (_super) {
    __extends(CanvasTool, _super);
    function CanvasTool(viewport, map, toolPanel) {
        var _this = _super.call(this, viewport, map, toolPanel) || this;
        _this._cursor = null;
        _this._mouseDown = false;
        _this._context = null;
        _this._halfMapSize = null;
        _this._onDown = _this._onDown.bind(_this);
        _this._onMove = _this._onMove.bind(_this);
        return _this;
    }
    CanvasTool.prototype.activate = function () {
        _super.prototype.activate.call(this);
        this._map.allowPan = false;
        this._viewport.addEventListener("mousedown", this._onDown, { passive: true });
        this._viewport.addEventListener("mousemove", this._onMove, { passive: true });
        this._cursor = document.createElement("div");
        this._cursor.style.zIndex = "100";
        this._cursor.style.position = "absolute";
        this._cursor.style.pointerEvents = "none";
        this._setUpCursor();
        this._viewport.appendChild(this._cursor);
    };
    CanvasTool.prototype.deactivate = function () {
        _super.prototype.deactivate.call(this);
        this._map.allowPan = true;
        this._viewport.removeEventListener("mousedown", this._onDown);
        this._viewport.removeEventListener("mousemove", this._onMove);
        if (this._cursor)
            this._viewport.removeChild(this._cursor);
    };
    CanvasTool.prototype._onDown = function (event) {
        var _this = this;
        if (event.button !== 0)
            return;
        this._context = this._map.getCanvasContext();
        this._halfMapSize = this._map.getMapSize().width * 0.5;
        this._mouseDown = true;
        this._action(this._context, this._getActionPos(event), this._getScaling());
        var up = function (evt) {
            if (_this._context) {
                _this._mouseDown = false;
                _this._action(_this._context, _this._getActionPos(evt), _this._getScaling());
                document.removeEventListener("mouseup", up);
            }
        };
        document.addEventListener("mouseup", up, { passive: true });
    };
    CanvasTool.prototype._onMove = function (event) {
        if (this._cursor) {
            var box = this._viewport.getBoundingClientRect();
            this._cursor.style.left = "".concat(event.clientX - box.left, "px");
            this._cursor.style.top = "".concat(event.clientY - box.top, "px");
        }
        if (this._mouseDown && this._context)
            this._action(this._context, this._getActionPos(event), this._getScaling());
    };
    CanvasTool.prototype._getActionPos = function (event) {
        var pos = this._map.screenToMap(event);
        if (!this._halfMapSize)
            return { x: 0, y: 0 };
        return {
            x: this._halfMapSize + pos.x,
            y: this._halfMapSize - pos.y
        };
    };
    CanvasTool.prototype._getScaling = function () {
        return 1 / this._map.getZoom();
    };
    return CanvasTool;
}(Tool));
var Cursor = (function (_super) {
    __extends(Cursor, _super);
    function Cursor(viewport, map, toolPanel) {
        var _this = _super.call(this, viewport, map, toolPanel) || this;
        _this._onMove = _this._onMove.bind(_this);
        return _this;
    }
    Cursor.prototype.activate = function () {
        _super.prototype.activate.call(this);
        this._viewport.addEventListener("mousemove", this._onMove, { passive: true });
    };
    Cursor.prototype.deactivate = function () {
        _super.prototype.deactivate.call(this);
        this._viewport.removeEventListener("mousemove", this._onMove);
    };
    Cursor.prototype._setUpToolPanel = function () {
        _super.prototype._setUpToolPanel.call(this);
        var x = Object.assign(document.createElement("span"), {
            id: "tool-cursor_x"
        });
        var y = Object.assign(document.createElement("span"), {
            id: "tool-cursor_y"
        });
        var frag = document.createDocumentFragment();
        frag.appendChild(document.createTextNode("X:"));
        frag.appendChild(x);
        frag.appendChild(document.createTextNode(" Y:"));
        frag.appendChild(y);
        this._toolPanel.appendChild(frag);
        Object.assign(this._toolPanel.style, {
            display: "grid",
            gridTemplateColumns: "1fr 3fr",
            minWidth: "120px",
            fontFamily: "Consolas, monospace",
            fontSize: "18px",
            justifyItems: "right"
        });
        this._updateToolPanel({ x: 0, y: 0 });
    };
    Cursor.prototype._updateToolPanel = function (target) {
        var x = document.getElementById("tool-cursor_x");
        if (x)
            x.textContent = target.x.toFixed(2);
        var y = document.getElementById("tool-cursor_y");
        if (y)
            y.textContent = target.y.toFixed(2);
    };
    Cursor.prototype._onMove = function (event) {
        this._updateToolPanel(this._map.screenToMap(event));
    };
    Cursor.id = "cursor";
    Cursor.displayName = "Map Cursor";
    Cursor.hotkey = "q";
    return Cursor;
}(Tool));
var BaseInfo = (function (_super) {
    __extends(BaseInfo, _super);
    function BaseInfo(viewport, map, toolPanel) {
        var _this = _super.call(this, viewport, map, toolPanel) || this;
        _this._onHover = _this._onHover.bind(_this);
        return _this;
    }
    BaseInfo.prototype.activate = function () {
        _super.prototype.activate.call(this);
        StateManager.subscribe(State.user.baseHovered, this._onHover);
    };
    BaseInfo.prototype.deactivate = function () {
        _super.prototype.deactivate.call(this);
        StateManager.unsubscribe(State.user.baseHovered, this._onHover);
    };
    BaseInfo.prototype._setUpToolPanel = function () {
        _super.prototype._setUpToolPanel.call(this);
        var frag = document.createDocumentFragment();
        frag.appendChild(Object.assign(document.createElement("span"), {
            id: "tool-base-name",
            classList: "ps2map__tool__base-info__name"
        }));
        frag.appendChild(Object.assign(document.createElement("img"), {
            id: "tool-base-icon",
            classList: "ps2map__tool__base-info__type-icon"
        }));
        frag.appendChild(Object.assign(document.createElement("span"), {
            id: "tool-base-type",
            classList: "ps2map__tool__base-info__type"
        }));
        frag.appendChild(document.createElement("br"));
        frag.appendChild(Object.assign(document.createElement("img"), {
            id: "tool-base-resource-icon",
            classList: "ps2map__tool__base-info__resource-icon"
        }));
        frag.appendChild(Object.assign(document.createElement("span"), {
            id: "tool-base-resource-name",
            classList: "ps2map__tool__base-info__resource-text"
        }));
        this._toolPanel.appendChild(frag);
    };
    BaseInfo.prototype._updateBaseInfo = function (base) {
        if (!base) {
            this._toolPanel.removeAttribute("style");
            return;
        }
        this._toolPanel.style.display = "block";
        var name = document.getElementById("tool-base-name");
        var typeIcon = document.getElementById("tool-base-icon");
        var type = document.getElementById("tool-base-type");
        var resourceIcon = document.getElementById("tool-base-resource-icon");
        var resourceText = document.getElementById("tool-base-resource-name");
        name.textContent = base.name;
        type.textContent = base.type_name;
        typeIcon.src = "img/icons/".concat(base.type_code, ".svg");
        if (base.resource_code) {
            resourceIcon.src = "img/icons/".concat(base.resource_code, ".png");
            resourceText.textContent = "".concat(base.resource_capture_amount, " ").concat(base.resource_name, " (").concat(base.resource_control_amount.toFixed(1), "/min)");
        }
    };
    BaseInfo.prototype._onHover = function (state) {
        this._updateBaseInfo(state.user.hoveredBase);
    };
    BaseInfo.id = "base-info";
    BaseInfo.displayName = "Base Info";
    BaseInfo.hotkey = "q";
    return BaseInfo;
}(Tool));
var Eraser = (function (_super) {
    __extends(Eraser, _super);
    function Eraser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Eraser.prototype._setUpCursor = function () {
        if (!this._cursor)
            return;
        this._cursor.style.width = this._cursor.style.height =
            "".concat(Eraser.size, "px");
        this._cursor.style.marginLeft = this._cursor.style.marginTop =
            "".concat(-Eraser.size * 0.5, "px");
        this._cursor.style.border = "1px solid #fff";
    };
    Eraser.prototype._action = function (context, pos, scale) {
        var size = Eraser.size * scale;
        context.clearRect(pos.x - size * 0.5, pos.y - size * 0.5, size, size);
    };
    Eraser.prototype._setUpToolPanel = function () {
        _super.prototype._setUpToolPanel.call(this);
        var frag = document.createDocumentFragment();
        frag.appendChild(document.createTextNode("Hold LMB to erase, MMB to pan"));
        this._toolPanel.appendChild(frag);
        this._toolPanel.style.display = "block";
    };
    Eraser.id = "eraser";
    Eraser.displayName = "Eraser";
    Eraser.hotkey = "e";
    Eraser.size = 40;
    return Eraser;
}(CanvasTool));
var Brush = (function (_super) {
    __extends(Brush, _super);
    function Brush() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._last = null;
        return _this;
    }
    Brush.prototype._setUpCursor = function () {
        if (!this._cursor)
            return;
        this._cursor.style.width = this._cursor.style.height =
            "".concat(Brush.size, "px");
        this._cursor.style.marginLeft = this._cursor.style.marginTop =
            this._cursor.style.borderRadius = "".concat(-Brush.size / 2, "px");
        this._cursor.style.border = "1px solid #fff";
    };
    Brush.prototype._action = function (context, pos, scale) {
        var lineWeight = Brush.size * scale;
        context.fillStyle = Brush.color;
        context.strokeStyle = Brush.color;
        context.beginPath();
        if (!this._last) {
            context.arc(pos.x, pos.y, lineWeight * 0.5, 0, 2 * Math.PI, false);
            this._last = pos;
        }
        else {
            context.lineWidth = lineWeight;
            context.lineCap = "round";
            if (this._mouseDown) {
                context.moveTo(this._last.x, this._last.y);
                context.lineTo(pos.x, pos.y);
                context.stroke();
                this._last = pos;
            }
            else {
                this._last = null;
            }
        }
    };
    Brush.prototype._setUpToolPanel = function () {
        _super.prototype._setUpToolPanel.call(this);
        var frag = document.createDocumentFragment();
        frag.appendChild(document.createTextNode("Hold LMB to draw, MMB to pan"));
        frag.appendChild(document.createElement("br"));
        frag.appendChild(document.createTextNode("Color:"));
        var picker = document.createElement("input");
        picker.type = "color";
        picker.value = "#ffff00";
        picker.style.margin = "10px";
        picker.addEventListener("change", function () {
            Brush.color = picker.value;
        });
        frag.appendChild(picker);
        this._toolPanel.appendChild(frag);
        this._toolPanel.style.display = "block";
    };
    Brush.size = 10;
    Brush.color = "rgb(255, 255, 0)";
    Brush.id = "brush";
    Brush.displayName = "Brush";
    Brush.hotkey = "b";
    return Brush;
}(CanvasTool));
document.addEventListener("DOMContentLoaded", function () {
    var availableTools = [Tool, Cursor, BaseInfo, Eraser, Brush];
    var toolInstances = new Map();
    var toolBox = document.getElementById("toolbar-container");
    if (toolBox) {
        toolBox.innerHTML = "";
        availableTools.forEach(function (tool) {
            var btn = document.createElement("input");
            btn.type = "button";
            btn.value = tool.displayName;
            btn.classList.add("toolbar__button");
            btn.id = "tool-".concat(tool.id);
            btn.addEventListener("click", function () {
                StateManager.dispatch(State.toolbox.setTool, tool.id);
            });
            toolBox.appendChild(btn);
        });
    }
    document.addEventListener("keydown", function (event) {
        var tool = "";
        if (event.key === "Escape")
            tool = "none";
        else
            availableTools.forEach(function (t) {
                if (event.key === t.hotkey)
                    tool = t.hotkey === null ? "none" : t.id;
            });
        if (!tool)
            return;
        StateManager.dispatch(State.toolbox.setTool, tool);
    });
    StateManager.subscribe(State.toolbox.setTool, function (state) {
        if (!toolInstances.has(state.toolbox.current || "")) {
            var map_1 = state.toolbox.map;
            if (!map_1)
                return;
            var toolPanel_1 = document.getElementById("tool-panel");
            availableTools.forEach(function (tool) {
                if (tool.id === state.toolbox.current)
                    toolInstances.set(tool.id, new tool(map_1.viewport, map_1, toolPanel_1));
            });
        }
        toolInstances.forEach(function (instance, id) {
            if (instance.isActive() && id !== state.toolbox.current)
                instance.deactivate();
        });
        var current = toolInstances.get(state.toolbox.current || "");
        if (current && !current.isActive())
            current.activate();
        document.querySelectorAll(".toolbar__button").forEach(function (btn) {
            if (btn.id === "tool-".concat(state.toolbox.current))
                btn.classList.add("toolbar__button__active");
            else
                btn.classList.remove("toolbar__button__active");
        });
    });
});
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var State;
(function (State) {
    var map;
    (function (map) {
        map.baseCaptured = "map/baseCaptured";
    })(map = State.map || (State.map = {}));
    State.defaultMapState = {
        baseOwnership: new Map()
    };
    function mapReducer(state, action, data) {
        switch (action) {
            case State.map.baseCaptured:
                return __assign(__assign({}, state), { baseOwnership: data });
            default:
                return state;
        }
    }
    State.mapReducer = mapReducer;
})(State || (State = {}));
var State;
(function (State) {
    var toolbox;
    (function (toolbox) {
        toolbox.setup = "toolbox/setup";
        toolbox.setTool = "toolbox/setTool";
    })(toolbox = State.toolbox || (State.toolbox = {}));
    State.defaultToolboxState = {
        current: null,
        map: null
    };
    function toolboxReducer(state, action, data) {
        switch (action) {
            case toolbox.setup:
                return __assign(__assign(__assign({}, state), State.defaultToolboxState), { map: data });
            case toolbox.setTool:
                return __assign(__assign({}, state), { current: data });
            default:
                return state;
        }
    }
    State.toolboxReducer = toolboxReducer;
})(State || (State = {}));
var State;
(function (State) {
    var user;
    (function (user) {
        user.continentChanged = "user/continentChanged";
        user.serverChanged = "user/serverChanged";
        user.baseHovered = "user/baseHovered";
    })(user = State.user || (State.user = {}));
    State.defaultUserState = {
        server: undefined,
        continent: undefined,
        hoveredBase: null,
        canvas: []
    };
    function userReducer(state, action, data) {
        switch (action) {
            case user.serverChanged:
                return __assign(__assign({}, state), { server: data });
            case user.continentChanged:
                return __assign(__assign({}, state), { continent: data });
            case user.baseHovered:
                return __assign(__assign({}, state), { hoveredBase: data });
            default:
                return state;
        }
    }
    State.userReducer = userReducer;
})(State || (State = {}));
var State;
(function (State) {
    function appReducer(state, action, data) {
        return {
            map: State.mapReducer(state.map, action, data),
            toolbox: State.toolboxReducer(state.toolbox, action, data),
            user: State.userReducer(state.user, action, data)
        };
    }
    State.appReducer = appReducer;
})(State || (State = {}));
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
document.addEventListener("DOMContentLoaded", function () {
    var grabber = document.getElementById("sidebar-selector");
    grabber.addEventListener("mousedown", function (event) {
        document.body.style.cursor = "col-resize";
        var box = minimap.element.firstElementChild;
        box.style.transition = "none";
        var sidebar = document.getElementById("sidebar");
        var initialWidth = sidebar.clientWidth;
        var minWidth = 0.1;
        minWidth *= document.body.clientWidth;
        var maxWidth = 512;
        var startX = event.clientX;
        var onMove = function (evt) {
            var delta = evt.clientX - startX;
            var newWidth = initialWidth + delta;
            if (newWidth < minWidth)
                newWidth = minWidth;
            else if (newWidth > maxWidth)
                newWidth = maxWidth;
            document.body.style.setProperty("--sidebar-width", "".concat(newWidth, "px"));
        };
        var onUp = function () {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            document.body.style.removeProperty("cursor");
            box.style.removeProperty("transition");
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    });
    var heroMap = new HeroMap(document.getElementById("hero-map"));
    var minimap = new Minimap(document.getElementById("minimap"));
    var listener = new MapListener();
    listener.subscribe(function (name, data) {
        StateManager.dispatch("map/".concat(name), data);
    });
    StateManager.subscribe(State.map.baseCaptured, function (state) {
        heroMap.updateBaseOwnership(state.map.baseOwnership);
        minimap.updateBaseOwnership(state.map.baseOwnership);
    });
    StateManager.subscribe(State.user.continentChanged, function (state) {
        var cont = state.user.continent;
        var mapSize = cont ? cont.map_size : 0;
        GameData.getInstance().setActiveContinent(state.user.continent)
            .then(function () {
            if (state.user.continent) {
                heroMap.switchContinent(state.user.continent).then(function () {
                    heroMap.updateBaseOwnership(state.map.baseOwnership);
                    heroMap.jumpTo({ x: mapSize / 2, y: mapSize / 2 });
                });
                minimap.switchContinent(state.user.continent).then(function () {
                    minimap.updateBaseOwnership(state.map.baseOwnership);
                });
            }
        });
    });
    StateManager.subscribe(State.user.serverChanged, function (state) {
        if (state.user.server)
            listener.switchServer(state.user.server);
    });
    StateManager.subscribe(State.user.baseHovered, function (state) {
        var names = heroMap.getLayer("names");
        if (names)
            names.setHoveredBase(state.user.hoveredBase);
    });
    StateManager.dispatch(State.toolbox.setup, heroMap);
    StateManager.dispatch(State.toolbox.setTool, Tool.id);
    heroMap.viewport.addEventListener("ps2map_basehover", function (event) {
        var evt = event.detail;
        var base = GameData.getInstance().getBase(evt.baseId);
        if (base)
            StateManager.dispatch(State.user.baseHovered, base);
    });
    document.addEventListener("ps2map_viewboxchanged", function (event) {
        var evt = event.detail;
        minimap.updateViewbox(evt.viewBox);
    }, { passive: true });
    document.addEventListener("ps2map_minimapjump", function (event) {
        var evt = event.detail;
        heroMap.jumpTo(evt.target);
    }, { passive: true });
    var serverPicker = document.getElementById("server-picker");
    serverPicker.addEventListener("change", function () {
        var server = GameData.getInstance().servers()
            .find(function (s) { return s.id === parseInt(serverPicker.value, 10); });
        if (!server)
            throw new Error("No server found with id ".concat(serverPicker.value));
        StateManager.dispatch(State.user.serverChanged, server);
    });
    var continentPicker = document.getElementById("continent-picker");
    continentPicker.addEventListener("change", function () {
        var continent = GameData.getInstance().continents()
            .find(function (c) { return c.id === parseInt(continentPicker.value, 10); });
        if (!continent)
            throw new Error("No continent found with id ".concat(continentPicker.value));
        StateManager.dispatch(State.user.continentChanged, continent);
    });
    GameData.load().then(function (gameData) {
        var servers = __spreadArray([], gameData.servers(), true);
        var continents = __spreadArray([], gameData.continents(), true);
        servers.sort(function (a, b) { return a.name.localeCompare(b.name); });
        servers.forEach(function (server) {
            var option = document.createElement("option");
            option.value = server.id.toString();
            option.text = server.name;
            serverPicker.appendChild(option);
        });
        continents.sort(function (a, b) { return a.name.localeCompare(b.name); });
        continents.forEach(function (cont) {
            var option = document.createElement("option");
            option.value = cont.id.toString();
            option.text = cont.name;
            continentPicker.appendChild(option);
        });
        StateManager.dispatch(State.user.serverChanged, servers[0]);
        StateManager.dispatch(State.user.continentChanged, continents[0]);
    });
});
var MapRenderer = (function () {
    function MapRenderer(camera, layers) {
        this._camera = camera;
        this._layers = layers;
    }
    MapRenderer.prototype.redraw = function (layers) {
        if (layers === void 0) { layers = undefined; }
        var layersToRedraw = [];
        if (layers === undefined)
            layersToRedraw = this._layers.allLayers();
        else if (layers.length !== undefined)
            layersToRedraw = layers;
        else
            layersToRedraw = [layers];
        var viewBox = this._camera.viewBox();
        var zoom = this._camera.zoom();
        layersToRedraw.forEach(function (layer) {
            layer.redraw(viewBox, zoom);
            layer.setRedrawArgs(viewBox, zoom);
        });
    };
    MapRenderer.prototype.updateLayerManager = function (layers) {
        this._layers = layers;
    };
    return MapRenderer;
}());
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
var StateManager = (function () {
    function StateManager() {
    }
    StateManager.dispatch = function (action, data) {
        var _this = this;
        var newState = this._update(action, data);
        if (newState === this._state) {
            console.warn("StateManager: dispatch: no change for action \"".concat(action, "\""));
            return;
        }
        this._state = newState;
        var subscriptions = this._subscriptions.get(action);
        if (subscriptions)
            subscriptions.forEach(function (callback) { return callback(_this._state); });
    };
    StateManager.subscribe = function (action, callback) {
        var subscriptions = this._subscriptions.get(action);
        if (!subscriptions) {
            subscriptions = [];
            this._subscriptions.set(action, subscriptions);
        }
        subscriptions.push(callback);
    };
    StateManager.unsubscribe = function (action, callback) {
        var subscriptions = this._subscriptions.get(action);
        if (!subscriptions)
            return;
        var index = subscriptions.indexOf(callback);
        if (index < 0)
            return;
        subscriptions.splice(index, 1);
    };
    StateManager.getState = function () {
        return this._state;
    };
    StateManager._update = function (action, data) {
        return State.appReducer(this._state, action, data);
    };
    StateManager._state = {
        map: State.defaultMapState,
        toolbox: State.defaultToolboxState,
        user: State.defaultUserState
    };
    StateManager._subscriptions = new Map();
    return StateManager;
}());
//# sourceMappingURL=index.js.map