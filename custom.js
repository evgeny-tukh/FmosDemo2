var userLayerList = [];

function initAbris (map)
{
    map.addCustomBaseMap ('Abris', getAbrisTile, Cary.maps.baseMaps.CustomMap);
    
    function getAbrisTile (coord, zoom)
    {
        var X   = coord.x % (1 << zoom);  // wrap
        //var url = 'http://jecat.ru/vlad_demo7/tiles_new/get_abris_tiles.php?z=' + zoom.toString () + '&x=' + coord.x.toString () + '&y=' + coord.y.toString ();
        var url = 'http://localhost:8080/CaryTestPhp/tiles/get_abris_tiles.php?z=' + zoom.toString () + '&x=' + coord.x.toString () + '&y=' + coord.y.toString ();

        return url;
    }
}

function initLayers (map)
{
    loadLayerList (onLayerListLoaded);
    
    function onLayerListLoaded (layerList)
    {
        layerList.forEach (function (layerData)
                           {
                               var layer = new Cary.userObjects.ObjectCollection;

                               layer.deserialize (layerData, userObj.createVirginUserObject);

                               /*if (layer.id === 1526314863)
                               {
                                   depthAreas = layer;
                               }*/
                               
                               userLayerList.push (layer);
                           });
                           
        initDepthAreas (map);
    }
}

