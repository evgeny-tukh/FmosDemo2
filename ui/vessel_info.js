function VesselInfo (vessel, parent, callbacks)
{
    this.vessel    = vessel;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    if (Cary.tools.isNothing (parent))
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 800, height: 600, absolute: true }, 
                                 title: stringTable.vesselInfo + ' [' + vessel.name + ']', parent: parent, visible: true }]);
}

VesselInfo.prototype = Object.create (Cary.ui.Window.prototype);

VesselInfo.prototype.onInitialize = function ()
{
    var instance    = this;
    var tabItems    = [{ text: stringTable.operations }, { text: stringTable.fuel }, { text: stringTable.info }]
    var tabs        = new Cary.ui.TabControl ({ parent: this.client, visible: true, items: tabItems }, { position: 'absolute', top: 0, left: 0, width: '100%', height: 'fit-content' });
    /*var buttonStyle = { width: 70, height: 30, float: 'right' };
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var userInfoCtl = new Cary.ui.ListBox ({ parent: this.client, comboBox: false, visible: true },
                                           { width: '100%', height: 230, margin: 0, padding: 0, 'font-size': 17 });
                                           
    new Cary.ui.Button ({ text: stringTable.close, parent: buttonBlock.htmlObject, visible: true, onClick: onClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.add, parent: buttonBlock.htmlObject, visible: true, onClick: onAdd }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.delete, parent: buttonBlock.htmlObject, visible: true, onClick: onDelete }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.edit, parent: buttonBlock.htmlObject, visible: true, onClick: onEdit }, buttonStyle);*/
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
};
