"use strict";
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
        this.maxZoom = 4.0;
        this.zoomStep = 1.5;
        this.currentZoomIndex = -1;
        this.viewportHeight = viewportHeight;
        this.viewportWidth = viewportWidth;
        var zoom = this.maxZoom;
        this.zoomLevels = [this.maxZoom];
        var stepInverse = 1 / this.zoomStep;
        while (mapSize * zoom > Math.min(viewportHeight, viewportWidth)) {
            zoom *= stepInverse;
            this.zoomLevels.push(Utils.roundTo(zoom, 2));
        }
        this.currentZoomIndex = this.zoomLevels.length - 1;
        this.target = {
            x: mapSize * 0.5,
            y: mapSize * 0.5
        };
    }
    MapCamera.prototype.bumpZoomLevel = function (direction) {
        var newIndex = this.currentZoomIndex;
        if (direction == 0)
            return newIndex;
        if (direction < 0)
            newIndex--;
        else if (direction > 0)
            newIndex++;
        if (newIndex < 0)
            newIndex = 0;
        else if (newIndex >= this.zoomLevels.length)
            newIndex = this.zoomLevels.length - 1;
        this.currentZoomIndex = newIndex;
        return this.zoomLevels[newIndex];
    };
    MapCamera.prototype.getViewBox = function () {
        var viewBoxHeight = this.viewportHeight / this.getZoom();
        var viewBoxWidth = this.viewportWidth / this.getZoom();
        return {
            top: this.target.y + viewBoxHeight * 0.5,
            right: this.target.x + viewBoxWidth * 0.5,
            bottom: this.target.y - viewBoxHeight * 0.5,
            left: this.target.x - viewBoxWidth * 0.5
        };
    };
    MapCamera.prototype.getZoom = function () {
        return this.zoomLevels[this.currentZoomIndex];
    };
    MapCamera.prototype.zoomTo = function (direction, viewX, viewY) {
        if (viewX === void 0) { viewX = 0.5; }
        if (viewY === void 0) { viewY = 0.5; }
        var oldZoom = this.getZoom();
        var newZoom = this.bumpZoomLevel(direction);
        var pixelDeltaX = (this.viewportWidth / oldZoom) - (this.viewportWidth / newZoom);
        var pixelDeltaY = (this.viewportHeight / oldZoom) - (this.viewportHeight / newZoom);
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
        this.lastRedraw = null;
        this.runDeferredLayerUpdate = Utils.rafDebounce(function () {
            if (_this.lastRedraw == null)
                return;
            var _a = _this.lastRedraw, viewBox = _a[0], zoom = _a[1];
            _this.deferredLayerUpdate(viewBox, zoom);
        });
        this.id = id;
        this.mapSize = mapSize;
        this.element = document.createElement("div");
        this.element.id = id;
        this.element.classList.add("ps2map__layer");
        this.element.style.height = this.element.style.width = "".concat(mapSize, "px");
        this.element.addEventListener("transitionend", this.runDeferredLayerUpdate.bind(this), { passive: true });
    }
    MapLayer.prototype.setRedrawArgs = function (viewBox, zoom) {
        this.lastRedraw = [viewBox, zoom];
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
    StaticLayer.prototype.addChild = function (element) {
        this.element.appendChild(element);
    };
    StaticLayer.prototype.removeChild = function (element) {
        this.element.removeChild(element);
    };
    StaticLayer.prototype.clearChildren = function () {
        this.element.innerHTML = "";
    };
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
        this.mapSize = 1024;
        this.layers = [];
        this.isPanning = false;
        this.onZoom = Utils.rafDebounce(function (evt) {
            evt.preventDefault();
            if (_this.isPanning)
                return;
            var view = _this.viewport.getBoundingClientRect();
            var relX = Utils.clamp((evt.clientX - view.left) / view.width, 0.0, 1.0);
            var relY = Utils.clamp((evt.clientY - view.top) / view.height, 0.0, 1.0);
            _this.camera.zoomTo(evt.deltaY, relX, relY);
            _this.constrainMapTarget();
            _this.redraw(_this.camera.getViewBox(), _this.camera.getZoom());
        });
        this.viewport = viewport;
        this.viewport.classList.add("ps2map__viewport");
        this.anchor = document.createElement("div");
        this.anchor.classList.add("ps2map__anchor");
        this.viewport.appendChild(this.anchor);
        this.setMapSize(mapSize);
        this.camera = new MapCamera(mapSize, this.viewport.clientHeight, this.viewport.clientWidth);
        this.panOffsetX = this.viewport.clientWidth * 0.5;
        this.panOffsetY = this.viewport.clientHeight * 0.5;
        this.anchor.style.left = "".concat(this.panOffsetX, "px");
        this.anchor.style.top = "".concat(this.panOffsetY, "px");
        this.viewport.addEventListener("wheel", this.onZoom.bind(this), {
            passive: false
        });
        this.viewport.addEventListener("mousedown", this.mousePan.bind(this), {
            passive: true
        });
        setInterval(function () {
            _this.viewport.dispatchEvent(_this.buildViewBoxChangedEvent(_this.camera.getViewBox()));
        }, 0.01);
    }
    MapRenderer.prototype.getCamera = function () {
        return this.camera;
    };
    MapRenderer.prototype.getMapSize = function () {
        return this.mapSize;
    };
    MapRenderer.prototype.addLayer = function (layer) {
        if (layer.mapSize != this.mapSize)
            throw "Map layer size must match the map renderer's.";
        this.layers.push(layer);
        this.anchor.appendChild(layer.element);
        this.redraw(this.camera.getViewBox(), this.camera.getZoom());
    };
    MapRenderer.prototype.getLayer = function (id) {
        for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
            var layer = _a[_i];
            if (layer.id == id)
                return layer;
        }
        return undefined;
    };
    MapRenderer.prototype.clearLayers = function () {
        this.anchor.innerText = "";
        this.layers = [];
    };
    MapRenderer.prototype.forEachLayer = function (callback) {
        var i = this.layers.length;
        while (i-- > 0)
            callback(this.layers[i]);
    };
    MapRenderer.prototype.jumpTo = function (target) {
        this.camera.target = target;
        this.constrainMapTarget();
        this.redraw(this.camera.getViewBox(), this.camera.getZoom());
    };
    MapRenderer.prototype.setMapSize = function (value) {
        if (this.layers.length > 0)
            throw "Remove all map layers before changing map size.";
        this.mapSize = value;
        this.camera = new MapCamera(value, this.viewport.clientHeight, this.viewport.clientWidth);
    };
    MapRenderer.prototype.mousePan = function (evtDown) {
        var _this = this;
        if (evtDown.button == 2)
            return;
        this.setPanLock(true);
        var refX = this.camera.target.x;
        var refY = this.camera.target.y;
        var zoom = this.camera.getZoom();
        var startX = evtDown.clientX;
        var startY = evtDown.clientY;
        var drag = Utils.rafDebounce(function (evtDrag) {
            var deltaX = evtDrag.clientX - startX;
            var deltaY = evtDrag.clientY - startY;
            _this.camera.target = {
                x: refX - deltaX / zoom,
                y: refY + deltaY / zoom
            };
            _this.constrainMapTarget();
            _this.redraw(_this.camera.getViewBox(), zoom);
        });
        var up = function () {
            _this.setPanLock(false);
            _this.viewport.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", up);
        };
        document.addEventListener("mouseup", up);
        this.viewport.addEventListener("mousemove", drag, {
            passive: true
        });
    };
    MapRenderer.prototype.setPanLock = function (locked) {
        this.isPanning = locked;
        var i = this.layers.length;
        while (i-- > 0) {
            var element = this.layers[i].element;
            if (locked)
                element.style.transition = "transform 0ms ease-out";
            else
                element.style.removeProperty("transition");
        }
    };
    MapRenderer.prototype.redraw = function (viewBox, zoom) {
        var i = this.layers.length;
        while (i-- > 0) {
            var layer = this.layers[i];
            layer.redraw(viewBox, zoom);
            layer.setRedrawArgs(viewBox, zoom);
        }
        this.anchor.dispatchEvent(this.buildViewBoxChangedEvent(viewBox));
    };
    MapRenderer.prototype.constrainMapTarget = function () {
        var targetX = this.camera.target.x;
        var targetY = this.camera.target.y;
        if (targetX < 0)
            targetX = 0;
        if (targetX > this.mapSize)
            targetX = this.mapSize;
        if (targetY < 0)
            targetY = 0;
        if (targetY > this.mapSize)
            targetY = this.mapSize;
        this.camera.target = {
            x: targetX,
            y: targetY
        };
    };
    MapRenderer.prototype.buildViewBoxChangedEvent = function (viewBox) {
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
var BasePolygonsLayer = (function (_super) {
    __extends(BasePolygonsLayer, _super);
    function BasePolygonsLayer(id, mapSize) {
        var _this = _super.call(this, id, mapSize) || this;
        _this.element.classList.add("ps2map__base-hexes");
        return _this;
    }
    BasePolygonsLayer.prototype.setBaseOwnership = function (baseId, factionId) {
        var svg = this.element.firstElementChild;
        if (svg == null)
            throw "Unable to find HexLayer SVG element";
        var id = this.baseIdToPolygonId(baseId);
        var polygon = svg.querySelector("polygon[id=\"".concat(id, "\"]"));
        if (polygon == null)
            throw "Unable to find base polygon with id ".concat(baseId);
        var colours = {
            "0": "rgba(0, 0, 0, 1.0)",
            "1": "rgba(160, 77, 183, 1.0)",
            "2": "rgba(81, 123, 204, 1.0)",
            "3": "rgba(226, 25, 25, 1.0)",
            "4": "rgba(255, 255, 255, 1.0)"
        };
        polygon.style.fill = colours[factionId.toFixed()];
    };
    BasePolygonsLayer.prototype.applyPolygonHoverFix = function (svg) {
        var _this = this;
        svg.querySelectorAll("polygon").forEach(function (polygon) {
            polygon.id = _this.baseIdToPolygonId(polygon.id);
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
                _this.element.dispatchEvent(_this.buildBaseHoverEvent(_this.polygonIdToBaseId(polygon.id), polygon));
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
    BasePolygonsLayer.prototype.buildBaseHoverEvent = function (baseId, element) {
        return new CustomEvent("ps2map_basehover", {
            detail: {
                baseId: baseId,
                element: element
            },
            bubbles: true,
            cancelable: true
        });
    };
    BasePolygonsLayer.prototype.polygonIdToBaseId = function (id) {
        return parseInt(id.substring(id.lastIndexOf("-") + 1));
    };
    BasePolygonsLayer.prototype.baseIdToPolygonId = function (baseId) {
        return "base-outline-".concat(baseId);
    };
    return BasePolygonsLayer;
}(StaticLayer));
var HeroMap = (function () {
    function HeroMap(viewport) {
        this.continent = undefined;
        this.server = undefined;
        this.baseOwnershipMap = new Map();
        this.baseUpdateIntervalId = undefined;
        this.viewport = viewport;
        this.controller = new MapRenderer(this.viewport, 0);
        setupToolbox(this.controller);
    }
    HeroMap.prototype.setBaseOwnership = function (baseId, factionId) {
        var _this = this;
        var _a;
        if (this.baseOwnershipMap.get(baseId) == factionId)
            return;
        this.baseOwnershipMap.set(baseId, factionId);
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.forEachLayer(function (layer) {
            if (layer.id == "hexes")
                layer.setBaseOwnership(baseId, factionId);
            if (layer.id == "names")
                layer.setBaseOwnership(baseId, factionId);
            if (layer.id == "lattice")
                layer.updateBaseOwnership(baseId, _this.baseOwnershipMap);
        });
        this.viewport.dispatchEvent(this.buildBaseOwnershipChangedEvent(baseId, factionId));
    };
    HeroMap.prototype.setContinent = function (continent) {
        var _a;
        if (continent.code == ((_a = this.continent) === null || _a === void 0 ? void 0 : _a.code))
            return;
        this.continent = continent;
        this.controller.clearLayers();
        this.controller.setMapSize(continent.map_size);
        var terrain = new TerrainLayer("terrain", continent.map_size);
        terrain.setContinent(continent.code);
        terrain.updateLayer();
        this.controller.addLayer(terrain);
        var hexes = new BasePolygonsLayer("hexes", continent.map_size);
        Api.getContinentOutlinesSvg(continent)
            .then(function (svg) {
            svg.classList.add("ps2map__base-hexes__svg");
            hexes.element.appendChild(svg);
            hexes.applyPolygonHoverFix(svg);
        });
        this.controller.addLayer(hexes);
        var lattice = new LatticeLayer("lattice", continent.map_size);
        lattice.setContinent(continent);
        this.controller.addLayer(lattice);
        var names = new BaseNamesLayer("names", continent.map_size);
        Api.getBasesFromContinent(continent.id)
            .then(function (bases) {
            names.loadBaseInfo(bases);
            names.updateLayer();
        });
        this.controller.addLayer(names);
        hexes.element.addEventListener("ps2map_basehover", function (event) {
            var evt = event;
            names.onBaseHover(evt.detail.baseId, evt.detail.element);
        });
        this.startMapStatePolling();
        this.jumpTo({ x: continent.map_size / 2, y: continent.map_size / 2 });
        this.viewport.dispatchEvent(this.buildContinentChangedEvent(continent));
    };
    HeroMap.prototype.setServer = function (server) {
        var _a;
        if (server.id == ((_a = this.server) === null || _a === void 0 ? void 0 : _a.id))
            return;
        this.server = server;
        this.startMapStatePolling();
    };
    HeroMap.prototype.updateBaseOwnership = function () {
        var _this = this;
        var _a, _b;
        var server_id = (_a = this.server) === null || _a === void 0 ? void 0 : _a.id;
        var continentId = (_b = this.continent) === null || _b === void 0 ? void 0 : _b.id;
        if (server_id == undefined || continentId == undefined)
            return;
        Api.getBaseOwnership(continentId, server_id).then(function (data) {
            var i = data.length;
            while (i-- > 0)
                _this.setBaseOwnership(data[i].base_id, data[i].owning_faction_id);
        });
    };
    HeroMap.prototype.jumpTo = function (point) {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.jumpTo(point);
    };
    HeroMap.prototype.startMapStatePolling = function () {
        var _this = this;
        this.baseOwnershipMap.clear();
        if (this.baseUpdateIntervalId != undefined)
            clearInterval(this.baseUpdateIntervalId);
        this.updateBaseOwnership();
        this.baseUpdateIntervalId = setInterval(function () {
            _this.updateBaseOwnership();
        }, 5000);
    };
    HeroMap.prototype.buildBaseOwnershipChangedEvent = function (baseId, factionId) {
        return new CustomEvent("ps2map_baseownershipchanged", {
            detail: {
                baseId: baseId,
                factionId: factionId
            },
            bubbles: true,
            cancelable: true
        });
    };
    HeroMap.prototype.buildContinentChangedEvent = function (continent) {
        return new CustomEvent("ps2map_continentchanged", {
            detail: {
                continent: continent
            },
            bubbles: true,
            cancelable: true
        });
    };
    return HeroMap;
}());
var Minimap = (function () {
    function Minimap(element, continent) {
        if (continent === void 0) { continent = undefined; }
        this.mapSize = 0;
        this.baseOutlineSvg = undefined;
        this.minimapHexAlpha = 0.5;
        this.polygons = new Map();
        this.element = element;
        this.element.classList.add("ps2map__minimap");
        this.cssSize = this.element.clientWidth;
        this.element.style.height = "".concat(this.cssSize, "px");
        this.viewBoxElement = document.createElement("div");
        this.viewBoxElement.classList.add("ps2map__minimap__viewbox");
        this.element.appendChild(this.viewBoxElement);
        if (continent != undefined)
            this.setContinent(continent);
        this.element.addEventListener("mousedown", this.jumpToPosition.bind(this), {
            passive: true
        });
    }
    Minimap.prototype.jumpToPosition = function (evtDown) {
        var _this = this;
        if (this.mapSize == 0)
            return;
        var drag = Utils.rafDebounce(function (evtDrag) {
            var rect = _this.element.getBoundingClientRect();
            var relX = (evtDrag.clientX - rect.left) / (rect.width);
            var relY = (evtDrag.clientY - rect.top) / (rect.height);
            var target = {
                x: Math.round(relX * _this.mapSize),
                y: Math.round((1 - relY) * _this.mapSize)
            };
            _this.element.dispatchEvent(_this.buildMinimapJumpEvent(target));
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
        var mapSize = this.mapSize;
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
        this.viewBoxElement.style.height = "".concat(this.cssSize * relHeight, "px");
        this.viewBoxElement.style.width = "".concat(this.cssSize * relWidth, "px");
        this.viewBoxElement.style.left = "".concat(this.cssSize * relLeft, "px");
        this.viewBoxElement.style.bottom = "".concat(this.cssSize * relTop, "px");
    };
    Minimap.prototype.setBaseOwnership = function (baseId, factionId) {
        var colours = {
            0: "rgba(0, 0, 0, ".concat(this.minimapHexAlpha, ")"),
            1: "rgba(160, 77, 183, ".concat(this.minimapHexAlpha, ")"),
            2: "rgba(81, 123, 204, ".concat(this.minimapHexAlpha, ")"),
            3: "rgba(226, 25, 25, ".concat(this.minimapHexAlpha, ")"),
            4: "rgba(255, 255, 255, ".concat(this.minimapHexAlpha, ")")
        };
        var polygon = this.polygons.get(baseId);
        if (polygon)
            polygon.style.fill = colours[factionId];
    };
    Minimap.prototype.setContinent = function (continent) {
        var _this = this;
        this.mapSize = continent.map_size;
        this.element.style.backgroundImage =
            "url(".concat(Api.getMinimapImagePath(continent.code), ")");
        Api.getContinentOutlinesSvg(continent)
            .then(function (svg) {
            if (_this.baseOutlineSvg != undefined)
                _this.element.removeChild(_this.baseOutlineSvg);
            _this.polygons = new Map();
            svg.classList.add("ps2map__minimap__hexes");
            _this.baseOutlineSvg = svg;
            _this.element.appendChild(_this.baseOutlineSvg);
            var polygons = svg.querySelectorAll("polygon");
            var i = polygons.length;
            while (i-- > 0) {
                _this.polygons.set(parseInt(polygons[i].id), polygons[i]);
                polygons[i].id = _this.polygonIdFromBaseId(polygons[i].id);
            }
        });
    };
    Minimap.prototype.buildMinimapJumpEvent = function (target) {
        return new CustomEvent("ps2map_minimapjump", {
            detail: {
                target: target
            },
            bubbles: true,
            cancelable: true
        });
    };
    Minimap.prototype.polygonIdFromBaseId = function (baseId) {
        return "minimap-baseId-".concat(baseId);
    };
    return Minimap;
}());
var Tool = (function () {
    function Tool(viewport, renderer) {
        this.map = renderer;
        this.viewport = viewport;
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
    };
    Tool.getDisplayName = function () {
        return "Cursor";
    };
    Tool.getId = function () {
        return "cursor";
    };
    Tool.prototype.getMapPosition = function (event) {
        var clickRelX = (event.clientX - this.viewport.offsetLeft) / this.viewport.clientWidth;
        var clickRelY = 1 - (event.clientY - this.viewport.offsetTop) / this.viewport.clientHeight;
        var viewBox = this.map.getCamera().getViewBox();
        var xMap = -this.map.getMapSize() * 0.5 + viewBox.left + (viewBox.right - viewBox.left) * clickRelX;
        var yMap = -this.map.getMapSize() * 0.5 + viewBox.bottom + (viewBox.top - viewBox.bottom) * clickRelY;
        return [xMap, yMap];
    };
    return Tool;
}());
var Crosshair = (function (_super) {
    __extends(Crosshair, _super);
    function Crosshair() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.callback = undefined;
        return _this;
    }
    Crosshair.prototype.activate = function () {
        _super.prototype.activate.call(this);
        this.viewport.style.cursor = "crosshair";
        this.callback = this.onClick.bind(this);
        this.viewport.addEventListener("click", this.callback, { passive: true });
    };
    Crosshair.prototype.deactivate = function () {
        _super.prototype.deactivate.call(this);
        if (this.callback)
            this.viewport.removeEventListener("click", this.callback);
        this.viewport.style.removeProperty("cursor");
    };
    Crosshair.getDisplayName = function () {
        return "Crosshair";
    };
    Crosshair.getId = function () {
        return "crosshair";
    };
    Crosshair.prototype.onClick = function (event) {
        if (event.button !== 0)
            return;
        var _a = this.getMapPosition(event), x = _a[0], y = _a[1];
        console.log("Clicked ".concat([x.toFixed(2), y.toFixed(2)]));
    };
    return Crosshair;
}(Tool));
var DevTools;
(function (DevTools) {
    var BaseMarkers = (function (_super) {
        __extends(BaseMarkers, _super);
        function BaseMarkers(viewport, map) {
            var _this = _super.call(this, viewport, map) || this;
            _this.placedBases = [];
            _this.callback = undefined;
            var btn = document.getElementById("export-bases");
            if (btn)
                btn.addEventListener("click", function () { return _this["export"](); });
            return _this;
        }
        BaseMarkers.prototype.activate = function () {
            _super.prototype.activate.call(this);
            this.viewport.style.cursor = "crosshair";
            this.callback = this.onClick.bind(this);
            this.viewport.addEventListener("click", this.callback, { passive: true });
        };
        BaseMarkers.prototype.deactivate = function () {
            _super.prototype.deactivate.call(this);
            if (this.callback)
                this.viewport.removeEventListener("click", this.callback);
            this.viewport.style.removeProperty("cursor");
        };
        BaseMarkers.prototype.clear = function () {
            this.placedBases = [];
        };
        BaseMarkers.prototype["export"] = function () {
            var data = JSON.stringify(this.placedBases);
            var blob = new Blob([data], { type: "application/json" });
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = "bases.json";
            a.click();
        };
        BaseMarkers.prototype.onClick = function (event) {
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
            this.placedBases.push({
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
var available_tools = [Tool, Crosshair, DevTools.BaseMarkers];
function setupToolbox(map) {
    heroMap = map;
}
function setTool(tool) {
    if (tool === void 0) { tool = undefined; }
    currentTool === null || currentTool === void 0 ? void 0 : currentTool.deactivate();
    if (tool == undefined)
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
        heroMap.setServer(server);
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
        heroMap.setServer(JSON.parse(continent_picker.value));
    });
    var continent_picker = document.getElementById("continent-picker");
    continent_picker.addEventListener("change", function () {
        var cont = JSON.parse(continent_picker.value);
        heroMap.setContinent(cont);
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
        heroMap.setContinent(JSON.parse(continent_picker.value));
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
var LatticeLayer = (function (_super) {
    __extends(LatticeLayer, _super);
    function LatticeLayer(id, mapSize) {
        var _this = _super.call(this, id, mapSize) || this;
        _this.latticeLinkCache = [];
        _this.element.classList.add("ps2map__lattice");
        return _this;
    }
    LatticeLayer.prototype.updateBaseOwnership = function (baseId, baseOwnershipMap) {
        var colours = {
            0: "rgba(0, 0, 0, 1.0)",
            1: "rgba(120, 37, 143, 1.0)",
            2: "rgba(41, 83, 164, 1.0)",
            3: "rgba(186, 25, 25, 1.0)",
            4: "rgba(50, 50, 50, 1.0)"
        };
        var i = this.latticeLinkCache.length;
        while (i-- > 0) {
            var link = this.latticeLinkCache[i];
            if (link.base_a_id == baseId || link.base_b_id == baseId) {
                var id = "#lattice-link-".concat(link.base_a_id, "-").concat(link.base_b_id);
                var element = this.element.querySelector(id);
                if (!element)
                    continue;
                var ownerA = baseOwnershipMap.get(link.base_a_id);
                var ownerB = baseOwnershipMap.get(link.base_b_id);
                if (ownerA == undefined || ownerB == undefined)
                    continue;
                if (ownerA == ownerB)
                    element.style.stroke = colours[ownerA];
                else
                    element.style.stroke = "orange";
            }
        }
    };
    LatticeLayer.prototype.setContinent = function (continent) {
        var _this = this;
        Api.getLatticeForContinent(continent)
            .then(function (links) {
            _this.latticeLinkCache = [];
            var i = links.length;
            while (i-- > 0)
                _this.latticeLinkCache.push(links[i]);
            _this.createLatticeSvg();
        });
    };
    LatticeLayer.prototype.createLatticeSvg = function () {
        var _this = this;
        this.element.innerHTML = "";
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 ".concat(this.mapSize, " ").concat(this.mapSize));
        this.latticeLinkCache.forEach(function (link) {
            svg.appendChild(_this.createLatticeLink(link));
        });
        this.element.appendChild(svg);
    };
    LatticeLayer.prototype.createLatticeLink = function (link) {
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
    BaseNamesLayer.prototype.loadBaseInfo = function (bases) {
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
    BaseNamesLayer.prototype.setBaseOwnership = function (baseId, factionId) {
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
            if (feat.id == baseId)
                feat.element.style.setProperty("--ps2map__base-color", colours[factionId]);
        }
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
        _this.code = "";
        _this.element.classList.add("ps2map__terrain");
        return _this;
    }
    TerrainLayer.prototype.setContinent = function (code) {
        if (this.code == code)
            return;
        this.code = code;
        this.element.style.backgroundImage = ("url(".concat(Api.getMinimapImagePath(code), ")"));
        var gridSize = this.mapTilesPerAxis(this.mapSize, this.lod);
        this.defineTiles(gridSize);
    };
    TerrainLayer.prototype.calculateLod = function (zoom) {
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
    TerrainLayer.prototype.formatTileCoordinate = function (value) {
        var negative = value < 0;
        var coord = Math.abs(value).toFixed();
        if (coord.length < 3)
            coord = ("00" + coord).slice(-3);
        if (negative)
            coord = "-" + coord.slice(1);
        return coord;
    };
    TerrainLayer.prototype.generateTilePath = function (pos, lod) {
        var _a = this.gridPosToTilePos(pos, lod), tileX = _a[0], tileY = _a[1];
        var tilePos = [
            this.formatTileCoordinate(tileX),
            this.formatTileCoordinate(tileY)
        ];
        return Api.getTerrainTilePath(this.code, tilePos, lod);
    };
    TerrainLayer.prototype.gridPosToTilePos = function (pos, lod) {
        var min = this.mapGridLimits(this.mapSize, lod)[0];
        var stepSize = this.mapStepSize(this.mapSize, lod);
        return [min + (stepSize * pos.x), min + (stepSize * pos.y)];
    };
    TerrainLayer.prototype.mapStepSize = function (mapSize, lod) {
        if (lod == 0)
            return 4;
        if (lod == 1 || mapSize <= 1024)
            return 8;
        if (lod == 2 || mapSize <= 2048)
            return 16;
        return 32;
    };
    TerrainLayer.prototype.mapTileCount = function (mapSize, lod) {
        return Math.ceil(Math.pow(4, (Math.floor(Math.log2(mapSize)) - 8 - lod)));
    };
    TerrainLayer.prototype.mapTilesPerAxis = function (mapSize, lod) {
        return Math.floor(Math.sqrt(this.mapTileCount(mapSize, lod)));
    };
    TerrainLayer.prototype.mapGridLimits = function (mapSize, lod) {
        var stepSize = this.mapStepSize(mapSize, lod);
        var tilesPerAxis = this.mapTilesPerAxis(mapSize, lod);
        var halfSize = stepSize * Math.floor(tilesPerAxis / 2);
        if (halfSize <= 0)
            return [-stepSize, -stepSize];
        return [-halfSize, halfSize - stepSize];
    };
    TerrainLayer.prototype.deferredLayerUpdate = function (viewBox, zoom) {
        var newLod = this.calculateLod(zoom);
        if (newLod != this.lod) {
            this.lod = newLod;
            this.defineTiles(this.mapTilesPerAxis(this.mapSize, newLod));
        }
        this.updateTileVisibility(viewBox);
    };
    return TerrainLayer;
}(TileLayer));
