var modes           = { REGULAR: 1, PLOTTING: 2, WAIT_FOR_ICON: 3, WAIT_FOR_CLICK: 4 };
var plottingActions = { NEW_POLYLINE: 0, NEW_POLYGON: 1, NEW_ICON: 2, NEW_ICON_GROUP: 3, NEW_BERTH: 5, NEW_DEPTH_CONTOUR: 6 };
var globalInterface = {};
var depthAreas;
var officialInfo;
var objectEditorPane;
var map;
var posInd;
var stringTable;
var fleet;
var firstReport;
var lastReport;
var endTime;
var beginTime;
var timeInterval;

function init ()
{
    var settingsButton;
    var zoomInButton;
    var zoomOutButton;
    var settingsPane;
    var fleetButton;
    var logoutButton;
    var calendarButton;
    var fleetPane = null;
    var mapDiv = document.getElementById ("map");
    var mode   = modes.REGULAR;
    var activeSubMenu = null;
    var aisTargetTable;
    var aisTargetLayerUpdater;

    endTime      = Cary.tools.getTimestamp ();
    beginTime    = endTime - 365 * 24 * 3600000;
    timeInterval = 3600;
    
    new SessionWatchdog ();

    stringTable = new strings.StringTable ('russian.st', 2000);
    
    // Load a fleet
    loadSerializable ('get_vessels.php', onFleetLoaded);
    
    //globalInterface.waitForUserIcon            = waitForUserIcon;
    //globalInterface.waitForUserClick           = waitForUserClick;
    //globalInterface.addUserIcon                = addUserIcon;
    globalInterface.activateRegularContextMenu = activateRegularContextMenu;
    //globalInterface.onSave                     = null;
    
    map = new Cary.Map ();

    //initLayers (map);
    //initDepthAreas (map);
    //initAbris (map);
    
    Cary.settings.activeItemClass   = 'activeItem';
    Cary.settings.selectedItemClass = 'selectedItem';
    
    Cary.tools.createCssClass (Cary.settings.activeItemClass, { color: 'black' });
    Cary.tools.createCssClass (Cary.settings.activeItemClass + ':hover', { color: 'blue' });
    Cary.tools.createCssClass (Cary.settings.selectedItemClass, { color: 'red', 'font-weight': 'bold' });
    
    map.attach (mapDiv);
    map.createMap ();
    map.setupPredefinedBaseMaps ();
    
    posInd = map.createPosIndicator (google.maps.ControlPosition.TOP_CENTER);
    
    posInd.setText ('hehehe');
    posInd.setValue (10, 20);

    map.addEventListener ('mousemove', onMouseMove);
    map.addEventListener ('mouseover', function () { posInd.show (true); });
    map.addEventListener ('mouseout', function () { posInd.show (false); });
    
    mapDiv.addEventListener ('contextmenu',
                             function (event)
                             {
                                 switch (mode)
                                 {
                                     case modes.REGULAR:
                                         activateRegularContextMenu (event); break;
                                         
                                     case modes.PLOTTING:
                                         activatePlottingContextMenu (event); break;
                                 }
                             });
    
    settingsButton = map.createImgButton (google.maps.ControlPosition.TOP_LEFT, 'res/settings26.png', { onClick: showSettingsPane });
    logoutButton   = map.createImgButton (google.maps.ControlPosition.TOP_RIGHT, 'res/exit26.png', { onClick: logout });
    fleetButton    = map.createImgButton (google.maps.ControlPosition.TOP_RIGHT, 'res/tug26.png', { onClick: showFleetPane });
    calendarButton = map.createImgButton (google.maps.ControlPosition.TOP_RIGHT, 'res/calendar26.png', { onClick: setTimeFrame });
    zoomInButton   = map.createImgButton (google.maps.ControlPosition.LEFT_BOTTOM, 'res/zoom-in-20.png', { onClick: function () { map.zoomIn (); } });
    zoomOutButton  = map.createImgButton (google.maps.ControlPosition.LEFT_BOTTOM, 'res/zoom-out-20.png', { onClick: function () { map.zoomOut (); } });
    settingsPane   = map.createGMPanel (google.maps.ControlPosition.TOP_LEFT, { onInit: onInitSettingsPane });
    
    settingsPane.setSlidingMode (Cary.controls.GMPanel.slidingMode.LEFT);
    settingsButton.show ();
    zoomInButton.show ();
    zoomOutButton.show ();
    fleetButton.show ();
    logoutButton.show ();
    calendarButton.show ();

    aisTargetTable        = new AISTargetTable (map);
    aisTargetLayerUpdater = new AISTargetLayerUpdater (map);
    
    aisTargetLayerUpdater.start (true);
    
    setTimeout (function ()
                {
                    aisTargetTable.onTargetClick = function (target)
                                                   {
                                                   };
                }, 1000);
    
    function getMaximalTimFrame ()
    {
        firstReport = Cary.tools.getTimestamp (),
        lastReport  = 0;
    
        fleet.vessels.forEach (function (vessel)
                               {
                                   if (vessel.firstReport && vessel.firstReport < firstReport)
                                       firstReport = vessel.firstReport;
                                   
                                   if (vessel.lastReport && vessel.lastReport > lastReport)
                                       lastReport = vessel.lastReport;
                               });
                               
        beginTime = firstReport;
        endTime   = lastReport;
    }
    
    function onFleetLoaded (fleetData)
    {
        var source = { vessels: [] };
        
        fleet = new Fleet ();
    
        fleetData.forEach (function (vesselData) { source.vessels.push (vesselData); });
        
        fleet.deserialize (source);
        
        getMaximalTimFrame ();
        
        Cary.tools.WaitForCondition (function ()
                                     {
                                         return stringTable.loaded;
                                     },
                                     function ()
                                     {
                                         fleetPane = new FleetPane ();
                                     });
        
        map.waitForMap (function () { drawFleet (); });
    }
    
    function activateRegularContextMenu (event, oeAction)
    {
        var offX    = 'offsetX' in event ? event.offsetX : event.pixel.x;
        var offY    = 'offsetY' in event ? event.offsetY : event.pixel.y;
        var oeItems = [/*{ text: stringTable.newPolyline, onClick: function (item, object) { plotPolyline (item, object, Cary.userObjects.objectTypes.POLYLINE); } }, 
                       { text: stringTable.newPolygon, onClick: function (item, object) { plotPolyline (item, object, Cary.userObjects.objectTypes.POLYGON); } }, 
                       { text: stringTable.newIcon, onClick: insertIcon },
                       { text: stringTable.newIconGrp, onClick: plotIconGroup },
                       { separator: true },
                       { text: stringTable.newBerth, onClick: plotBerth }, 
                       { text: stringTable.newDepthCnt, onClick: plotDepthContour, onSave: globalInterface.addNewDepthContour }, 
                       { separator: true },
                       { text: stringTable.objList }, { separator: true }, 
                       { text: stringTable.loadUserObj, onClick: loadUserObject }, 
                       { text: stringTable.loadEditUserObj, onClick: loadEditUserObject }, 
                       { separator: true },
                       { text: stringTable.backToPrevMenu,  onClick: function (item) { item.menu.close (); } }*/];
        var menu;
                
        if (Cary.tools.isNothing (oeAction))
        {
            globalInterface.getStartPos = null;
            globalInterface.onSave      = null;
            
            menu = map.createMapMenu ({ x: offX, y: offY },
                                      [{ text: stringTable.getWeatherPredHere }, { text: stringTable.objEditor, subItems: oeItems }], { title: stringTable.atThisPoint, width: '200px' });

            Cary.tools.cancelMouseEvent (event);
        }
        else
        {
            globalInterface.getStartPos = function () { return { x: offX, y: offY }; };
            //globalInterface.onSave      = 'onSave' in oeItems [oeAction] ? oeItems [oeAction].onSave : null;
            
            oeItems [oeAction].onClick ();
        }
    }
    
    function onMouseMove (event)
    {
        posInd.onMouseEvent (event);
    }

    function showFleetPane ()
    {
        if (fleetPane)
            fleetPane.show ();
    }
    
    function setTimeFrame ()
    {
        new TimeSettingsWnd ({ onOk: onOk }, firstReport, lastReport, timeInterval);
        
        function onOk (from, to, period)
        {
            beginTime    = from;
            endTime      = to;
            timeInterval = period;
        }
    }
    
    function logout ()
    {
        Cary.tools.sendRequest ({ url: 'logout.php', method: Cary.tools.methods.get, content: Cary.tools.contentTypes.plainText });

        window.location = 'login.html';
    }
    
    function showSettingsPane ()
    {
        map.lock (closeAllMenus);
        
        settingsButton.show (false);
        settingsPane.slideIn ();
        
        function closeAllMenus ()
        {
            if (activeSubMenu !== null)
                activeSubMenu.show (false);
            
            settingsPane.unlock ();
            settingsPane.slideOut ();
            
            map.unlock ();
            settingsButton.show (true);
        }
    }
        
    function onInitSettingsPane (panel)
    {
        var baseMapMenu;
        var overlaysMenu;
        
        baseMapMenu  = map.createGMPanel (google.maps.ControlPosition.TOP_LEFT, { onInit: onInitBaseMapMenu, height: 'fit-content', onOpen: setActiveSubMenu, onClose: resetActiveSubMenu });
        overlaysMenu = map.createGMPanel (google.maps.ControlPosition.TOP_LEFT, { onInit: onInitOverlaysMenu, height: 'fit-content', onOpen: setActiveSubMenu, onClose: resetActiveSubMenu });
        
        baseMapMenu.container.style.marginLeft  = '330px';//'280px';
        overlaysMenu.container.style.marginLeft = '330px';// '280px';
        
        map.addEventListener ('zoom_changed', 
                              function ()
                              {
                                  // Some magic here
                                  baseMapMenu.container.style.marginLeft  = '280px';
                                  overlaysMenu.container.style.marginLeft = '280px';
                              });
        
        map.addEventListener ('maptypeid_changed', 
                              function ()
                              {
                                  // Some magic here
                                  baseMapMenu.container.style.marginLeft  = '330px';
                                  overlaysMenu.container.style.marginLeft = '330px';
                                  
                                  map.addEventListener ('tilesloaded', function () { userObj.realertAreas (); });
                              });
        
        panel.addTitle (stringTable.settings, null, function () { settingsButton.show (true); map.unlock (); });
        panel.addSubMenu ({ text: stringTable.baseMap, className: 'settingsPaneSubMenu', onClick: function () { baseMapMenu.show (); } });
        panel.addSubMenu ({ text: stringTable.overlays, className: 'settingsPaneSubMenu', onClick: function () { overlaysMenu.show (); } });
        
        function setActiveSubMenu (subMenu)
        {
            activeSubMenu = subMenu;
        }
        
        function resetActiveSubMenu (subMenu)
        {
            activeSubMenu = null;
        }
        
        function onInitBaseMapMenu (menu)
        {
            var items = [];
            
            menu.addTitle (stringTable.baseMap, null, function () { panel.unlock (); });
            
            addItem ('Roadmap', Cary.maps.baseMaps.RoadMap);
            addItem ('Terrain', Cary.maps.baseMaps.Terrain);
            addItem ('Satellite', Cary.maps.baseMaps.Satellite);
            addItem ('Hybrid', Cary.maps.baseMaps.Hybrid);
            addItem ('Navionics', Cary.maps.baseMaps.Navionics);
            addItem ('Abris', Cary.maps.baseMaps.CustomMap);
            addItem ('OpenStreet', Cary.maps.baseMaps.OpenStreet);
            addItem ('Sentinel-2', Cary.maps.baseMaps.Sentinel2);
            addItem ('Landsat 8', Cary.maps.baseMaps.Landsat8);
            
            function addItem (itemName, mapFlag)
            {
                items.push (menu.addItem (itemName, {}, function (item) { selectBaseMap (item); }, { checked: itemName === 'Roadmap', data: map.getBaseMapIndex (mapFlag) }));
            }
            
            function selectBaseMap (activeItem)
            {
                baseMapMenu.show (false);
                //hideSettingsPane ();
                panel.unlock ();
                
                items.forEach (function (item)
                               {
                                   menu.checkItem (item, item === activeItem);
                               });
                
                selectMapType (activeItem.data);
            }
        }
        
        function onInitOverlaysMenu (menu)
        {
            var items = [];
            
            menu.addTitle (stringTable.overlays, null, function () { panel.unlock (); });
            
            addItem ('OpenSea', Cary.maps.overlayMaps.Layers.OpenSea);
            addItem ('OpenWeather (Temperature)', Cary.maps.overlayMaps.Layers.OpenWeatherTemp);
            addItem ('OpenWeather (Precipitation)', Cary.maps.overlayMaps.Layers.OpenWeatherPrecipitation);
            addItem ('OpenWeather (Wind)', Cary.maps.overlayMaps.Layers.OpenWeatherWind);
            addItem ('OpenWeather (Pressure)', Cary.maps.overlayMaps.Layers.OpenWeatherPressure);
            addItem ('OpenWeather (Clouds)', Cary.maps.overlayMaps.Layers.OpenWeatherClouds);
            addItemCB (stringTable.aisTargets, toggleAISTargets);
            addItem (stringTable.aisTargetsMT, Cary.maps.overlayMaps.Layers.AISTargetsMT);
            
            function toggleAISTargets ()
            {
                if (aisTargetTable.started ())
                    aisTargetTable.stop ();
                else
                    aisTargetTable.start (true);
            }
            
            function addItemCB (itemName, callback)
            {
                items.push (menu.addItem (itemName, { textWidth: '240px', backgroundColor: 'yellow' },
                            function (item)
                            {
                                menu.checkItem (item, !menu.isItemChecked (item));
                                
                                if (callback)
                                    callback ();
                            }, 
                            { checked: false, data: null, textWidth: 240 }));
            }
            
            function addItem (itemName, mapFlag)
            {
                items.push (menu.addItem (itemName, { textWidth: '240px', backgroundColor: 'yellow' },
                            function (item)
                            {
                                var show = !menu.isItemChecked (item);
                                
                                map.showOverlayLayer (map.getOverlayIndex (item.data), show);
                                
                                menu.checkItem (item, show);
                            }, 
                            { checked: false, data: mapFlag, textWidth: 240 }));
            }
        }
    }
    
    function waitForUserClick (onClick)
    {
        if (!Cary.tools.isNothing (onClick))
        {
            map.addEventListener ('click', onClick, true);

            mode = modes.WAIT_FOR_CLICK;
        }
    }
}