function initDepthAreas (map)
{
    depthAreas = null;
    
    userLayerList.forEach (checkLayer);
    
    function checkLayer (layer)
    {
        if (layer.name === 'Depth areas' || layer.name === 'Контуры глубины')
        {
            depthAreas = new userObj.AlertableObjectCollection (map);
            
            depthAreas.deserialize (layer.serialize (), userObj.createVirginUserObject);
        }
    }
    
    /*depthAreas = new userObj.AlertableObjectCollection (map);
    
    userObj.addObjectToCollectionRaw (depthAreas, '{"type":3,"name":"%u041F%u0440%u0438%u0447%u0430%u043B 1","properties":{"color":"black","lineStyle":1,"lineWidth":3,"fillColor":"blue","opacity":0.1},"userProps":{"maxDraught":9.6,"id":"b1"},"userType":3,"points":[{"lat":59.915896995092304,"lon":30.26071688826687},{"lat":59.91544247955058,"lon":30.25772568857701},{"lat":59.91587810478154,"lon":30.257436010003403},{"lat":59.91631910227826,"lon":30.2604615417722}]}');
    userObj.addObjectToCollectionRaw (depthAreas, '{"type":3,"name":"%u041F%u0440%u0438%u0447%u0430%u043B 2 - NE","properties":{"color":"black","lineStyle":1,"lineWidth":3,"fillColor":"blue","opacity":0.1},"userProps":{"maxDraught":9.5,"id":"b2-ne"},"userType":3,"points":[{"lat":59.91543985761631,"lon":30.25772354300625},{"lat":59.91510634506344,"lon":30.255585285783127},{"lat":59.91554466376001,"lon":30.255306336045578},{"lat":59.91587810478159,"lon":30.257436010003403}]}');
    userObj.addObjectToCollectionRaw (depthAreas, '{"type":3,"name":"%u041F%u0440%u0438%u0447%u0430%u043B 2 - SW","properties":{"color":"black","lineStyle":1,"lineWidth":3,"fillColor":"blue","opacity":0.1},"userProps":{"maxDraught":9.4,"id":"b2-sw"},"userType":3,"points":[{"lat":59.91510910128162,"lon":30.255588504630396},{"lat":59.91497189031547,"lon":30.2547162500623},{"lat":59.915407521722564,"lon":30.254448029160812},{"lat":59.91553659659709,"lon":30.255306336045578}]}');
    userObj.addObjectToCollectionRaw (depthAreas, '{"type":3,"name":"%u041F%u0440%u0438%u0447%u0430%u043B 3 - NE","properties":{"color":"black","lineStyle":1,"lineWidth":3,"fillColor":"blue","opacity":0.1},"userProps":{"maxDraught":9.5,"id":"b3-ne"},"userType":3,"points":[{"lat":59.91497426622727,"lon":30.254720966216723},{"lat":59.914962131709586,"lon":30.254641572731657},{"lat":59.91539776324476,"lon":30.254367987412138},{"lat":59.91541120857153,"lon":30.254448453682585}]}');
    userObj.addObjectToCollectionRaw (depthAreas, '{"type":3,"name":"%u041F%u0440%u0438%u0447%u0430%u043B 3 - SW","properties":{"color":"black","lineStyle":1,"lineWidth":3,"fillColor":"blue","opacity":0.1},"userProps":{"maxDraught":9.6,"id":"b3-sw"},"userType":3,"points":[{"lat":59.914963509824666,"lon":30.254640499946277},{"lat":59.91453456186557,"lon":30.251873533028288},{"lat":59.915010535495846,"lon":30.2518037955939},{"lat":59.915397763244734,"lon":30.254367987412138}]}');
    userObj.addObjectToCollectionRaw (depthAreas, '{"type":3,"name":"%u041F%u0440%u0438%u0447%u0430%u043B 4","properties":{"color":"black","lineStyle":1,"lineWidth":3,"fillColor":"blue","opacity":0.1},"userProps":{"maxDraught":9.6,"id":"b4"},"userType":3,"points":[{"lat":59.91452643397386,"lon":30.251881072100446},{"lat":59.9143959770326,"lon":30.249221393543053},{"lat":59.91489077640422,"lon":30.249124834018517},{"lat":59.91501447509468,"lon":30.25181240745144}]}');
    userObj.addObjectToCollectionRaw (depthAreas, '{"type":3,"name":"%u041F%u0440%u0438%u0447%u0430%u043B 5","properties":{"color":"black","lineStyle":1,"lineWidth":3,"fillColor":"blue","opacity":0.1},"userProps":{"maxDraught":9.8,"id":"b5"},"userType":3,"points":[{"lat":59.91439197687686,"lon":30.249225685175702},{"lat":59.914299167597186,"lon":30.24653918452816},{"lat":59.91478321195086,"lon":30.246464082675743},{"lat":59.9148934655111,"lon":30.249130198436546}]}');
    userObj.addObjectToCollectionRaw (depthAreas, '{"type":3,"name":"%u041F%u0440%u0438%u0447%u0430%u043B 6","properties":{"color":"black","lineStyle":1,"lineWidth":3,"fillColor":"blue","opacity":0.1},"userProps":{"maxDraught":9.6,"id":"b6"},"userType":3,"points":[{"lat":59.91434895049078,"lon":30.24653274732475},{"lat":59.91425883024907,"lon":30.243862339931297},{"lat":59.91470791662609,"lon":30.243808695751},{"lat":59.914788590181814,"lon":30.246474811511803}]}');
    userObj.addObjectToCollectionRaw (depthAreas, '{"type":3,"name":"%u041F%u0440%u0438%u0447%u0430%u043B 7","properties":{"color":"black","lineStyle":1,"lineWidth":3,"fillColor":"blue","opacity":0.1},"userProps":{"maxDraught":9.8,"id":"b7"},"userType":3,"points":[{"lat":59.914265586709064,"lon":30.243871995981976},{"lat":59.914137817910714,"lon":30.24080462165432},{"lat":59.91459766244956,"lon":30.240734884219933},{"lat":59.91470522750425,"lon":30.24381942458706}]}');
    userObj.addObjectToCollectionRaw (depthAreas, '{"type":3,"name":"%u041E%u041F-3","properties":{"color":"black","lineStyle":1,"lineWidth":3,"fillColor":"blue","opacity":0.3},"userProps":{"maxDraught":6.3,"id":"op3"},"userType":3,"points":[{"lat":59.88366484394495,"lon":30.224978201179965},{"lat":59.883623628238524,"lon":30.225486747943705},{"lat":59.88377974297087,"lon":30.225561849796122},{"lat":59.88370976059533,"lon":30.22610902043516},{"lat":59.88355902882442,"lon":30.226227037631816},{"lat":59.8834998125845,"lon":30.226817123615092},{"lat":59.88356979540215,"lon":30.22684931012327},{"lat":59.88351596247857,"lon":30.22735356541807},{"lat":59.883440596239105,"lon":30.22734283658201},{"lat":59.883494429284745,"lon":30.228544466220683},{"lat":59.88377974297087,"lon":30.228211872302836},{"lat":59.88420501731514,"lon":30.22489666196043},{"lat":59.88374744343125,"lon":30.22459625455076}]}');
    userObj.addObjectToCollectionRaw (depthAreas, '{"type":3,"name":"%u041E%u041F-4","properties":{"color":"black","lineStyle":1,"lineWidth":3,"fillColor":"blue","opacity":0.3},"userProps":{"maxDraught":5.2,"id":"op4"},"userType":3,"points":[{"lat":59.88237067006307,"lon":30.224767117277793},{"lat":59.88245374378645,"lon":30.224943070123686},{"lat":59.88363270253639,"lon":30.225479511926665},{"lat":59.88367038545969,"lon":30.224953798959746},{"lat":59.88375651769533,"lon":30.22458901853372},{"lat":59.88383726646351,"lon":30.223934559534086},{"lat":59.88263139778104,"lon":30.223183541009917}]}');

    depthAreas.name = 'Depth areas';*/
    
    //uploadLayerToServer (depthAreas.serialize (), function () {});
    //userObj.addObjectToCollectionRaw (depthAreas, '{"type":3,"name":"%u041F%u0430%u0440%u043E%u043C%u043D%u0430%u044F %u043F%u0440%u0438%u0441%u0442%u0430%u043D%u044C %u0432 %u043C%u043E%u0440%u0441%u043A%u043E%u043C %u043F%u043E%u0440%u0442%u0443 \"%u0411%u043E%u043B%u044C%u0448%u043E%u0439 %u043F%u043E%u0440%u0442 %u0421%u0430%u043D%u043A%u0442-%u041F%u0435%u0442%u0435%u0440%u0431%u0443%u0440%u0433\"","properties":{"color":"black","lineStyle":1,"lineWidth":3,"fillColor":"blue","opacity":0.1},"userProps":{"maxDraught":5.3,"id":"ferry"},"userType":3,"points":[{"lat":59.92672006085792,"lon":30.230763552582516},{"lat":59.925039858341826,"lon":30.236752388674518},{"lat":59.924647366451005,"lon":30.236355421740313},{"lat":59.926324833556244,"lon":30.23030435820283}]}');
}

