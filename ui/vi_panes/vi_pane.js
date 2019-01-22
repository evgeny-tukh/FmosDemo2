function VesselInfoPane (vessel, slider, options)
{
    var parent = 'parent' in options ? options.parent : document.getElementsByTagName ('body') [0];
    
    this.vessel = vessel;
    this.slider = slider;
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    this.options   = Cary.tools.isNothing (options) ? {} : options;
    this.callbacks = {};
    
    Cary.ui.Window.apply (this, [{ position: { left: 0, top: 45, width: '100%', height: /*225*/185, absolute: true }, paneMode: true, parent: parent, noCloseIcon: true }]);
}

VesselInfoPane.prototype = Object.create (Cary.ui.Window.prototype);

VesselInfoPane.prototype.queryClose = function ()
{
    return false;
};

VesselInfoPane.prototype.setVessel = function (vessel)
{
    this.vessel = vessel;
};

VesselInfoPane.prototype.getCurTime = function ()
{
    return parseInt (this.slider.getValue ());
};