function TanksPane (vessel, slider, options)
{
    VesselInfoPane.apply (this, arguments);
}

TanksPane.prototype = Object.create (VesselInfoPane.prototype);

TanksPane.prototype.onInitialize = function ()
{
    var instance = this;
    var columns  = [{ title: stringTable.name, width: 100 }, { title: stringTable.volume, width: 70 }, { title: stringTable.depth, width: 70 },
                    { title: stringTable.curSounding, width: 100 }, { title: stringTable.curAmount, width: 90 }];
    var tankList = new Cary.ui.ListView ({ parent: this.wnd, columns: columns, visible: true }, { position: 'absolute', top: 2, left: 2, width: 480, height: 190 });
   
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.add, onClick: onAddTank }, { position: 'absolute', top: 5, left: 490, width: 80, height: 30 });
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.edit, onClick: onEditTank }, { position: 'absolute', top: 45, left: 490, width: 80, height: 30 });
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.delete, onClick: onDeleteTank }, { position: 'absolute', top: 85, left: 490, width: 80, height: 30 });
    
    Cary.tools.sendRequest ({ method: Cary.tools.methods.get, resType: Cary.tools.resTypes.json, url: 'requests/tank_get_list.php?v=' + instance.vessel.id, onLoad: onTankListLoaded });

    function onTankListLoaded (tanks)
    {
        tanks.forEach (function (tankDesc)
                       {
                           tankList.addItem ([tankDesc.name, tankDesc.volume, tankDesc.depth], tankDesc);
                       });
    }
    
    function onAddTank ()
    {
        new TankEditWnd (null, { name: 'New tank', id: 0, vessel: instance.vessel.id }, { onOk: onOk });
        
        function onOk (tankDesc)
        {
            saveTank (tankDesc, onSaved);
            
            function onSaved (tankID)
            {
                tankDesc.id = parseInt (tankID);
                
                tankList.addItem ([tankDesc.name, tankDesc.volume, tankDesc.depth], tankDesc);
            }
        }
    }
    
    function saveTank (tankDesc, onSaved)
    {
        uploadSerializableToServer ('tank_add.php', tankDesc, onSaved, Cary.tools.resTypes.plain);
    }
    
    function onEditTank ()
    {
        var selection = tankList.getSelectedItem ();
        
        if (selection >= 0)
        {
            new TankEditWnd (null, tankList.getItemData (selection), { onOk: onOk });

            function onOk (tankDesc)
            {
                saveTank (tankDesc, onSaved);

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
    
    function onDeleteTank ()
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
