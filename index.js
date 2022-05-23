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
    MapCamera.prototype.getViewbox = function () {
        var viewboxHeight = this.viewportHeight / this.getZoom();
        var viewboxWidth = this.viewportWidth / this.getZoom();
        return {
            top: this.target.y + viewboxHeight * 0.5,
            right: this.target.x + viewboxWidth * 0.5,
            bottom: this.target.y - viewboxHeight * 0.5,
            left: this.target.x - viewboxWidth * 0.5
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
            var _a = _this.lastRedraw, viewbox = _a[0], zoom = _a[1];
            _this.deferredLayerUpdate(viewbox, zoom);
        });
        this.id = id;
        this.mapSize = mapSize;
        this.element = document.createElement("div");
        this.element.id = id;
        this.element.classList.add("ps2map__layer");
        this.element.style.height = this.element.style.width = mapSize + "px";
        this.element.addEventListener("transitionend", this.runDeferredLayerUpdate.bind(this), { passive: true });
    }
    MapLayer.prototype.setRedrawArgs = function (viewbox, zoom) {
        this.lastRedraw = [viewbox, zoom];
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
    MapLayer.prototype.deferredLayerUpdate = function (viewbox, zoom) { };
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
    StaticLayer.prototype.redraw = function (viewbox, zoom) {
        var targetX = (viewbox.right + viewbox.left) * 0.5;
        var targetY = (viewbox.top + viewbox.bottom) * 0.5;
        var halfMapSize = this.mapSize * 0.5;
        var offsetX = -halfMapSize;
        var offsetY = -halfMapSize;
        offsetX += (halfMapSize - targetX) * zoom;
        offsetY -= (halfMapSize - targetY) * zoom;
        this.element.style.transform = ("matrix(" + zoom + ", 0.0, 0.0, " + zoom + ", " + offsetX + ", " + offsetY + ")");
    };
    return StaticLayer;
}(MapLayer));
var MapRenderer = (function () {
    function MapRenderer(viewport, mapSize) {
        var _this = this;
        this.mapSize = 1024;
        this.layers = [];
        this.isPanning = false;
        this.onViewboxChanged = [];
        this.onZoom = Utils.rafDebounce(function (evt) {
            evt.preventDefault();
            if (_this.isPanning)
                return;
            var view = _this.viewport.getBoundingClientRect();
            var relX = Utils.clamp((evt.clientX - view.left) / view.width, 0.0, 1.0);
            var relY = Utils.clamp((evt.clientY - view.top) / view.height, 0.0, 1.0);
            _this.camera.zoomTo(evt.deltaY, relX, relY);
            _this.constrainMapTarget();
            _this.redraw(_this.camera.getViewbox(), _this.camera.getZoom());
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
        this.anchor.style.left = this.panOffsetX + "px";
        this.anchor.style.top = this.panOffsetY + "px";
        this.viewport.addEventListener("wheel", this.onZoom.bind(this), {
            passive: false
        });
        this.viewport.addEventListener("mousedown", this.mousePan.bind(this), {
            passive: true
        });
    }
    MapRenderer.prototype.addLayer = function (layer) {
        if (layer.mapSize != this.mapSize)
            throw "Map layer size must match the map renderer's.";
        this.layers.push(layer);
        this.anchor.appendChild(layer.element);
        this.redraw(this.camera.getViewbox(), this.camera.getZoom());
    };
    MapRenderer.prototype.getLayer = function (id) {
        for (var _i = 0, _a = this.layers; _i < _a.length; _i++) {
            var layer = _a[_i];
            if (layer.id == id)
                return layer;
        }
        return undefined;
    };
    MapRenderer.prototype.forEachLayer = function (callback) {
        var i = this.layers.length;
        while (i-- > 0)
            callback(this.layers[i]);
    };
    MapRenderer.prototype.jumpTo = function (target) {
        this.camera.target = target;
        this.constrainMapTarget();
        this.redraw(this.camera.getViewbox(), this.camera.getZoom());
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
            _this.redraw(_this.camera.getViewbox(), zoom);
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
    MapRenderer.prototype.redraw = function (viewbox, zoom) {
        var i = this.layers.length;
        while (i-- > 0) {
            var layer = this.layers[i];
            layer.redraw(viewbox, zoom);
            layer.setRedrawArgs(viewbox, zoom);
        }
        i = this.onViewboxChanged.length;
        while (i-- > 0)
            this.onViewboxChanged[i](viewbox);
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
        return Api.restEndpoint + "continent";
    }
    Api.getContinentListUrl = getContinentListUrl;
    function getBasesFromContinentUrl(id) {
        return Api.restEndpoint + "base?continent_id=" + id;
    }
    Api.getBasesFromContinentUrl = getBasesFromContinentUrl;
    function getMinimapImagePath(code) {
        return Api.restEndpoint + "static/minimap/" + code + ".jpg";
    }
    Api.getMinimapImagePath = getMinimapImagePath;
    function getTerrainTilePath(code, pos, lod) {
        var filename = code + "_tile_" + pos[0] + "_" + pos[1] + "_lod" + lod + ".jpeg";
        return Api.restEndpoint + "static/tile/" + filename;
    }
    Api.getTerrainTilePath = getTerrainTilePath;
    function getContinentOutlinesPath(code) {
        return Api.restEndpoint + "static/hex/" + code + "-minimal.svg";
    }
    Api.getContinentOutlinesPath = getContinentOutlinesPath;
    function getBaseOwnershipUrl(continent_id, server_id) {
        return Api.restEndpoint + "base/status?continent_id=" + continent_id + "&server_id=" + server_id;
    }
    Api.getBaseOwnershipUrl = getBaseOwnershipUrl;
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
})(Api || (Api = {}));
var HexLayer = (function (_super) {
    __extends(HexLayer, _super);
    function HexLayer(id, mapSize) {
        var _this = _super.call(this, id, mapSize) || this;
        _this.onBaseHover = [];
        _this.element.classList.add("ps2map__base-hexes");
        return _this;
    }
    HexLayer.prototype.setBaseOwner = function (baseId, factionId) {
        var svg = this.element.firstElementChild;
        if (svg == null)
            throw "Unable to find HexLayer SVG element";
        var polygon = svg.querySelector("polygon[id=\"" + baseId + "\"]");
        if (polygon == null)
            throw "Unable to find base polygon with id " + baseId;
        var colours = {
            "0": "rgba(0, 0, 0, 1.0)",
            "1": "rgba(160, 77, 183, 1.0)",
            "2": "rgba(81, 123, 204, 1.0)",
            "3": "rgba(226, 25, 25, 1.0)",
            "4": "rgba(255, 255, 255, 1.0)"
        };
        polygon.style.fill = colours[factionId.toFixed()];
    };
    HexLayer.prototype.applyPolygonHoverFix = function (svg) {
        var _this = this;
        svg.querySelectorAll("polygon").forEach(function (polygon) {
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
                var i = _this.onBaseHover.length;
                while (i-- > 0)
                    _this.onBaseHover[i](parseInt(polygon.id), polygon);
                polygon.style.stroke = "#ffffff";
            };
            polygon.addEventListener("mouseenter", addHoverFx, {
                passive: true
            });
            polygon.addEventListener("touchstart", addHoverFx, {
                passive: true
            });
        });
    };
    HexLayer.prototype.deferredLayerUpdate = function (viewbox, zoom) {
        var svg = this.element.firstElementChild;
        if (svg != null) {
            var strokeWith = 10 / Math.pow(1.5, zoom);
            svg.style.setProperty("--ps2map__base-hexes__stroke-width", strokeWith + "px");
        }
    };
    return HexLayer;
}(StaticLayer));
var HeroMap = (function () {
    function HeroMap(viewport) {
        this.continent = undefined;
        this.controller = undefined;
        this.baseOwnershipMap = new Map();
        this.baseUpdateIntervalId = undefined;
        this.onContinentChanged = [];
        this.onBaseOwnershipChanged = [];
        this.onViewboxChanged = [];
        this.viewport = viewport;
    }
    HeroMap.prototype.setBaseOwnership = function (baseId, factionId) {
        var _a;
        if (this.baseOwnershipMap.get(baseId) == factionId)
            return;
        this.baseOwnershipMap.set(baseId, factionId);
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.forEachLayer(function (layer) {
            if (layer.id == "hexes") {
                layer.setBaseOwner(baseId, factionId);
            }
        });
        var i = this.onBaseOwnershipChanged.length;
        while (i-- > 0)
            this.onBaseOwnershipChanged[i](baseId, factionId);
    };
    HeroMap.prototype.setContinent = function (continent) {
        var _this = this;
        var _a;
        if (continent.code == ((_a = this.continent) === null || _a === void 0 ? void 0 : _a.code))
            return;
        this.continent = continent;
        var mapSize = continent.map_size;
        var i = this.onContinentChanged.length;
        while (i-- > 0)
            this.onContinentChanged[i](continent);
        delete this.controller;
        i = this.viewport.children.length;
        while (i-- > 0)
            this.viewport.removeChild(this.viewport.children[i]);
        this.controller = new MapRenderer(this.viewport, mapSize);
        this.controller.onViewboxChanged.push(function (viewbox) {
            var i = _this.onViewboxChanged.length;
            while (i-- > 0)
                _this.onViewboxChanged[i](viewbox);
        });
        var terrainLayer = new TerrainLayer("terrain", mapSize);
        terrainLayer.setContinent(continent.code);
        terrainLayer.updateLayer();
        this.controller.addLayer(terrainLayer);
        var hexLayer = new HexLayer("hexes", mapSize);
        Api.getContinentOutlinesSvg(continent)
            .then(function (svg) {
            svg.classList.add("ps2map__base-hexes__svg");
            hexLayer.element.appendChild(svg);
            hexLayer.applyPolygonHoverFix(svg);
        });
        this.controller.addLayer(hexLayer);
        var namesLayer = new BaseNamesLayer("names", mapSize);
        Api.getBasesFromContinent(continent.id)
            .then(function (bases) {
            namesLayer.loadBaseInfo(bases);
            namesLayer.updateLayer();
        });
        this.controller.addLayer(namesLayer);
        hexLayer.onBaseHover.push(namesLayer.onBaseHover.bind(namesLayer));
        var bases = [];
        Api.getBasesFromContinent(continent.id).then(function (data) { return bases = data; });
        var regionName = document.getElementById("widget_base-info_name");
        var regionType = document.getElementById("widget_base-info_type");
        hexLayer.onBaseHover.push(function (baseId) {
            var i = bases.length;
            while (i-- > 0) {
                var base = bases[i];
                if (base.id == baseId) {
                    regionName.innerText = base.name;
                    regionType.innerText = base.type_name;
                    return;
                }
            }
        });
        this.continent = continent;
        if (this.baseUpdateIntervalId != undefined) {
            clearInterval(this.baseUpdateIntervalId);
        }
        this.updateBaseOwnership();
        this.baseUpdateIntervalId = setInterval(function () {
            _this.updateBaseOwnership();
        }, 5000);
    };
    HeroMap.prototype.updateBaseOwnership = function () {
        var _this = this;
        var _a;
        var server_id = 13;
        var continentId = (_a = this.continent) === null || _a === void 0 ? void 0 : _a.id;
        if (continentId == undefined)
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
    return HeroMap;
}());
var Minimap = (function () {
    function Minimap(element, continent) {
        if (continent === void 0) { continent = undefined; }
        this.mapSize = 0;
        this.baseOutlineSvg = undefined;
        this.onJumpTo = [];
        this.minimapHexAlpha = 0.5;
        this.polygons = new Map();
        this.element = element;
        this.element.classList.add("ps2map__minimap");
        this.cssSize = this.element.clientWidth;
        this.element.style.height = this.cssSize + "px";
        this.viewboxElement = document.createElement("div");
        this.viewboxElement.classList.add("ps2map__minimap__viewbox");
        this.element.appendChild(this.viewboxElement);
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
            var i = _this.onJumpTo.length;
            while (i-- > 0)
                _this.onJumpTo[i](target);
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
    Minimap.prototype.setViewbox = function (viewbox) {
        var mapSize = this.mapSize;
        var relViewbox = {
            top: (viewbox.top + mapSize * 0.5) / mapSize,
            left: (viewbox.left + mapSize * 0.5) / mapSize,
            bottom: (viewbox.bottom + mapSize * 0.5) / mapSize,
            right: (viewbox.right + mapSize * 0.5) / mapSize
        };
        var relHeight = relViewbox.top - relViewbox.bottom;
        var relWidth = relViewbox.right - relViewbox.left;
        var relLeft = relViewbox.left - 0.5;
        var relTop = relViewbox.bottom - 0.5;
        this.viewboxElement.style.height = this.cssSize * relHeight + "px";
        this.viewboxElement.style.width = this.cssSize * relWidth + "px";
        this.viewboxElement.style.left = this.cssSize * relLeft + "px";
        this.viewboxElement.style.bottom = this.cssSize * relTop + "px";
    };
    Minimap.prototype.setBaseOwnership = function (baseId, factionId) {
        var colours = {
            0: "rgba(0, 0, 0, " + this.minimapHexAlpha + ")",
            1: "rgba(160, 77, 183, " + this.minimapHexAlpha + ")",
            2: "rgba(81, 123, 204, " + this.minimapHexAlpha + ")",
            3: "rgba(226, 25, 25, " + this.minimapHexAlpha + ")",
            4: "rgba(255, 255, 255, " + this.minimapHexAlpha + ")"
        };
        var polygon = this.polygons.get(baseId);
        if (polygon)
            polygon.style.fill = colours[factionId];
    };
    Minimap.prototype.setContinent = function (continent) {
        var _this = this;
        this.mapSize = continent.map_size;
        this.element.style.backgroundImage =
            "url(" + Api.getMinimapImagePath(continent.code) + ")";
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
            while (i-- > 0)
                _this.polygons.set(parseInt(polygons[i].id), polygons[i]);
        });
    };
    return Minimap;
}());
document.addEventListener("DOMContentLoaded", function () {
    var viewport = document.getElementById("hero-map");
    if (viewport == null)
        throw "Unable to locate viewport element";
    if (viewport.tagName != "DIV")
        throw "Expected viewport of type \"DIV\" (got " + viewport.tagName + ")";
    var heroMap = new HeroMap(viewport);
    var minimapElement = document.getElementById("minimap");
    if (minimapElement == null)
        throw "Unable to locate minimap element.";
    if (minimapElement.tagName != "DIV")
        throw "Expected minimap of type \"DIV\" (got " + minimapElement.tagName + ")";
    var minimap = new Minimap(minimapElement);
    heroMap.onBaseOwnershipChanged.push(minimap.setBaseOwnership.bind(minimap));
    heroMap.onContinentChanged.push(minimap.setContinent.bind(minimap));
    heroMap.onViewboxChanged.push(minimap.setViewbox.bind(minimap));
    minimap.onJumpTo.push(heroMap.jumpTo.bind(heroMap));
    var dropdown = document.getElementById("continent-selector");
    Api.getContinentList()
        .then(function (continentList) {
        continentList.sort(function (a, b) { return b.name.localeCompare(a.name); });
        var i = continentList.length;
        while (i-- > 0) {
            var cont = continentList[i];
            var option = document.createElement("option");
            option.value = JSON.stringify(cont);
            option.text = cont.name;
            dropdown.appendChild(option);
        }
        heroMap.setContinent(JSON.parse(dropdown.value));
    });
    dropdown.addEventListener("change", function () {
        heroMap.setContinent(JSON.parse(dropdown.value));
    });
});
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
                name_1 += " " + baseInfo.type_name;
            element.innerText = "" + name_1;
            element.classList.add("ps2map__base-names__icon");
            element.style.left = this.mapSize * 0.5 + pos.x + "px";
            element.style.bottom = this.mapSize * 0.5 + pos.y + "px";
            element.classList.add("ps2map__base-names__icon__" + baseInfo.type_code);
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
    BaseNamesLayer.prototype.deferredLayerUpdate = function (viewbox, zoom) {
        var unzoom = 1 / zoom;
        var i = this.features.length;
        while (i-- > 0) {
            var feat = this.features[i];
            feat.element.style.transform = ("translate(-50%, calc(var(--ps2map__base-icon-size) * " + unzoom + ")) " +
                ("scale(" + unzoom + ", " + unzoom + ")"));
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
                tile.element.style.height = tile.element.style.width = (tileSize.toFixed() + "px");
                tile.element.style.left = pos.x * baseSize + "px";
                tile.element.style.bottom = pos.y * baseSize + "px";
                var url = this.generateTilePath(pos, this.lod);
                tile.element.style.backgroundImage = "url(" + url + ")";
                newTiles.push(tile);
            }
        this.tiles = newTiles;
    };
    TileLayer.prototype.tileIsVisible = function (tile, viewbox) {
        return Utils.rectanglesIntersect(tile.box, viewbox);
    };
    TileLayer.prototype.updateTileVisibility = function (viewbox) {
        var _this = this;
        var activeTiles = [];
        var i = this.tiles.length;
        while (i-- > 0) {
            var tile = this.tiles[i];
            if (this.tileIsVisible(tile, viewbox))
                activeTiles.push(tile.element);
        }
        requestAnimationFrame(function () {
            _this.element.innerHTML = "";
            i = activeTiles.length;
            while (i-- > 0)
                _this.element.append(activeTiles[i]);
        });
    };
    TileLayer.prototype.deferredLayerUpdate = function (viewbox, zoom) {
        this.updateTileVisibility(viewbox);
    };
    TileLayer.prototype.redraw = function (viewbox, zoom) {
        var targetX = (viewbox.right + viewbox.left) * 0.5;
        var targetY = (viewbox.top + viewbox.bottom) * 0.5;
        var halfMapSize = this.mapSize * 0.5;
        var offsetX = -halfMapSize;
        var offsetY = -halfMapSize;
        offsetX += (halfMapSize - targetX) * zoom;
        offsetY -= (halfMapSize - targetY) * zoom;
        this.element.style.transform = ("matrix(" + zoom + ", 0.0, 0.0, " + zoom + ", " + offsetX + ", " + offsetY + ")");
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
        this.element.style.backgroundImage = ("url(" + Api.getMinimapImagePath(code) + ")");
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
    TerrainLayer.prototype.deferredLayerUpdate = function (viewbox, zoom) {
        var newLod = this.calculateLod(zoom);
        if (newLod != this.lod) {
            this.lod = newLod;
            this.defineTiles(this.mapTilesPerAxis(this.mapSize, newLod));
        }
        this.updateTileVisibility(viewbox);
    };
    return TerrainLayer;
}(TileLayer));
