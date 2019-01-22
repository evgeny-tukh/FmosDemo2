function FuelPane (vessel, slider, options)
{
    VesselInfoPane.apply (this, arguments);
}

FuelPane.prototype = Object.create (VesselInfoPane.prototype);

FuelPane.prototype.onInitialize = function ()
{
    var instance = this;
    var columns  = [{ title: stringTable.time, width: 140 }, { title: stringTable.operation, width: 130 }, { title: stringTable.subject, width: 200 },
                    { title: stringTable.fuelAmount, width: 110 }, { title: stringTable.result, width: 100 }];
    var tankCtl  = new Cary.ui.ListBox ({ parent: this.wnd, comboBox: true, visible: true, onItemClick: onTankSelected }, { position: 'absolute', top: 5, left: 5, width: 400, height: 25 });
    var operList = new Cary.ui.ListView ({ parent: this.wnd, columns: columns, visible: true }, { position: 'absolute', top: 35, left: 2, width: 700, height: 160 });
   
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.add, onClick: onAddOper }, { position: 'absolute', top: 5, left: 710, width: 80, height: 30 });
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.edit, onClick: onEditOper }, { position: 'absolute', top: 45, left: 710, width: 80, height: 30 });
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.delete, onClick: onDeleteOper }, { position: 'absolute', top: 85, left: 710, width: 80, height: 30 });

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
            var url = 'requests/fo_get_list_at_day.php?t=' + tankDesc.id + '&d=' + instance.getCurTime ();
            
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
                                amount += operDesc.amount;
                                
                                operList.addItem ([Cary.tools.formatDateTime (operDesc.time), FuelOperEditWnd.typeNames [operDesc.type], operDesc.subjName, operDesc.amount.toFixed (1), amount.toFixed (1)]);
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
        new OperEditWnd (null, { name: 'New tank', id: 0, vessel: instance.vessel.id }, { onOk: onOk });
        
        function onOk (tankDesc)
        {
            saveOper (tankDesc, onSaved);
            
            function onSaved (tankID)
            {
                tankDesc.id = parseInt (tankID);
                
                tankList.addItem ([tankDesc.name, tankDesc.volume, tankDesc.depth], tankDesc);
            }
        }
    }
    
    function saveOper (tankDesc, onSaved)
    {
        uploadSerializableToServer ('tank_add.php', tankDesc, onSaved, Cary.tools.resTypes.plain);
    }
    
    function onEditOper ()
    {
        var selection = tankList.getSelectedItem ();
        
        if (selection >= 0)
        {
            new OperEditWnd (null, tankList.getItemData (selection), { onOk: onOk });

            function onOk (tankDesc)
            {
                saveOper (tankDesc, onSaved);

                function onSaved (tankID)
                {
                    if (parseInt (tankID) === tankDesc.id)
                    {
                        tankList.setItemText (selection, 0, tankDesc.name);
                        tankList.setItemText (selection, 1, tankDesc.volume);
                        tankList.setItemText (selection, 2, tankDesc.depth);
                        tankList.setItemData (selection, tankDesc);
                    }
                }
            }
        }
    }
    
    function onDeleteOper ()
    {
        var selection = tankList.getSelectedItem ();
        
        if (selection >= 0)
        {
            var tankDesc = tankList.getItemData (selection);
            
            new Cary.ui.MessageBox ({ width: 400, yesNo: true, title: stringTable.confirmation, text: stringTable.tankDeleteConfirm + '"' + tankDesc.name + '"?' }, { onOk: onOk });
            
            function onOk ()
            {
                Cary.tools.sendRequest ({ method: Cary.tools.methods.get, resType: Cary.tools.resTypes.plain, url: 'requests/tank_delete.php?id=' + tankDesc.id, onLoad: onDeleted });
            }
            
            function onDeleted (affectedRecs)
            {
                if (parseInt (affectedRecs) > 0)
                    tankList.removeItem (selection);
            }
        }
    }
};
