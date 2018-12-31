userObj.createVirginUserObject = function (userType)
{
    var obj;

    switch (userType)
    {
        case userObj.types.DEPTH_CONTOUR:
           obj = new userObj.DepthContour; break;

        default:
            obj = null;
    }

    return obj;
};

userObj.addObjectToCollectionRaw = function (collection, text)
{    
    collection.addFromJSON (text, userObj.createVirginUserObject);
};


userObj.AlertableObjectCollection = function (map)
{
    this.map = map;
    
    Cary.userObjects.ObjectCollection.apply (this);
};

userObj.AlertableObjectCollection.prototype = Object.create (Cary.userObjects.ObjectCollection.prototype);

userObj.AlertableObjectCollection.prototype.drawAllAlerted = function (objectCallbacks)
{
    var mapObj = Cary.checkMap (this.map);
    
    this.enumerate (function (object)
                    {
                        object.alert (mapObj, objectCallbacks);
                        /*if (!('drawer' in object))
                            object.drawer = object.createDrawer ();
                        else
                            object.drawer.undraw ();
                        
                        object.drawer.drawAlerted (mapObj, objectCallbacks);*/
                    });
};
