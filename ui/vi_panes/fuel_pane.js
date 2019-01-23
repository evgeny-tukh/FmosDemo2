function FuelPane (vessel, slider, options)
{
    VesselInfoPane.apply (this, arguments);
}

FuelPane.prototype = Object.create (VesselInfoPane.prototype);

FuelPane.prototype.onInitialize = function ()
{
    var instance = this;
    var columns  = [{ title: stringTable.time, width: 140 }, { title: stringTable.operation, width: 130 }, { title: stringTable.subject, width: 200 },
                    { title: stringTable.fuelAmount, width: 110 }, { title: stringTable.result, width: 90 }];
    var tankCtl  = new Cary.ui.ListBox ({ parent: this.wnd, comboBox: true, visible: true, onItemSelect: onTankSelected }, { position: 'absolute', top: 5, left: 5, width: 400, height: 25 });
    var operList = new Cary.ui.ListView ({ parent: this.wnd, columns: columns, visible: true }, { position: 'absolute', top: 35, left: 2, width: 720, height: 160 });
   
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.add, onClick: onAddOper }, { position: 'absolute', top: 5, left: 730, width: 80, height: 30 });
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.edit, onClick: onEditOper }, { position: 'absolute', top: 45, left: 730, width: 80, height: 30 });
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.delete, onClick: onDeleteOper }, { position: 'absolute', top: 85, left: 730, width: 80, height: 30 });
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.report, onClick: onShowReport }, { position: 'absolute', top: 125, left: 730, width: 80, height: 30 });

    reloadTankList ();

    function onTankListLoaded (tanks)
    {
        tankCtl.resetContent ();
        
        tanks.forEach (function (tankDesc)
                       {
                           tankCtl.addItem (tankDesc.name, tankDesc);
                       });
                       
        onTankSelected ();
    }

    function onTankSelected ()
    {
        var tankDesc = tankCtl.getSelectedData ();
        
        if (tankDesc)
        {
            var url = 'requests/fo_get_list_at_day.php?t=' + tankDesc.id + '&d=' + (instance.getCurTime () / 1000).toString ();
            
            operList.removeAllItems ();
            
            Cary.tools.sendRequest ({ method: Cary.tools.methods.get, resType: Cary.tools.resTypes.json, url: url, onLoad: onOperListLoaded });
        }
    }
    
    function onOperListLoaded (operations)
    {
        var curTime   = instance.getCurTime ();
        var begAmount = 0.0;
        var amount    = begAmount;
        
        operList.addItem ([Cary.tools.formatDate (curTime) + ' 00:00', stringTable.beginAmount, '', begAmount.toFixed (1), '']);
        
        operations.forEach (function (operDesc)
                            {
                                switch (operDesc.type)
                                {
                                    case FuelOperEditWnd.types.bunkering:
                                    case FuelOperEditWnd.types.transferIn:
                                        amount += operDesc.amount; break;
                                        
                                    case FuelOperEditWnd.types.consumption:
                                    case FuelOperEditWnd.types.loss:
                                    case FuelOperEditWnd.types.transferOut:
                                    case FuelOperEditWnd.types.unloading:    
                                        amount -= operDesc.amount; break;
                                }
                                
                                operList.addItem ([Cary.tools.formatDateHoursMinutes (operDesc.time), FuelOperEditWnd.getTypeName (operDesc.type), operDesc.subjName, operDesc.amount.toFixed (1), amount.toFixed (1)]);
                            });
                            
        operList.addItem ([Cary.tools.formatDate (curTime) + ' 23:59', stringTable.endAmount, '', amount.toFixed (1), '']);
    }
    
    function reloadTankList ()
    {
        Cary.tools.sendRequest ({ method: Cary.tools.methods.get, resType: Cary.tools.resTypes.json, url: 'requests/tank_get_list.php?v=' + instance.vessel.id, onLoad: onTankListLoaded });
    }
    
    //Cary.tools.sendRequest ({ method: Cary.tools.methods.get, resType: Cary.tools.resTypes.json, url: 'requests/tank_get_list.php?v=' + instance.vessel.id, onLoad: onOperListLoaded });

    function onAddOper ()
    {
        var tankDesc = tankCtl.getSelectedData ();
        
        new FuelOperEditWnd (null,
                             { vessel: instance.vessel, id: 0, tank: tankDesc.id, time: instance.slider.getValue (), type: FuelOperEditWnd.types.bunkering, amount: 1.0,
                               subject: null, affectedOper: null },
                             { onOk: onOk });
        
        function onOk (operDesc)
        {
            saveOper (operDesc, onTankSelected);
        }
    }
    
    function saveOper (operDesc, onSaved)
    {
        uploadSerializableToServer ('fo_add.php', operDesc, onSaved, Cary.tools.resTypes.plain);
    }
    
    function onEditOper ()
    {
        var selection = operList.getSelectedItem ();
        
        if (selection >= 0)
        {
            new OperEditWnd (null, operList.getItemData (selection), { onOk: onOk });

            function onOk (operDesc)
            {
                saveOper (operDesc, onSaved);

                function onSaved (tankID)
                {
                    if (parseInt (tankID) === operDesc.id)
                    {
                        tankList.setItemText (selection, 0, operDesc.name);
                        tankList.setItemText (selection, 1, operDesc.volume);
                        tankList.setItemText (selection, 2, operDesc.depth);
                        tankList.setItemData (selection, operDesc);
                    }
                }
            }
        }
    }
    
    function onShowReport ()
    {
        
    }
    
    function onDeleteOper ()
    {
        var selection = tankList.getSelectedItem ();
        
        if (selection >= 0)
        {
            var operDesc = operList.getItemData (selection);
            
            new Cary.ui.MessageBox ({ width: 400, yesNo: true, title: stringTable.confirmation, text: stringTable.fuelOperDeleteConfirm }, { onOk: onOk });
            
            function onOk ()
            {
                Cary.tools.sendRequest ({ method: Cary.tools.methods.get, resType: Cary.tools.resTypes.plain, url: 'requests/fo_delete.php?id=' + operDesc.id, onLoad: onDeleted });
            }
            
            function onDeleted (affectedRecs)
            {
                if (parseInt (affectedRecs) > 0)
                    operList.removeItem (selection);
            }
        }
    }
};
