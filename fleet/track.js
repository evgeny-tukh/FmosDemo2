function Track (vessel, begin, end)
{
    if (Cary.tools.isNothing (end))
        end = new Date ().getTime ();
    
    this.begin       = begin;
    this.end         = end;
    this.vessel      = vessel;
    this.points      = [];
    this.drawObjects = [];
}

Track.modes = { SIMPLIFIED: 0, FULL: 1 };

Track.prototype.load = function (desc)
{
    var instance = this;
    var onLoaded = 'onLoaded' in desc ? desc.onLoaded : null;
    var begin    = 'begin' in desc ? desc.begin : 0;
    var end      = 'end' in desc ? desc.end : Cary.tools.getTimestamp ();
    
    loadSerializable ('get_track.php?v=' + this.vessel.id.toString () + '&b=' + begin.toString () + '&e=' + end.toString (), onTrackLoaded);
    
    function onTrackLoaded (trackData)
    {
        instance.points = [];
        
        trackData.data.forEach (function (trackPoint)
                                {
                                    instance.points.push (trackPoint);
                                }, instance);
                                
        if (!Cary.tools.isNothing (onLoaded))
            onLoaded ();
    }
};