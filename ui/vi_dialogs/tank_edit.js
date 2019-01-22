function TankEditWnd (parent, tankDesc, callbacks)
{
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.tankDesc  = tankDesc;
    
    if (parent === null)
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 290, height: 190, absolute: true }, title: stringTable.tankParams, parent: parent, visible: true }]);
};

TankEditWnd.prototype = Object.create (Cary.ui.Window.prototype);

TankEditWnd.prototype.onInitialize = function ()
{
    var instance    = this;
    var buttonStyle = { width: 70, height: 30, float: 'right' };
    var ctlStyles   = { 'text-align': 'left', margin: 0, 'margin-top': 10, padding: 0, 'padding-left': 10, height: 26, 'line-height': 26 };
    var nameBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.name }, ctlStyles );
    var depthBlock  = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.depth }, ctlStyles );
    var volBlock    = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.volume }, ctlStyles );
    var nameCtl     = new Cary.ui.EditBox ({ parent: nameBlock.htmlObject, visible: true, text: this.tankDesc.name }, { float: 'right', width: 200, 'margin-right': 20 });
    var depthCtl    = new Cary.ui.EditBox ({ parent: depthBlock.htmlObject, visible: true, value: this.tankDesc.depth, numeric: true, float: true, min: 0.5, step: 0.5 }, 
                                           { float: 'right', width: 60, 'margin-right': 20 });
    var volumeCtl   = new Cary.ui.EditBox ({ parent: volBlock.htmlObject, visible: true, value: this.tankDesc.volume, numeric: true, float: true, min: 0.5, step: 0.5 }, 
                                           { float: 'right', width: 60, 'margin-right': 20 });
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    
    new Cary.ui.Button ({ text: stringTable.cancel, parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.ok, parent: buttonBlock.htmlObject, visible: true, onClick: onOk }, buttonStyle);
    
    function onOk ()
    {
        var name  = nameCtl.getValue ();
        var depth = depthCtl.getValue ();
        var vol   = volumeCtl.getValue ();
        
        if (name === null || name === '')
        {
            alert (stringTable.plsSpecName); return;
        }
        
        forceClose ();

        if ('onOk' in instance.callbacks)
            instance.callbacks.onOk ({ name: name, depth: depth, volume: vol, vessel: instance.tankDesc.vessel, id: instance.tankDesc.id });
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
};

