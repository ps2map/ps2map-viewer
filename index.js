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
                var name = document.createElement("p");
                anchor.appendChild(name);
                name.setAttribute("class", "baseLabel");
                name.innerHTML = base.name;
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
        _this.lod = 3;
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
        var newLod = 0;
        if (zoomLevel >= 8) {
            newLod = 0;
        }
        else if (zoomLevel >= 4) {
            newLod = 1;
        }
        else if (zoomLevel >= 2) {
            newLod = 2;
        }
        else {
            newLod = 3;
        }
        this.lod = newLod;
        var numTiles = this.getNumTiles(newLod);
        document.documentElement.style.setProperty("--MAP-TILES-PER-AXIS", numTiles.toString());
        document.documentElement.style.setProperty("--MAP-SIZE", "calc(min(100vh, 100vw) * " + zoomLevel + ")");
        this.updateTiles();
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
        if (numTiles <= 1) {
            var tile = this.getMapTilePath(this.tileSet.toLowerCase(), this.lod, 0, 0);
            var str = "<div style=\"background-image: url(" + tile + ")\"></div>";
            var element = elementFromString(str);
            this.clear();
            this.layer.appendChild(element);
            return;
        }
        var newTiles = [];
        for (var y = numTiles / 2; y > -numTiles / 2 - 1; y--) {
            if (y == 0) {
                continue;
            }
            for (var x = -numTiles / 2; x < numTiles / 2 + 1; x++) {
                if (x == 0) {
                    continue;
                }
                var tile = this.getMapTilePath(this.tileSet.toLowerCase(), this.lod, x, y);
                var div = document.createElement("div");
                div.style.backgroundImage = "url(" + tile + ")";
                newTiles.push(div);
            }
        }
        this.clear();
        newTiles.forEach(function (tile) { return _this.layer.appendChild(tile); });
    };
    TileLayer.prototype.getNumTiles = function (lod) {
        if (lod < 0) {
            throw "lod must be greater than zero";
        }
        return Math.pow(2, (3 - lod));
    };
    TileLayer.prototype.getMapTilePath = function (tileName, lod, tileX, tileY) {
        return this.tileBaseUrl + (tileName + "/lod" + lod + "_" + tileX + "_" + tileY + ".png");
    };
    return TileLayer;
}(MapLayer));
function onDOMLoaded() {
    var initialContinentId = 6;
    var hexLayerDiv = document.getElementById("mapHexLayer");
    var hexLayer = new HexLayer(hexLayerDiv, initialContinentId);
    var tileLayerDiv = (document.getElementById("mapTextureLayer"));
    var tileUrl = "http://127.0.0.1:5000/static/map/";
    var tileLayer = new TileLayer(tileLayerDiv, initialContinentId, tileUrl);
    var baseNameLayerDiv = (document.getElementById("mapBaseNameLayer"));
    var baseNameLayer = new BaseNameLayer(baseNameLayerDiv, initialContinentId);
    var map = document.getElementById("map");
    var viewport = document.getElementById("viewport");
    var controller = new MapController(map, viewport, initialContinentId);
    controller.onZoom.push(tileLayer.onZoom.bind(tileLayer));
    var showHideHexLayer = (document.getElementById("showHexes"));
    showHideHexLayer.addEventListener("click", function () {
        return hexLayer.setVisibility(showHideHexLayer.checked);
    });
    var showHideTexturelayer = (document.getElementById("showMapTexture"));
    showHideTexturelayer.addEventListener("click", function () {
        return tileLayer.setVisibility(showHideTexturelayer.checked);
    });
    var showHideNameLayer = (document.getElementById("showBaseNames"));
    showHideNameLayer.addEventListener("click", function () {
        return baseNameLayer.setVisibility(showHideNameLayer.checked);
    });
    var asideBaseName = document.getElementById("baseName");
    hexLayer.baseHoverCallback = function (baseId) {
        getBase(baseId).then(function (base) {
            asideBaseName.textContent = base.name;
        });
    };
    var zoomInc = document.getElementById("zoomInc");
    zoomInc.addEventListener("click", function () {
        controller.incDecZoom(true);
    });
    var zoomDec = document.getElementById("zoomDec");
    zoomDec.addEventListener("click", function () {
        controller.incDecZoom(false);
    });
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
var zoomLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
var MapController = (function () {
    function MapController(map, viewport, initialContinentId) {
        this.onZoom = [];
        this.continentId = initialContinentId;
        this.map = map;
        this.viewport = viewport;
        this.zoomLevel = 1.0;
        map.addEventListener("mousedown", this.mousePan.bind(this));
        map.addEventListener("wheel", this.mouseWheel.bind(this), {
            passive: false
        });
    }
    MapController.prototype.incDecZoom = function (increase) {
        var index = zoomLevels.indexOf(this.zoomLevel);
        if (index < 0) {
            for (var i = 0; i < zoomLevels.length; i++) {
                var refLevel = zoomLevels[i];
                if (refLevel > this.zoomLevel) {
                    if (increase) {
                        this.zoomLevel = refLevel;
                        break;
                    }
                    this.zoomLevel = zoomLevels[i - 1];
                    break;
                }
            }
        }
        else {
            this.zoomLevel += increase ? 1 : -1;
        }
        this.constrainZoom();
        this.zoomDispatch();
    };
    MapController.prototype.mousePan = function (evtDown) {
        if (evtDown.button != 0) {
            return;
        }
        var viewport = this.viewport;
        var map = this.map;
        var initialScrollLeft = viewport.scrollLeft;
        var initialScrollTop = viewport.scrollTop;
        var nextScrollTargetLeft = 0.0;
        var nextScrollTargetTop = 0.0;
        var isScheduled = false;
        function mouseDrag(evtDrag) {
            var deltaX = evtDrag.clientX - evtDown.clientX;
            var deltaY = evtDrag.clientY - evtDown.clientY;
            nextScrollTargetLeft = initialScrollLeft - deltaX;
            nextScrollTargetTop = initialScrollTop - deltaY;
            function mousePanAnimationCallback(start) {
                viewport.scrollLeft = nextScrollTargetLeft;
                viewport.scrollTop = nextScrollTargetTop;
            }
            if (isScheduled) {
                requestAnimationFrame(mousePanAnimationCallback);
            }
            isScheduled = true;
        }
        function mouseUp() {
            map.removeEventListener("mousemove", mouseDrag);
            document.removeEventListener("mouseup", mouseUp);
        }
        map.addEventListener("mousemove", mouseDrag);
        document.addEventListener("mouseup", mouseUp);
    };
    MapController.prototype.constrainZoom = function () {
        if (this.zoomLevel < 1.0) {
            this.zoomLevel = 1.0;
        }
        else if (this.zoomLevel > 12.0) {
            this.zoomLevel = 12.0;
        }
    };
    MapController.prototype.mouseWheel = function (evt) {
        evt.preventDefault();
        this.zoomLevel -= 0.005 * evt.deltaY;
        this.constrainZoom();
        this.zoomDispatch();
    };
    MapController.prototype.zoomDispatch = function () {
        var _this = this;
        this.onZoom.forEach(function (callback) {
            callback(Math.round(_this.zoomLevel));
        });
    };
    return MapController;
}());
