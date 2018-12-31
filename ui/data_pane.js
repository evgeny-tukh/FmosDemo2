function DataPane (callbacks, options)
{
    var parent = 'parent' in options ? options.parent : document.getElementsByTagName ('body') [0];
    
    if (Cary.tools.isNothing (callbacks))
        callbacks = {};
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    this.options   = Cary.tools.isNothing (options) ? {} : options;
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.vessel    = null;
    this.timeBegin = null;
    this.timeEnd   = null;
    
    Cary.ui.Window.apply (this,
                          [{ position: { top: 315, left: 10, width: 400, height: Cary.tools.int2pix (window.innerHeight - 370), absolute: true },
                           title: stringTable.sensorData, parent: parent, paneMode: true }]);
}
DataPane.prototype = Object.create (Cary.ui.Window.prototype);

DataPane.prototype.onInitialize = function ()
{
    var instance    = this;
    var buttonStyle = { width: 'fit-content', padding: 10, height: 30, float: 'right' };
    var columns     = [{ title: stringTable.dateTime, width: 200 }, { title: stringTable.value, width: 160 }];
    var sensorBlock = new Cary.ui.ControlBlock ({ text: stringTable.sensor, parent: this.wnd, visible: true }, { height: 20, 'line-height': 22, 'text-align': 'left', padding: 10 });
    var sensorCtl   = new Cary.ui.ListBox ({ parent: sensorBlock.htmlObject, comboBox: true, visible: true, onItemSelect: onSelectSensor },
                                           { display: 'inline', float: 'right', width: 220, 'margin-right': 20 });
    var dataList    = new Cary.ui.ListView ({ parent: this.wnd, columns: columns, visible: true },
                                            { position: 'absolute', top: 70, left: 5, width: 400, height: 580 - parseInt (instance.desc.position.height), absolute: true });
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.wnd, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var graphButton = new Cary.ui.Button ({ text: stringTable.graph, parent: buttonBlock.htmlObject, visible: false, onClick: showGraphWnd }, buttonStyle);
    
    onChangeVessel (this.vessel);
    
    this.setVessel    = onChangeVessel;
    this.setTimeFrame = onSetTimeFrame;

    function showGraphWnd ()
    {
    }
    
    function onSetTimeFrame (from, to)
    {
        instance.timeBegin = from;
        instance.timeEnd   = to;
    }
    
    function onSelectSensor ()
    {
        var sensor = sensorCtl.getSelectedData ();
        
        dataList.removeAllItems ();
        
        graphButton.show (false);
        
        loadSerializable ('get_sens_data.php?b=' + beginTime + '&e=' + endTime + '&s=' + sensor.id + '&i=' + timeInterval, onSensorDataLoaded);
        
        function onSensorDataLoaded (data)
        {
            data.data.forEach (function (record)
                               {
                                   dataList.addItem ([Cary.tools.formatDateTime (record.time), record.actualVal.toFixed (1)]);
                               });
                               
            graphButton.show (data.data.length > 0);
        }
    }
    
    function onChangeVessel (vessel)
    {
        this.vessel = vessel;
        
        sensorCtl.resetContent ();
        dataList.removeAllItems ();

        graphButton.show (false);
        
        if (vessel)
        {
            vessel.sensors.forEach (function (sensor)
                                    {
                                        sensorCtl.addItem (sensor.descr, sensor);
                                    });
                                    
            if (sensorCtl.getCount () > 0)
                onSelectSensor ();
        }
    }
};

DataPane.prototype.queryClose = function ()
{
    this.hide ();
    
    return false;
};

