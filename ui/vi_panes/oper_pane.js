function OperationsPane (vessel, slider, options)
{
    VesselInfoPane.apply (this, arguments);
}

OperationsPane.prototype = Object.create (VesselInfoPane.prototype);

OperationsPane.prototype.onInitialize = function ()
{
    var instance = this;
    var columns  = [{ title: stringTable.begin, width: 140 }, { title: stringTable.end, width: 140 }, { title: stringTable.operation, width: 200 }];
    var operList = new Cary.ui.ListView ({ parent: this.wnd, columns: columns, visible: true }, { position: 'absolute', top: 5, left: 2, width: 500, height: 190 });
   
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.add, onClick: onAddOper }, { position: 'absolute', top: 5, left: 710, width: 80, height: 30 });
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.edit, onClick: onEditOper }, { position: 'absolute', top: 45, left: 710, width: 80, height: 30 });
    new Cary.ui.Button ({ visible: true, parent: this.wnd, text: stringTable.delete, onClick: onDeleteOper }, { position: 'absolute', top: 85, left: 710, width: 80, height: 30 });

    function onAddOper ()
    {
    }

    function onEditOper ()
    {
    }

    function onDeleteOper ()
    {
    }
};