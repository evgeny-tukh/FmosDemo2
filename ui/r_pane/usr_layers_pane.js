function UserLayersPane (parent, callbacks, options)
{
    this.options   = Cary.tools.isNothing (options) ? {} : options;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    
    Cary.ui.Window.apply (this, 
                         [{ position: { top: 5, left: 5, right: 5, height: options.height, absolute: true }, 
                          parent: parent, paneMode: true, title: stringTable.userLayers, visible: true }]);
}

UserLayersPane.prototype = Object.create (Cary.ui.Window.prototype);

UserLayersPane.prototype.onInitialize = function ()
{
    var columns    = [{ title: stringTable.name, width: 210 }, { title: stringTable.visible, width: 55, onItemClick: onSwitchLayer, align: 'center' }];
    var layers     = new Cary.ui.ListView ({ parent: this.wnd, columns: columns,  visible: true },
                                           { position: 'absolute', right: 2, top: 25, left: 0, height: parseInt (this.wnd.style.height) - 50 });
    var butBlock   = new Cary.ui.ControlBlock ({ parent: this.wnd, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var butStyle   = { width: 70, height: 30, float: 'right' };
    var rgtPane    = document.getElementById ('rightPane');
    var savedLayer = null;
    
    new Cary.ui.Button ({ text: stringTable.new, parent: butBlock.htmlObject, visible: true, onClick: onAddLayer }, butStyle);
    new Cary.ui.Button ({ text: stringTable.delete, parent: butBlock.htmlObject, visible: true, onClick: onDeleteLayer }, butStyle);
    new Cary.ui.Button ({ text: stringTable.edit, parent: butBlock.htmlObject, visible: true, onClick: onEditLayer }, butStyle);
    
    setTimeout (function ()
                {
                    userLayerList.forEach (function (layer)
                                           {
                                               layers.insertItem ([layer.name, Cary.symbols.unchecked], layer);
                                           });
                },
                500);
    
    function updateLayer (layerData)
    {
        var layer     = new Cary.userObjects.ObjectCollection;
        var selection = layers.getSelectedItem ();
        
        layer.deserialize (layerData, userObj.createVirginUserObject);
        
        if (selection >= 0)
        {
            layers.setItemText (selection, 0, layerData.name);
            layers.setItemData (selection, layer);
            
            if (layers.getItemText (selection, 1) === Cary.symbols.checked)
                map.showUserObjectCollection (layer, true);
        }
    }
    
    function cancelLayerEdit (layer)
    {
        if (layer.drawn)
            map.showUserObjectCollection (layer, true);
    }
    
    function onSwitchLayer (index, column, item)
    {
        var show = layers.getItemText (index, column) === Cary.symbols.checked;
        
        show = !show;
        
        layers.setItemText (index, column, show ? Cary.symbols.checked : Cary.symbols.unchecked);
        
        map.showUserObjectCollection (item.data, show);
    }
    
    function onAddLayer ()
    {
        var callbacks = { onSave: addLayer };
        var layer     = null;
        
        new UserLayerEditor (rgtPane, callbacks, layer);
    }
    
    function onDeleteLayer ()
    {
    }
    
    function onEditLayer ()
    {
        var selection = layers.getSelectedItem ();
        
        if (selection >= 0)
        {
            var callbacks = { onSave: updateLayer, onCancel: cancelLayerEdit, onRename: onLayerRename };
            
            savedLayer = layers.getItemData (selection);
        
            savedLayer.drawn = layers.getItemText (selection, 1) === Cary.symbols.checked;
            
            new UserLayerEditor (rgtPane, callbacks, savedLayer);
            
            function onLayerRename (newName)
            {
                layers.setItemText (selection, 0, newName);
            }
        }
    }
};
