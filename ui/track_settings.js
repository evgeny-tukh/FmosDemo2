function TimeSettingsWnd (callbacks, min, max, period)
{
    this.callbacks = Cary.tools.isNothing (callbacks) ? {} : callbacks;
    this.min       = min;
    this.max       = max;
    this.period    = period;
    
    Cary.ui.Window.apply (this, 
                          [{ position: { hcenter: true, vcenter: true, width: 300, height: 200, absolute: true }, title: stringTable.timeSettings, parent: Cary.tools.getHtmlBody (), 
                             visible: true }]);
}

TimeSettingsWnd.prototype = Object.create (Cary.ui.Window.prototype);

TimeSettingsWnd.prototype.onInitialize = function ()
{
    var buttonBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, anchor: Cary.ui.anchor.BOTTOM });
    var fromBlock   = new Cary.ui.ControlBlock ({ text: stringTable.from, parent: this.client, visible: true },
                                                { height: 20, 'line-height': 22, 'text-align': 'left', padding: 10 });
    var toBlock     = new Cary.ui.ControlBlock ({ text: stringTable.to, parent: this.client, visible: true },
                                                { height: 20, 'line-height': 22, 'text-align': 'left', padding: 10 });
    var periodBlock = new Cary.ui.ControlBlock ({ text: stringTable.dataInterval, parent: this.client, visible: true },
                                                { height: 20, 'line-height': 22, 'text-align': 'left', padding: 10 });
    var buttonStyle = { width: 'fit-content', padding: 10, height: 30, float: 'right' };
    var instance    = this;
    var fromCtl     = new Cary.ui.EditBox ({ parent: fromBlock.htmlObject, visible: true, onClick: selectFromDate }, { float: 'right', height: 18, width: 110, 'margin-right': 20 });
    var toCtl       = new Cary.ui.EditBox ({ parent: toBlock.htmlObject, visible: true, onClick: selectToDate }, { float: 'right', height: 18, width: 110, 'margin-right': 20 });
    var periodCtl   = new Cary.ui.EditBox ({ parent: periodBlock.htmlObject, visible: true, numeric: true, min: 60, max: 24 * 3600, value: this.period },
                                           { float: 'right', height: 18, width: 110, 'margin-right': 20 });
    var to          = this.max;
    var from        = this.min;
    
    new Cary.ui.Button ({ text: stringTable.cancel, parent: buttonBlock.htmlObject, visible: true, onClick: forceClose }, buttonStyle);
    new Cary.ui.Button ({ text: stringTable.show, parent: buttonBlock.htmlObject, visible: true, onClick: onShow }, buttonStyle);
    
    fromCtl.setValue (Cary.tools.formatDate (from));
    toCtl.setValue (Cary.tools.formatDate (to));

    function selectDate (htmlObject, x, y, onSelect)
    {
        var calendarDesc = { position: { x: x, y: y },
                             maxDate: instamce.max,
                             minDate: instance.min,
                             onSelect: function (date)
                                       {
                                           htmlObject.value = Cary.tools.formatDate (date);

                                           CalendarControl.instance.close ();
                                           
                                           onSelect (date);
                                       } };
            
        new CalendarControl (calendarDesc, new Date (from));
    }
    
    function selectFromDate ()
    {
        selectDate (this, 100, 100, function (date) { from = date.getTime (); });
    }
    
    function selectToDate ()
    {
        selectDate (this, 100, 100, function (date) { to = date,getTime (); });
    }
    
    function forceClose ()
    {
        instance.close ();
        
        if ('onClose' in instance.callbacks)
            instance.callbacks.onClose ();
    }

    function onShow ()
    {
        if ('onOk' in instance.callbacks)
        {
            // Make sure that TO is an end of the day and FROM is a begin
            var fromDate = new Date (from);
            var toDate   = new Date (to);
            
            fromDate.setHours (0);
            fromDate.setMinutes (0);
            fromDate.setSeconds (0);
            
            toDate.setHours (23);
            toDate.setMinutes (59);
            toDate.setSeconds (59);
            
            instance.callbacks.onOk (fromDate.getTime (), toDate.getTime (), periodCtl.getValue () );
            
            forceClose ();
        }
    }
};

