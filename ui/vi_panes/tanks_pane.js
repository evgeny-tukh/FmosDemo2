function TanksPane (vessel, callbacks, options)
{
    var parent = 'parent' in options ? options.parent : document.getElementsByTagName ('body') [0];
    
    this.vessel = vessel;
    
    if (Cary.tools.isNothing (callbacks))
        callbacks = {};
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    this.options   = Cary.tools.isNothing (options) ? {} : options;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    Cary.ui.Window.apply (this, [{ position: { left: 0, top: 45, width: '100%', height: 225, absolute: true }, paneMode: true, parent: parent, noCloseIcon: true }]);
}

TanksPane.prototype = Object.create (Cary.ui.Window.prototype);

TanksPane.prototype.onInitialize = function ()
{
    var instance = this;
    var columns  = [{ title: stringTable.name, width: 100 }, { title: stringTable.volume, width: 70 }, { title: stringTable.depth, width: 70 }];
    var tankList = new Cary.ui.ListView ({ parent: this.wnd, columns: columns, visible: true }, { position: 'absolute', top: 2, left: 2, width: 280, height: 230, 'background-color': 'yellow' });
   
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.add, onClick: onAddTank }, { position: 'absolute', top: 5, left: 290, width: 80, height: 30 });
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.edit, onClick: onEditTank }, { position: 'absolute', top: 45, left: 290, width: 80, height: 30 });
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.delete, onClick: onDeleteTank }, { position: 'absolute', top: 85, left: 290, width: 80, height: 30 });
    
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
    }
    
    function onDeleteTank ()
    {
    }
};

TanksPane.prototype.queryClose = function ()
{
    return false;
};

TanksPane.prototype.setVessel = function (vessel)
{
    this.vessel = vessel;
};