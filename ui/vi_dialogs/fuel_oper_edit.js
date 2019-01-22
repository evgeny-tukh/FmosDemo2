function FuelOperEditWnd (parent, fuelOperDesc, callbacks)
{
    this.callbacks    = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.fuelOperDesc = fuelOperDesc;
    
    if (parent === null)
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 290, height: 220, absolute: true }, title: stringTable.fuelOperation, parent: parent, visible: true }]);
};

FuelOperEditWnd.prototype = Object.create (Cary.ui.Window.prototype);

FuelOperEditWnd.types     = { beginAmount: 0, bunkering: 1, consumption: 2, unloading: 3, loss: 4, endAmount: 5 };
FuelOperEditWnd.typeNames = [];

FuelOperEditWnd.prototype.onInitialize = function ()
{
    var instance    = this;
    var buttonStyle = { width: 70, height: 30, float: 'right' };
    var ctlStyles   = { 'text-align': 'left', margin: 0, 'margin-top': 10, padding: 0, 'padding-left': 10, height: 26, 'line-height': 26 };
    var timeBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.time }, ctlStyles );
    var tankBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.tank }, ctlStyles );
    var opTypeBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.operType }, ctlStyles );
    var amountBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.amount }, ctlStyles );
    var subjBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.subject }, ctlStyles );
    var timeCtl     = new Cary.ui.EditBox ({ parent: timeBlock.htmlObject, visible: true, text: Cary.tools.formatDate (this.fuelOperDesc.time) },
                                           { float: 'right', width: 200, 'margin-right': 20 });
    var tankCtl     = new Cary.ui.ListBox ({ parent: tankBlock.htmlObject, visible: true, comboBox: true },  { float: 'right', width: 200, 'margin-right': 20 });
    var subjectCtl  = new Cary.ui.ListBox ({ parent: subjBlock.htmlObject, visible: true, comboBox: true },  { float: 'right', width: 200, 'margin-right': 20 });
    var operTypeCtl = new Cary.ui.ListBox ({ parent: opTypeBlock.htmlObject, visible: true, comboBox: true },  { float: 'right', width: 200, 'margin-right': 20 });
    var amountCtl   = new Cary.ui.EditBox ({ parent: amountBlock.htmlObject, visible: true, value: this.fuelOperDesc.amount, numeric: true, float: true, min: 0.1, step: 0.1 }, 
                                           { float: 'right', width: 60, 'margin-right': 20 });
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    
    new Cary.ui.Button ({ text: stringTable.cancel, parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.ok, parent: buttonBlock.htmlObject, visible: true, onClick: onOk }, buttonStyle);
    
    function onOk ()
    {
        /*var name  = nameCtl.getValue ();
        var depth = depthCtl.getValue ();
        var vol   = volumeCtl.getValue ();
        
        if (name === null || name === '')
        {
            alert (stringTable.plsSpecName); return;
        }
        
        forceClose ();

        if ('onOk' in instance.callbacks)
            instance.callbacks.onOk ({ name: name, depth: depth, volume: vol, vessel: instance.fuelOperDesc.vessel, id: instance.fuelOperDesc.id });*/
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
};

Cary.tools.WaitForCondition (function () { return stringTable.loaded; },
                             function () { FuelOperEditWnd.typeNames = [stringTable.beginAmount, stringTable.bunkering, stringTable.consumption, stringTable.unloading, stringTable.loss, stringTable.endAmount]; },
                             1000);