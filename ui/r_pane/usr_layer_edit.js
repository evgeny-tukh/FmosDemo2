function UserLayerEditor (parent, callbacks, layer)
{
    this.changed = false;
    
    if (Cary.tools.isNothing (layer))
        layer = new Cary.userObjects.ObjectCollection;
    
    this.layer = layer;
    
    SidePane.apply (this, [callbacks, { parent: parent, noCloseIcon: false, title: stringTable.layerEditor }]);
}

UserLayerEditor.prototype = Object.create (SidePane.prototype);

UserLayerEditor.prototype.close = function (quiet)
{
    map.showUserObjectCollection (this.layer, false);
        
    SidePane.prototype.close.apply (this, arguments);
};

UserLayerEditor.prototype.onInitialize = function ()
{
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var nameBlock   = new Cary.ui.ControlBlock ({ text: 'Name', parent: this.client, visible: true, anchor: Cary.ui.anchor.TOP },
                                                { height: 20, 'line-height': 22, 'text-align': 'left', padding: 10 });
    var buttonStyle = { width: 'fit-content', height: 30, float: 'right', padding: 5 };
    var instance    = this;
    var columns     = [{title: stringTable.objName, width: 150 }, { title: stringTable.type, width: 120 }];
    var addMenu     = [{ text: stringTable.icon, action: addIcon },
                       { text: stringTable.iconGrp, action: addIconGroup },
                       { text: stringTable.polyline, action: addPolyline },
                       { text: stringTable.polygon, action: addPolygon },
                       { text: stringTable.depthArea, action: addDepthArea }];
    var editMenu    = [{ text: stringTable.properties, action: editObjectProperties },
                       { text: stringTable.shape, action: reshapeObject }];
    var nameSaveBtn = new Cary.ui.Button ({ text: stringTable.save, parent: nameBlock.htmlObject, visible: true, onClick: onSaveName },
                                          { float: 'right', height: 22, width: 'fit-content', 'margin-right': '20px' });
    var nameCtl     = new Cary.ui.EditBox ({ parent: nameBlock.htmlObject, text: this.layer.name, visible: true, onChange: markAsChanged },
                                           { float: 'right', height: 18, width: 170, 'margin-right': 10 });

    
    new Cary.ui.Button ({ text: stringTable.close, parent: buttonBlock.htmlObject, visible: true, onClick: onClose }, buttonStyle);
    //new Cary.ui.Button ({ text: stringTable.cancel, parent: buttonBlock.htmlObject, visible: true, onClick: doCancel }, buttonStyle);
    //new Cary.ui.Button ({ text: stringTable.save, parent: buttonBlock.htmlObject, visible: true, onClick: doSave }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.delete, parent: buttonBlock.htmlObject, visible: true, onClick: deleteObject }, buttonStyle);
    new Cary.ui.PopUpButton ({ text: stringTable.new, parent: buttonBlock.htmlObject, visible: true, popupMenu: addMenu, menuWidth: 120, anchorType: (Cary.ui.anchor.BOTTOM | Cary.ui.anchor.LEFT) },
                               { width: 55, height: 30, float: 'right', padding: 5, 'padding-top': 0, 'padding-bottom': 0 });
    new Cary.ui.PopUpButton ({ text: stringTable.edit, parent: buttonBlock.htmlObject, visible: true, popupMenu: editMenu, menuWidth: 120, anchorType: (Cary.ui.anchor.BOTTOM | Cary.ui.anchor.LEFT) },
                               { width: 75, height: 30, float: 'right', padding: 5, 'padding-top': 0, 'padding-bottom': 0 });
    //new Cary.ui.Button ({ text: stringTable.edit, parent: buttonBlock.htmlObject, visible: true, onClick: editObject }, buttonStyle);

    this.objectList = new Cary.ui.ListView ({ parent: this.client, columns: columns, visible: true },
                                            { right: 2, top: 40, left: 0, height: parseInt (this.wnd.style.height) - 110, position: 'absolute' });
    
    if (!this.layer.drawn)
        map.showUserObjectCollection (this.layer, true);
    
    setTimeout (function () 
                {
                    instance.layer.objects.forEach (function (object)
                                                    {
                                                        instance.objectList.addItem ([object.name, getObjectTypeName (object)], object);
                                                    });
                },
                500);
    
    function markAsChanged ()
    {
        instance.changed = true;
    }
    
    function onSaveName ()
    {
        uploadSerializableToServer ('ol_set_name.php', { name: nameCtl.getValue (), id: instance.layer.id },
                                    function (newName)
                                    {
                                        nameCtl.setValue (newName);
                                        
                                        if ('onRename' in instance.callbacks)
                                            instance.callbacks.onRename (newName);
                                        
                                        instance.changed = false;
                                    },
                                    Cary.tools.resTypes.plain);
        
    }
    
    function onClose ()
    {
        if (instance.changed && 'onChanged' in instance.callbacks)
            this.callbacks.onChanged ();
        
        instance.close (true);
    }
    
    function addIcon ()
    {
        var callbacks = { onObjectAdded: onObjectAdded };
        
        new IconSelectWnd (null, { onPlotOnMap: function (iconData) { globalInterface.waitForUserIcon (iconData, callbacks); },
                                   onSetAtPos: function (iconData) { globalInterface.addUserIcon (iconData, callbacks); } });
                               
        function onObjectAdded (icon)
        {
            instance.layer.objects.push (icon);
            instance.objectList.addItem ([icon.name, 'icon'], icon);
        }
    }
    
    function addIconGroup ()
    {
    }
    
    function addPolyline ()
    {
    }
    
    function addPolygon ()
    {
    }

    function getObjectTypeName (object)
    {
        var userTypeName = object.getUserTypeName ();
        
        return userTypeName === null ? object.getTypeName () : userTypeName;
    }
    
    function addDepthArea ()
    {
        instance.changed = true;

        globalInterface.addNewDepthContour = addDepthAreaToLayer;
        
        globalInterface.waitForUserClick (start);
        
        function start (event)
        {
            globalInterface.activateRegularContextMenu (event, plottingActions.NEW_DEPTH_CONTOUR);
        }
        
        function addDepthAreaToLayer (object)
        {
            var data = object.serialize ();
                
            globalInterface.addNewDepthContour = null;
            globalInterface.onSave             = null;
                
            data.layerID = instance.layer.id;

            uploadSerializableToServer ('uo_save.php', data,
                                        function (savedObject)
                                        {
                                            instance.layer.objects.push (savedObject);

                                            instance.objectList.addItem ([savedObject.name, getObjectTypeName (savedObject)], savedObject);            
                                        });
        }
    }
    
    function editObject (index, column, item)
    {
        instance.changed = true;
    }
    
    function doCancel ()
    {
        instance.close (true);
        
        if ('onCancel' in instance.callbacks)
            instance.callbacks.onCancel (instance.layer);
    }
    
    function doSave ()
    {
        instance.layer.name = nameCtl.getValue ();
        
        uploadLayerToServer (instance.layer.serialize (), onLayerSaved);
        
        function onLayerSaved (newLayer)
        {
            if ('onSave' in instance.callbacks)
                instance.callbacks.onSave (newLayer);
            
            instance.close (true);
        }
    }
    
    function deleteObject ()
    {
        var selection = instance.objectList.getSelectedItem ();
        
        if (selection >= 0)
        {
            instance.changed = true;
        
            map.drawUserObject (instance.objectList.getItemData (selection), false);
            
            instance.objectList.removeItem (selection);
            
            instance.layer.objects.splice (selection, 1);
        }
    }
    
    function addObject ()
    {
    }
    
    function reshapeObject ()
    {
        
    }
    
    function editObjectProperties ()
    {
        var selection = instance.objectList.getSelectedItem ();
        
        if (selection >= 0)
        {
            var object = instance.objectList.getItemData (selection);
            
            switch (object.userType)
            {
                case userObj.types.DEPTH_CONTOUR:
                    new userObj.DepthContourPropsWnd (null, object, { visible: true, onOk: onOk }); break;
            }
            
            function onOk ()
            {
                var data = object.serialize ();
                
                data.layerID = instance.layer.id;
                
                uploadSerializableToServer ('uo_save.php', data,
                                            function (savedObject)
                                            {
                                                instance.objectList.setItemText (selection, 0, savedObject.name);
                                                instance.objectList.setItemData (selection, savedObject);
                                            });
            }
        }
    }
};

UserLayerEditor.prototype.queryClose = function ()
{
    return confirm (stringTable.changesLoose);
};