function addBaseMap (baseMap)
{
    var select = document.getElementById ('baseMap');
    var option = document.createElement ('option');

    option.text = baseMap.getName ();

    select.add (option);
}

function selectMapType (index)
{
    map.selectBaseMap (index);
}

function showOverlay (index, show)
{
    map.showOverlayLayer (index, show);
}

function drawFleet (show)
{
    var minLat = 90.0,
        minLon = 180.0,
        maxLat = -90.0,
        maxLon = -180.0;

    if (Cary.tools.isNothing (show))
        show = true;
    
    fleet.vessels.forEach (drawVessel);

    if (show)
        map.setBounds ({ east: maxLon, west: minLon, north: maxLat, south: minLat }, 10);
    
    function drawVessel (vessel)
    {
        var noMarker = Cary.tools.isNothing (vessel.drawObjects.marker);
        
        if (vessel.lat && vessel.lon)
        {
            if (vessel.lat > maxLat)
                maxLat = vessel.lat;

            if (vessel.lat < minLat)
                minLat = vessel.lat;

            if (vessel.lon > maxLon)
                maxLon = vessel.lon;

            if (vessel.lon < minLon)
                minLon = vessel.lon;
        }
        else
        {
            return;
        }
        
        if (show && noMarker)
        {
            var now          = new Date ().getTime ();
            var reportOk     = vessel.lastReport && (now - vessel.lastReport) < 7200000;
            var posReportOk  = vessel.lastPosReport && (now - vessel.lastPosReport) < 7200000;
            var fuelReportOk = vessel.lastFuelReport && (now - vessel.lastFuelReport) < 7200000;
            var iconFile;
            
            if (!reportOk)
                iconFile = 'res/tug32r.png';
            else if (!posReportOk || !fuelReportOk)
                iconFile = 'res/tug32y.png';
            else
                iconFile = 'res/tug32g.png';
                
            vessel.drawObjects.marker = map.createMarker (vessel.lat, vessel.lon, { title: vessel.name, icon: iconFile, iconAnchor: { x: 16, y: 16 }, size: { x: 32, y: 32 }});
            
            vessel.drawObjects.marker.vessel = vessel;
            
            vessel.drawObjects.marker.addListener ('click', getVesselInfo);
        }
        
        if (!show && !noMarker)
        {
            vessel.drawObjects.marker.setMap (null);
            
            vessel.drawObjects.marker = null;
        }
    }
    
    function getVesselInfo ()
    {
        new VesselInfo (this.vessel);
        /*var message = this.vessel.name + '\n\n' +
                      'Последний отчет: ' + formatReportTime (this.vessel.lastReport) + '\n' +
                      'Последний отчет о позиции: ' + formatReportTime (this.vessel.lastPosReport) + '\n' +
                      'Последний отчет о топливе: ' + formatReportTime (this.vessel.lastFuelReport) + '\n' +
                      'Всего топлива: ' + (this.vessel.fuelAmount * 0.86).toFixed (1) + 'тонн';
              
        alert (message);
        
        function formatReportTime (time)
        {
            return time > 0 ? Cary.tools.formatDateTime (time) : 'никогда';
        }*/
    }
}

