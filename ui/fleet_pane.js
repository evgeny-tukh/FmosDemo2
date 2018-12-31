function FleetPane (callbacks, options)
{
    var parent = document.getElementsByTagName ('body') [0];
    
    if (Cary.tools.isNothing (callbacks))
        callbacks = {};
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    this.options   = Cary.tools.isNothing (options) ? {} : options;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    Cary.ui.Window.apply (this, [{ position: { top: 0, right: 0, width: '400px', height: Cary.tools.int2pix (window.innerHeight - 20), absolute: true }, 
                                 title: stringTable.vessels, parent: parent }]);
}

FleetPane.prototype = Object.create (Cary.ui.Window.prototype);

FleetPane.prototype.onInitialize = function ()
{
    var columns    = [{ title: stringTable.name, width: 180, onItemClick: onSelectVessel },
                      { title: stringTable.lastReport, width: 160, onItemClick: onSelectVessel }];
    var vesselList = new Cary.ui.ListView ({ parent: this.client, columns: columns, visible: true, onItemClick: onSelectVessel },
                                            { position: 'absolute', top: 5, left: 5, width: 400, height: 300 });
    var dataPane   = new DataPane ({}, { parent: this.client });

    fleet.vessels.forEach (function (vessel)
                           {
                               var lastReport;
                               
                               if (vessel.lastReport)
                                   lastReport = Cary.tools.formatDateTime (vessel.lastReport);
                               else
                                   lastReport = stringTable.noData;
                               
                               vesselList.addItem ([vessel.name, lastReport], vessel);
                           });

    dataPane.show ();
    
    function removeOldTrack (curSelection)
    {
        var i, count;
        
        // Make sure that the only track is shown at the moment
        for (i = 0, count = vesselList.getItemCount (); i < count; ++ i)
        {
            if (i !== curSelection)
            {
                var curVessel =  vesselList.getItemData (i);

                if (curVessel.track)
                {
                    undrawTrack (curVessel.track, false);

                    curVessel.track = null;
                }
            }
        }
    }
    
    function onSwitchVesselTrack (row)
    {
        var vessel = vesselList.getItemData (row);

        removeOldTrack (row);
        
        vessel.track = new Track (vessel);

        vessel.track.load ({ begin: beginTime, end: endTime, onLoaded: onLoaded });

        function onLoaded ()
        {
            drawTrack (vessel.track, Track.modes.SIMPLIFIED);
            showTrack (vessel.track);
        }
    }
    
    function onSelectVessel (row, column, item)
    {
        var vessel = vesselList.getItemData (row);
        
        dataPane.setVessel (vessel);
        
        if (!vessel.lastReport)
        {
            removeOldTrack (row);
            
            new Cary.ui.MessageBox ({ title: stringTable.error, text: stringTable.noTrackData }); return;
        }
        
        map.setCenter (vessel.lat, vessel.lon);
        
        onSwitchVesselTrack (row, column, item);
    }
};

FleetPane.prototype.queryClose = function ()
{
    this.hide ();
    
    return false;
};

