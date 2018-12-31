userObj.AlertableContour = function (name, points)
{
    var properties = { color: 'black', lineStyle: Cary.userObjects.lineStyles.SOLID, lineWidth: 3, fillColor: 'blue', opacity: 0.3 };
    
    Cary.userObjects.UserPolygon.apply (this, [name, points, properties]);

    this.userType = userObj.types.ALERTABLE_CONTOUR;
    this.drawMode = userObj.AlertableContour.drawModes.USUAL;
};

userObj.AlertableContour.prototype = Object.create (Cary.userObjects.UserPolygon.prototype);

userObj.types.ALERTABLE_CONTOUR = 2;
userObj.types.DEPTH_CONTOUR     = 3;

userObj.AlertableContour.drawModes = { USUAL: 0, ALERTED: 1 };

userObj.AlertableContour.prototype.createDrawer = function ()
{
    return new userObj.drawers.DepthContourDrawer (this);
};

userObj.AlertableContour.prototype.alert = function (mapObj, objectCallbacks)
{
    var instance = this;
    
    this.timer        = setInterval (checkDrawMode, 500);
    this.lastDrawMode = userObj.AlertableContour.drawModes.ALERTED;
    this.drawMode     = userObj.AlertableContour.drawModes.ALERTED;
    this.drawer       = this.createDrawer ();
    
    this.drawer.drawAlerted (mapObj, objectCallbacks);
    
    function checkDrawMode ()
    {
        if (instance.drawMode !== instance.lastDrawMode)
        {
            instance.drawer.undraw ();
            
            switch (instance.drawMode)
            {
                case userObj.AlertableContour.drawModes.USUAL:
                    instance.drawer.draw (mapObj); break;
                    
                case userObj.AlertableContour.drawModes.ALERTED:
                    instance.drawer.drawAlerted (mapObj); break;
            }
            
            instance.lastDrawMode = instance.drawMode;
        }
        else if (instance.selected)
        {
            instance.drawer.flash ();
        }
    }
};

userObj.DepthContour = function (name, points, maxDraught, id)
{
    var properties = { color: 'black', lineStyle: Cary.userObjects.lineStyles.SOLID, lineWidth: 3, fillColor: 'blue', opacity: 0.3 };
    
    userObj.AlertableContour.apply (this, [name, points, properties]);

    this.userType = userObj.types.DEPTH_CONTOUR;
    
    this.userProps.maxDraught = Cary.tools.isNothing (maxDraught) ? 10 : maxDraught;
    this.userProps.id         = Cary.tools.isNothing (id) ? 'dc' : id;
};

userObj.DepthContour.prototype = Object.create (userObj.AlertableContour.prototype);

userObj.DepthContour.prototype.getInfo = function ()
{
    var info = Cary.userObjects.UserPolygon.prototype.getInfo.apply (this);
    
    info ['Max draught'] = this.userProps.maxDraught.toFixed (1);
    
    return info;
};

userObj.DepthContour.prototype.getUserTypeName = function ()
{
    return 'Контур глубины';
};

userObj.DepthContour.prototype.getEdgeColor = function ()
{
    var result;
    
    if ('maxDraught' in this.userProps)
    {
        if (this.userProps.maxDraught <= 9.4)
            result = 'red';
        else if (this.userProps.maxDraught <= 9.7)
            result = 'yellow';
        else
            result = 'green';
    }
    else
    {
        result = Cary.userObjects.UserPolygon.prototype.getFillColor.apply (this, arguments);
    }
    
    return result;
};

userObj.DepthContour.prototype.getFillColor = function ()
{
    var result;
    
    if ('maxDraught' in this.userProps)
    {
        if (this.userProps.maxDraught <= 9.4)
            result = 'red';
        else if (this.userProps.maxDraught <= 9.7)
            result = 'yellow';
        else
            result = 'green';
    }
    else
    {
        result = Cary.userObjects.UserPolygon.prototype.getFillColor.apply (this, arguments);
    }
    
    return result;
};

userObj.DepthContour.prototype.beforeShowHide = function (show)
{
    if (show && !Cary.tools.isNothing (this.drawer))
        this.drawer.undraw ();
};

userObj.DepthContour.prototype.deselect = function ()
{
    this.selected = false;
    
    this.drawer.stopFlashing ();    
};

userObj.DepthContour.prototype.deserialize = function (source)
{
    Cary.userObjects.MultiPointUserObject.prototype.deserialize.apply (this, arguments);
    
    if (typeof (this.userProps.maxDraught) === 'string')
        this.userProps.maxDraught = parseFloat (this.userProps.maxDraught);
};