function initDocuments ()
{
    loadSerializable ('dg_get.php?id=1526771890',
                      function (groupInfo)
                      {
                          officialInfo = new doc.DocumentGroup ();
                          
                          officialInfo.deserialize (groupInfo);
                      });
    /*var fleetAgencyOrders;
    var ministryOrders;
    var captainOrders;
    
    officialInfo = new doc.DocumentGroup ('Official information');
    
    fleetAgencyOrders = officialInfo.addGroup ('Распоряжения Росморречфлота');
    ministryOrders    = officialInfo.addGroup ('Распоряжения министерства транспорта РФ');
    captainOrders     = officialInfo.addGroup ('Распоряжения капитана порта');
    
    ministryOrders.addDocument ('Об утверждении Обязательных постановлений в морском порту "Большой порт Санкт-Петербург"', 'http://jecat.ru/vlad_demo7/docs/temp/about_mandatories_applying.pdf', new Date (2016, 12, 19));
    fleetAgencyOrders.addDocument ('Морской порт "Большой порт Санкт-Петербург"', 'http://jecat.ru/vlad_demo7/docs/temp/port_info.pdf', new Date (2017, 09, 28));
    captainOrders.addDocument ('Об установлении допустимых осадок судов на каналах, фарватерах и у причалов на акватории морского порта "Большой порт Санкт-Петербург"', 'http://jecat.ru/vlad_demo7/docs/temp/capt_order_depths.pdf', new Date (2018, 04, 5));
    
    uploadSerializableToServer ('dg_add.php', officialInfo.serialize (), function (group) {});*/
}