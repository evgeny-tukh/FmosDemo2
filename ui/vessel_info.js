function VesselInfo (vessel, parent, callbacks)
{
    this.vessel    = vessel;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    map.setCenter (vessel.lat, vessel.lon);
    
    if (Cary.tools.isNothing (parent))
        parent = document.getElementsByTagName ('body') [0];
    
    this.width = parent.clientWidth - 60;
    
    Cary.ui.Window.apply (this, [{ position: { left: 40, height: 300, width: this.width, bottom: 2/*, absolute: true*/ }, 
                                 title: stringTable.vesselInfo + ' [' + vessel.name + ']', parent: parent, visible: true }]);
}

VesselInfo.prototype = Object.create (Cary.ui.Window.prototype);

VesselInfo.prototype.onInitialize = function ()
{
    var instance    = this;
    var tabItems    = [{ text: stringTable.operations, onSelect: showOperPane }, { text: stringTable.fuel, onSelect: showFuelPane },
                       { text: stringTable.tanks, onSelect: showTanksPane }, { text: stringTable.info, onSelect: showInfoPane }]
    var tabs        = new Cary.ui.TabControl ({ parent: this.client, visible: true, items: tabItems }, { position: 'absolute', top: 0, left: 0, width: '100%', height: 'fit-content' });
    var curDateTime = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: Cary.tools.formatDateHours (beginTime) },
                                                { width: '810px', height: 35, padding: 0, position: 'absolute', top: 250, left: 10, height: 30, 'text-align': 'center' });
    var slider      = new Cary.ui.Slider ({ parent: this.client, visible: true, value: 0, min: beginTime, max: endTime, step: 3600000, onChange: onChangeDate }, 
                                          { width: '810px', height: 35, padding: 0, position: 'absolute', top: 260, left: 10, height: 20 });

    this.operPane  = null;
    this.tanksPane = new TanksPane (this.vessel, slider, { parent: this.client, visible: false });
    this.fuelPane  = new FuelPane (this.vessel, slider, { parent: this.client, visible: false });
    this.infoPane  = null;
    
    /*var buttonStyle = { width: 70, height: 30, float: 'right' };
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var userInfoCtl = new Cary.ui.ListBox ({ parent: this.client, comboBox: false, visible: true },
                                           { width: '100%', height: 230, margin: 0, padding: 0, 'font-size': 17 });
                                           
    new Cary.ui.Button ({ text: stringTable.close, parent: buttonBlock.htmlObject, visible: true, onClick: onClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.add, parent: buttonBlock.htmlObject, visible: true, onClick: onAdd }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.delete, parent: buttonBlock.htmlObject, visible: true, onClick: onDelete }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.edit, parent: buttonBlock.htmlObject, visible: true, onClick: onEdit }, buttonStyle);*/
    
    function showOperPane ()
    {
        showPane (instance.operPane);
    }
    
    function showFuelPane ()
    {
        showPane (instance.fuelPane);
    }
    
    function showTanksPane ()
    {
        showPane (instance.tanksPane);
    }
    
    function showInfoPane ()
    {
        showPane (instance.infoPane);
    }
    
    function showPane (paneToShow)
    {
        [instance.operPane, instance.fuelPane, instance.tanksPane, instance.infoPane].forEach (function (pane)
                                                                                               {
                                                                                                   if (pane)
                                                                                                   {
                                                                                                       if (pane === paneToShow)
                                                                                                           pane.show ();
                                                                                                       else
                                                                                                           pane.hide ();
                                                                                                   }
                                                                                               });
    }
    
    function onChangeDate ()
    {
        var dateTime = parseInt (slider.getValue ());
        
        curDateTime.setText (Cary.tools.formatDateHours (dateTime));
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
};
