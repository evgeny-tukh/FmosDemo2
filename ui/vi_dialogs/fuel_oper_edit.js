function FuelOperEditWnd (parent, fuelOperDesc, callbacks)
{
    this.callbacks    = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.fuelOperDesc = fuelOperDesc;
    
    if (parent === null)
        parent = document.getElementsByTagName ('body') [0];
    
    Cary.ui.Window.apply (this, [{ position: { hcenter: true, vcenter: true, width: 400, height: 400, absolute: true }, title: stringTable.fuelOperation, parent: parent, visible: true }]);
};

FuelOperEditWnd.prototype = Object.create (Cary.ui.Window.prototype);

FuelOperEditWnd.types     = { beginAmount: 0, bunkering: 1, consumption: 2, unloading: 3, transferOut: 4, transferIn: 5, loss: 6, endAmount: 7 };
FuelOperEditWnd.typeNames = [];

FuelOperEditWnd.getTypeName = function (type)
{
    var result = '';
    
    for (var key in FuelOperEditWnd.types)
    {
        if (FuelOperEditWnd.types [key] === type)
        {
            result = stringTable [key]; break;
        }
    }
    
    return result;
};

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
    var timeCtl     = new Cary.ui.EditBox ({ parent: timeBlock.htmlObject, visible: true, value: parseInt (this.fuelOperDesc.time), time: true },
                                           { float: 'right', width: 90, 'margin-right': 20 });
    var tankCtl     = new Cary.ui.ListBox ({ parent: tankBlock.htmlObject, visible: true, comboBox: true },  { float: 'right', width: 200, 'margin-right': 20 });
    var subjectCtl  = new Cary.ui.ListBox ({ parent: subjBlock.htmlObject, visible: true, comboBox: true },  { float: 'right', width: 200, 'margin-right': 20 });
    var operTypeCtl = new Cary.ui.ListBox ({ parent: opTypeBlock.htmlObject, visible: true, comboBox: true, onItemSelect: onTypeChanged },  { float: 'right', width: 200, 'margin-right': 20 });
    var amountCtl   = new Cary.ui.EditBox ({ parent: amountBlock.htmlObject, visible: true, value: this.fuelOperDesc.amount, numeric: true, float: true, min: 0.1, step: 0.1 }, 
                                           { float: 'right', width: 60, 'margin-right': 20 });
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    
    new Cary.ui.Button ({ text: stringTable.cancel, parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.ok, parent: buttonBlock.htmlObject, visible: true, onClick: onOk }, buttonStyle);
    
    Cary.tools.sendRequest ({ method: Cary.tools.methods.get, resType: Cary.tools.resTypes.json, url: 'requests/tank_get_list.php?v=' + instance.fuelOperDesc.vessel.id,
                              onLoad: onTankListLoaded });

    for (var type in FuelOperEditWnd.types)
    {
        var item = operTypeCtl.addItem (stringTable [type], FuelOperEditWnd.types [type]);
        
        if (FuelOperEditWnd.types [type] === this.fuelOperDesc.type)
            operTypeCtl.setCurSel (item);
    }

    function onTypeChanged ()
    {
        switch (operTypeCtl.getSelectedData ())
        {
            case FuelOperEditWnd.types.transferIn:
            case FuelOperEditWnd.types.transferOut:
                break;
                
            default:
                subjectCtl.setCurSel (0);
        }
    }
    
    function onTankListLoaded (tanks)
    {
        subjectCtl.resetContent ();
        subjectCtl.addItem (stringTable.notAppl, null);
        
        if (!instance.fuelOperDesc.subject)
            subjectCtl.setCurSel (0);

        tankCtl.resetContent ();
        
        tanks.forEach (function (tankDesc)
                       {
                           var item = tankCtl.addItem (tankDesc.name, tankDesc.id);
                           
                           if (tankDesc.id === instance.fuelOperDesc.tank)
                               tankCtl.setCurSel (item);
                           
                           item = subjectCtl.addItem (tankDesc.name, tankDesc.id);
                           
                           if (tankDesc.id === instance.fuelOperDesc.subject)
                               subjectCtl.setCurSel (item);
                       });
    }
    
    function onOk ()
    {
        var hours   = timeCtl.getHours ();
        var minutes = timeCtl.getMinutes ();
        var time    = new Date (parseInt (instance.fuelOperDesc.time));
        
        time.setHours (hours);
        time.setMinutes (minutes);
        time.setSeconds (0);
        time.setMilliseconds (0);
        
        instance.fuelOperDesc.amount  = parseFloat (amountCtl.getValue ());
        instance.fuelOperDesc.subject = subjectCtl.getSelectedData ();
        instance.fuelOperDesc.tank    = tankCtl.getSelectedData ();
        instance.fuelOperDesc.time    = time.getTime ();
        instance.fuelOperDesc.type    = operTypeCtl.getSelectedData ();

        if (!instance.fuelOperDesc.tank)
        {
            alert (stringTable.tankNotSelected); return;
        }
        
        if (!instance.fuelOperDesc.type)
        {
            alert (stringTable.typeNotSelected); return;
        }
        
        if (!instance.fuelOperDesc.amount)
        {
            alert (stringTable.amountNotPresent); return;
        }
        
        if (instance.fuelOperDesc.tank === instance.fuelOperDesc.subject)
        {
            alert (stringTable.tankSameAsSubj); return;
        }
        
        forceClose ();

        if ('onOk' in instance.callbacks)
            instance.callbacks.onOk (instance.fuelOperDesc);
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }
};

/*Cary.tools.WaitForCondition (function () { return stringTable.loaded; },
                             function () { FuelOperEditWnd.typeNames = [stringTable.beginAmount, stringTable.bunkering, stringTable.consumption, stringTable.unloading,
                                                                        stringTable.transferOut, stringTable.transferIn, stringTable.loss, stringTable.endAmount]; },
                             1000);*/