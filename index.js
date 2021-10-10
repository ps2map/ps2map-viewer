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
        this.zoomIndex = -1;
        this.viewHeight = viewportHeight;
        this.viewWidth = viewportWidth;
        var zoom = this.maxZoom;
        this.zoom = [this.maxZoom];
        var stepInverse = 1 / this.zoomStep;
        while (mapSize * zoom > Math.min(viewportHeight, viewportWidth)) {
            zoom *= stepInverse;
            this.zoom.push(Utils.roundTo(zoom, 2));
        }
        this.zoomIndex = this.zoom.length - 1;
        this.target = {
            x: mapSize * 0.5,
            y: mapSize * 0.5
        };
    }
    MapCamera.prototype.bumpZoomLevel = function (direction) {
        var index = this.zoomIndex;
        if (direction == 0)
            return index;
        if (direction < 0)
            index--;
        else if (direction > 0)
            index++;
        if (index < 0)
            index = 0;
        else if (index >= this.zoom.length)
            index = this.zoom.length - 1;
        this.zoomIndex = index;
        return this.zoom[index];
    };
    MapCamera.prototype.getViewbox = function () {
        var viewboxWidth = this.viewWidth / this.getZoom();
        var viewboxHeight = this.viewHeight / this.getZoom();
        return {
            top: this.target.y + viewboxHeight * 0.5,
            right: this.target.x + viewboxWidth * 0.5,
            bottom: this.target.y - viewboxHeight * 0.5,
            left: this.target.x - viewboxWidth * 0.5
        };
    };
    MapCamera.prototype.getZoom = function () {
        return this.zoom[this.zoomIndex];
    };
    MapCamera.prototype.zoomTo = function (direction, viewX, viewY) {
        if (viewX === void 0) { viewX = 0.5; }
        if (viewY === void 0) { viewY = 0.5; }
        var oldZoom = this.getZoom();
        var newZoom = this.bumpZoomLevel(direction);
        var pixelDeltaX = (this.viewWidth / oldZoom) - (this.viewWidth / newZoom);
        var pixelDeltaY = (this.viewHeight / oldZoom) - (this.viewHeight / newZoom);
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
        this.viewboxCallbacks = [];
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
    MapRenderer.prototype.getMapSize = function () {
        return this.mapSize;
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
        i = this.viewboxCallbacks.length;
        while (i-- > 0)
            this.viewboxCallbacks[i](viewbox);
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
                if (cont.id == continentId)
                    return cont;
            }
            throw "unknown continent ID: " + continentId;
        });
    }
    Api.getContinent = getContinent;
})(Api || (Api = {}));
var HexLayer = (function (_super) {
    __extends(HexLayer, _super);
    function HexLayer(id, mapSize) {
        var _this = _super.call(this, id, mapSize) || this;
        _this.polygonHoverCallbacks = [];
        _this.element.classList.add("ps2map__base-hexes");
        return _this;
    }
    HexLayer.prototype.svgFactory = function (data) {
        var factory = document.createElement("template");
        factory.innerHTML = data;
        var svg = factory.content.firstElementChild;
        if (!(svg instanceof SVGElement))
            throw "Unable to load contents from map hex SVG";
        svg.classList.add("ps2map__base-hexes__svg");
        this.applyPolygonHoverFix(svg);
        return svg;
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
                var i = _this.polygonHoverCallbacks.length;
                while (i-- > 0)
                    _this.polygonHoverCallbacks[i](parseInt(polygon.id), polygon);
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
var Minimap = (function () {
    function Minimap(element, mapSize, background) {
        this.jumpToCallbacks = [];
        this.mapSize = mapSize;
        this.element = element;
        this.cssSize = this.element.clientWidth;
        this.element.style.height = this.cssSize + "px";
        this.viewboxElement = document.createElement("div");
        this.element.appendChild(this.viewboxElement);
        this.element.style.backgroundImage = "url(" + background + ")";
        this.element.style.backgroundSize = "100%";
        this.element.addEventListener("mousedown", this.jumpToPosition.bind(this), {
            passive: true
        });
    }
    Minimap.prototype.configureMinimap = function (mapSize, background) {
        this.mapSize = mapSize;
        this.element.style.backgroundImage = "url(" + background + ")";
    };
    Minimap.prototype.jumpToPosition = function (evtDown) {
        var _this = this;
        var drag = Utils.rafDebounce(function (evtDrag) {
            var rect = _this.element.getBoundingClientRect();
            var relX = (evtDrag.clientX - rect.left) / (rect.width);
            var relY = (evtDrag.clientY - rect.top) / (rect.height);
            var target = {
                x: Math.round(relX * _this.mapSize),
                y: Math.round((1 - relY) * _this.mapSize)
            };
            var i = _this.jumpToCallbacks.length;
            while (i-- > 0)
                _this.jumpToCallbacks[i](target);
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
    return Minimap;
}());
var HeroMap = (function () {
    function HeroMap(viewport, initialContinentId, endpoint) {
        this.continentId = initialContinentId;
        var mapSize = 8192;
        this.controller = new MapRenderer(viewport, mapSize);
        var minimapElement = document.getElementById("minimap");
        if (minimapElement == null)
            throw "Unable to locate minimap element.";
        if (minimapElement.tagName != "DIV")
            throw "Minimap element must be a DIV";
        this.minimap = new Minimap(minimapElement, mapSize, "http://127.0.0.1:5000/static/minimap/esamir.jpg");
        this.controller.viewboxCallbacks.push(this.minimap.setViewbox.bind(this.minimap));
        this.minimap.jumpToCallbacks.push(this.controller.jumpTo.bind(this.controller));
        var terrainLayer = new TerrainLayer("terrain", mapSize);
        Api.getContinent(this.continentId).then(function (continent) {
            terrainLayer.setContinent(continent.code);
            terrainLayer.updateLayer();
        });
        this.controller.addLayer(terrainLayer);
        var hexLayer = new HexLayer("hexes", mapSize);
        Api.getContinent(this.continentId)
            .then(function (continent) {
            return fetch(endpoint + "/static/hex/" + continent.code + "-minimal.svg");
        })
            .then(function (data) {
            return data.text();
        })
            .then(function (payload) {
            hexLayer.element.appendChild(hexLayer.svgFactory(payload));
            hexLayer.updateLayer();
        });
        this.controller.addLayer(hexLayer);
        var namesLayer = new BaseNamesLayer("names", mapSize);
        Api.getBasesFromContinent(this.continentId)
            .then(function (bases) {
            namesLayer.loadBaseInfo(bases);
            namesLayer.updateLayer();
        });
        this.controller.addLayer(namesLayer);
        hexLayer.polygonHoverCallbacks.push(namesLayer.onBaseHover.bind(namesLayer));
        var bases = [];
        Api.getBasesFromContinent(this.continentId).then(function (data) { return bases = data; });
        var regionName = document.getElementById("widget_base-info_name");
        var regionType = document.getElementById("widget_base-info_type");
        hexLayer.polygonHoverCallbacks.push(function (baseId) {
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
    }
    return HeroMap;
}());
document.addEventListener("DOMContentLoaded", function () {
    var apiEndpoint = "http://127.0.0.1:5000";
    var continentId = 8;
    var viewport = document.getElementById("hero-map");
    if (viewport == null) {
        throw "Unable to locate viewport element";
    }
    if (viewport.tagName != "DIV") {
        throw "Expected viewport of type \"DIV\" (got " + viewport.tagName + ")";
    }
    new HeroMap(viewport, continentId, apiEndpoint);
});
var PointFeature = (function () {
    function PointFeature(pos, id, element, minZoom) {
        if (minZoom === void 0) { minZoom = 0; }
        this.visible = true;
        this.forceVisible = false;
        this.element = element;
        this.id = id;
        this.pos = pos;
        this.minZoom = minZoom;
    }
    return PointFeature;
}());
var PointLayer = (function (_super) {
    __extends(PointLayer, _super);
    function PointLayer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.features = [];
        return _this;
    }
    PointLayer.prototype.redraw = function (viewbox, zoom) {
        var targetX = (viewbox.right + viewbox.left) * 0.5;
        var targetY = (viewbox.top + viewbox.bottom) * 0.5;
        var halfMapSize = this.mapSize * 0.5;
        var offsetX = -halfMapSize;
        var offsetY = -halfMapSize;
        offsetX += (halfMapSize - targetX) * zoom;
        offsetY -= (halfMapSize - targetY) * zoom;
        this.element.style.transform = ("matrix(" + zoom + ", 0.0, 0.0, " + zoom + ", " + offsetX + ", " + offsetY + ")");
    };
    PointLayer.prototype.deferredLayerUpdate = function (viewbox, zoom) {
        var unzoom = 1 / zoom;
        var i = this.features.length;
        while (i-- > 0) {
            var feat = this.features[i];
            feat.element.style.transform = ("translate(-50%, calc(var(--ps2map__base-icon-size) * " + unzoom + ")) " +
                ("scale(" + unzoom + ", " + unzoom + ")"));
            if (!feat.forceVisible)
                if (zoom >= feat.minZoom)
                    feat.element.style.display = "block";
                else
                    feat.element.style.removeProperty("display");
            feat.visible = zoom >= feat.minZoom;
        }
    };
    return PointLayer;
}(MapLayer));
var BaseNamesLayer = (function (_super) {
    __extends(BaseNamesLayer, _super);
    function BaseNamesLayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseNamesLayer.prototype.getBaseIconFromType = function (typeId) {
        var fileName = "large-outpost";
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
            case 11:
                fileName = "containment-site";
                break;
            default:
                console.warn("Encountered unknown facility ID: " + typeId);
        }
        return fileName;
    };
    BaseNamesLayer.prototype.loadBaseInfo = function (bases) {
        var features = [];
        var i = bases.length;
        while (i-- > 0) {
            var baseInfo = bases[i];
            if (baseInfo.type_id == 0)
                continue;
            var pos = {
                x: baseInfo.map_pos[0],
                y: baseInfo.map_pos[1]
            };
            var element = document.createElement("div");
            var name_1 = baseInfo.name;
            if (baseInfo.type_id == 2 ||
                baseInfo.type_id == 3 ||
                baseInfo.type_id == 4) {
                name_1 += " " + baseInfo.type_name;
            }
            element.innerText = "" + name_1;
            element.classList.add("ps2map__base-names__icon");
            element.style.left = this.mapSize * 0.5 + pos.x + "px";
            element.style.bottom = this.mapSize * 0.5 + pos.y + "px";
            var typeName = this.getBaseIconFromType(baseInfo.type_id);
            element.classList.add("ps2map__base-names__icon__" + typeName);
            var minZoom = 0;
            if (typeName == "small-outpost")
                minZoom = 0.60;
            if (typeName == "large-outpost")
                minZoom = 0.45;
            features.push(new PointFeature(pos, baseInfo.id, element, minZoom));
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
                feat.element.style.display = "block";
            else
                feat.element.style.removeProperty("display");
        };
        element.addEventListener("mouseleave", leave);
        feat.forceVisible = true;
        feat.element.style.display = "block";
    };
    return BaseNamesLayer;
}(PointLayer));
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
        while (y-- > 0) {
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
        this.element.style.backgroundImage = ("url(http://127.0.0.1:5000/static/minimap/" + code + ".jpg)");
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
        var coordX = this.formatTileCoordinate(tileX);
        var coordY = this.formatTileCoordinate(tileY);
        var filename = this.code + "_tile_" + coordX + "_" + coordY + "_lod" + lod + ".jpeg";
        return "http://127.0.0.1:5000/static/tile/" + filename;
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