function showTrack (track, show)
{
    var prevClientPoint = null;
    var mapDiv  = document.getElementById ('map');
    
    if (Cary.tools.isNothing (show))
        show = true;
    
    track.drawObjects.forEach (function (object)
                               {
                                   // Do not show markers too often
                                   if (show && 'point' in object)
                                   {
                                       var clientPoint = map.geoToClient (new google.maps.LatLng (object.point.lat, object.point.lon), mapDiv);
                                       
                                       if (prevClientPoint !== null)
                                       {
                                            var diffX = Math.abs (clientPoint.x - prevClientPoint.x);
                                            var diffY = Math.abs (clientPoint.y - prevClientPoint.y);

                                            if (diffX < 20 && diffY < 20 && object.index < (track.points.length - 1))
                                                return;
                                       }
                                       
                                        prevClientPoint = clientPoint;
                                   }
                                   else
                                   {
                                       prevClientPoint = null;
                                   }
                                   
                                   object.setVisible (show);
                               });
}

function undrawTrack (track)
{
    track.drawObjects.forEach (function (object) { object.setMap (null); });

    track.drawObjects = [];
}

function drawTrack (track, mode)
{
    var curTime;
    var parts     = map.createPolylineEx (track.points, { visible: false });
    var curTime   = 0;
    var markerOpt = { shape: google.maps.SymbolPath.CIRCLE, color: 'black', scale: 3, clickable: true, visible: false };
    var marker;

    parts.forEach (function (part) { track.drawObjects.push (part); });
    //track.drawObjects.push (map.createPolyline (track.points));

    if (mode === Track.modes.FULL)
        track.points.forEach (addPoint);

    function addPoint (point, index)
    {
        if (curTime > 0 && (point.time - curTime) >= 7200000)
        {    
            curTime = point.time; return;
        }

        if (!point.lat || !point.lon || Math.abs (point.lat) < 0.001 && Math.abs (point.lon) < 0.001)
            return;

        markerOpt.title = Cary.tools.formatDateTime (point.time);

        markerOpt.color = point.fuelAmount ? 'green' : 'red';
        
        marker = map.createMarker (point.lat, point.lon, markerOpt);

        marker.addListener ('click', onMarkerClick);

        marker.point = point;
        marker.index = index;

        track.drawObjects.push (marker);

        curTime = point.time;
    }

    function onMarkerClick ()
    {
        var msg = Cary.tools.formatDateTime (this.point.time) + '\n\nЗапас топлива: ' + (this.point.fuelAmount ? this.point.fuelAmount.toFixed (1) + 'т' : 'N/A') + '\n\n';

        if (this.point.fuelAmount)
            Cary.tools.sendRequest ({ url: 'requests/gettanks.php?d=' + this.point.source.toString (), method: 'get', content: Cary.tools.contentTypes.plainText, onLoad: onLoad, 
                                      resType: Cary.tools.resTypes.json });
        else
            alert (msg);
        
        function onLoad (data)
        {
            data.data.forEach (function (item)
                               {
                                   msg += 'Танк ' + item.tank + ': ' + item.volume.toFixed (1) + 'm³ (' + (item.volume * 0.86).toFixed (1) + 'т)\n';
                               });

            alert (msg);
        }
    }
}