function Vessel ()
{
    this.drawObjects = [];
    
    /*this.imo        = null;
    this.code       = null;
    this.lat        = null;
    this.lon        = null;
    this.lastReport = null;*/
    
    Cary.Serializable.apply (this, arguments);
}

Vessel.prototype = Object.create (Cary.Serializable.prototype);

Vessel.prototype.keys = ['id', 'name', 'lat', 'lon', 'firstReport', 'lastReport', 'device', 'sensors'];

function Fleet ()
{
    this.vessels = [];
    
    Cary.Serializable.apply (this, arguments);
}

Fleet.prototype = Object.create (Cary.Serializable.prototype);

Fleet.prototype.serialize = function ()
{
    var result = Cary.Serializable.prototype.serialize.apply (this);
    
    result.vessels = [];
    
    this.vessels.forEach (function (vessel)
                          {
                              result.vessels.push (vessel.serialize ());
                          });
                          
    return result;
};

Fleet.prototype.deserialize = function (source)
{
    Cary.Serializable.prototype.deserialize.apply (this, arguments);
    
    this.vessels = [];
    
    source.vessels.forEach (addVessel, this);
    
    function addVessel (vesselSource)
    {
        var vessel = new Vessel (vesselSource.name);
        
        vessel.deserialize (vesselSource);
        
        this.vessels.push (vessel);
    };
};

