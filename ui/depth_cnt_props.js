userObj.DepthContourPropsWnd = function (parent, object, callbacks)
{
    var instance = this;
    
    // Preserve the initial attachment state; while saving, we should generate update list based on the difference
    this.oldAttachments = [];
    
    object.attachments.forEach (function (attachment)
                                {
                                    instance.oldAttachments.push ({ name: attachment.name, data: attachment.data });
                                });
    
    Cary.ui.UserPolygonPropsWnd.apply (this, arguments);
};

userObj.DepthContourPropsWnd.prototype = Object.create (Cary.ui.UserPolygonPropsWnd.prototype);

userObj.DepthContourPropsWnd.prototype.onInitialize = function ()
{
    Cary.ui.UserPolygonPropsWnd.prototype.onInitialize.apply (this);
    
    this.setTitle (stringTable.depthCntProp);
    this.setHeight (400);
    
    var maxDraughtBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.maxDraught }, this.ctlBlkStyle);
    var idBlock         = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.id }, this.ctlBlkStyle);
    var userInfoBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: stringTable.correction }, this.ctlBlkStyle);
    var userInfoBlock2  = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: '' }, this.ctlBlkStyle);
    var maxDraughtCtl   = new Cary.ui.EditBox ({ parent: maxDraughtBlock.htmlObject, numeric: true, float: true, min: 0.5, max: 100.0, step: 0.1, value: this.object.userProps ['maxDraught'], visible: true }, { display: 'inline', float: 'right', width: 50, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var idCtl           = new Cary.ui.EditBox ({ parent: idBlock.htmlObject, text: this.object.userProps ['id'], visible: true }, { display: 'inline', float: 'right', width: 50, height: 22, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var userInfoCtl     = new Cary.ui.ListBox ({ parent: userInfoBlock.htmlObject, comboBox: true, visible: true }, { display: 'inline', float: 'right', width: 150, height: 25, 'margin-right': 20, padding: 0, 'font-size': 17 });
    var instance        = this;
    var parentOkHandler = this.okButton.htmlObject.onclick;
    
    new Cary.ui.Button ({ text: stringTable.userInfoList, parent: userInfoBlock2.htmlObject, visible: true, onClick: onEditUserInfoList },
                        { width: 150, height: 30, float: 'right', 'margin-right': 20 });
    new Cary.ui.Button ({ text: stringTable.attachments, parent: this.okButton.parent, visible: true, onClick: onEditAttachmentList },
                        { width: 'fit-content', height: 30, float: 'left', 'margin-left': 10, 'padding-right': 20, 'padding-left': 20 });
    
    loadInfoArrayList (onUserInfoListLoaded);
    
    this.okButton.htmlObject.onclick = onOk;
    
    function onEditAttachmentList ()
    {
        new AttachmentListWnd (instance.object, null, {});
    }
    
    function onEditUserInfoList ()
    {
        new UserInfoListWnd (null, { onChange: onChange });
        
        function onChange ()
        {
            
        }
    }
    
    function onUserInfoListLoaded (userInfoList)
    {
        userInfoList.forEach (function (item)
                              {
                                  userInfoCtl.addItem (item.name, item.id);
                              });
    }
    
    function onOk ()
    {
        var updates = instance.object.buildAttachmentUpdateList (instance.oldAttachments);
        
        if (updates.length > 0)
        {
            var updateList = new log.UpdateList ();
            
            updates.forEach (function (updateItem)
                             {
                                 var desc = { subject: instance.object.id, oldValue: null, newValue: updateItem.name };
                                 
                                 switch (updateItem.action)
                                 {
                                     case Cary.userObjects.attachmentActions.ADDED:
                                         desc.action = log.actions.NEW_ATTACHMENT; break;
                                         
                                     case Cary.userObjects.attachmentActions.DELETED:
                                         desc.action = log.actions.DEL_ATTACHMENT; break;
                                         
                                     case Cary.userObjects.attachmentActions.UPLOADED:
                                         desc.action = log.actions.UPL_ATTACHMENT; break;
                                         
                                     default:
                                         desc.action = null;
                                 }
                                 
                                 updateList.add (desc);
                             });
                             
            Cary.tools.sendRequest ({ url: 'requests/upd_reg.php', mathod: Cary.tools.methods.post, content: Cary.tools.contentTypes.json, onLoad: onUpdateRegistered,
                                      resType: Cary.tools.resTypes.json, param: updateList.serialize () });
            
            function onUpdateRegistered (result)
            {
            }
        }
        
        instance.object.userProps ['maxDraught'] = maxDraughtCtl.getValue ();
        instance.object.userProps ['id']         = idCtl.getValue ();
        
        instance.object.userInfoID = userInfoCtl.getSelectedData ();
        
        parentOkHandler ();
    }
};

