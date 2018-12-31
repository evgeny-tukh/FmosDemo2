var doc = {};

doc.Document = function (info)
{
    if (Cary.tools.isNothing (info))
        info = {};
    
    this.name = 'name' in info ? info.name : null;
    this.link = 'link' in info ? info.link : null;
    this.date = Cary.tools.isNothing (info.date) ? null : info.date;
    this.id   = Cary.tools.isNothing (info.id) ? null : info.id;
};

doc.Document.prototype.serialize = function ()
{
    var result = { name: this.name, link: this.link, id: this.id };
    
    if (this.date !== null)
        result.date = this.date.getTime ();
    else
        result.date = null;
    
    return result;
};

doc.Document.prototype.deserialize = function (source)
{
    if ('name' in source)
        this.name = source.name;
    else
        this.name = null;
    
    if ('id' in source)
        this.id = source.id;
    else
        this.id = null;
    
    if ('link' in source)
        this.link = source.link;
    else
        this.link = null;
    
    if ('date' in source && source.date !== null)
        this.date = new Date (source.date);
    else
        this.date = null;
};

doc.DocumentGroup = function (name, id)
{
    this.name      = name;
    this.id        = Cary.tools.isNothing (id) ? null : id;
    this.documents = [];
    this.subGroups = [];
};

doc.DocumentGroup.prototype.enumDocuments = function (callback, param)
{
    this.documents.forEach (callback, param);
};

doc.DocumentGroup.prototype.enumSubGroups = function (callback, param)
{
    this.subGroups.forEach (callback, param);
};

doc.DocumentGroup.prototype.serialize = function ()
{
    var result = { name: this.name, id: this.id, documents: [], subGroups: [] };
    
    this.enumDocuments (function (doc)
                        {
                            result.documents.push (doc.serialize ());
                        });
    
    this.enumSubGroups (function (group)
                        {
                            result.subGroups.push (group.serialize ());
                        });
    
    return result;
};

doc.DocumentGroup.prototype.deserialize = function (source)
{
    var instance = this;
    
    this.name = 'name' in source ? source.name : null;
    this.id   = 'id' in source ? source.id : null;

    if ('documents' in source)
        source.documents.forEach (function (docSource)
                                  {
                                      var newDoc = new doc.Document ();
                                      
                                      newDoc.deserialize (docSource);
                                      
                                      instance.documents.push (newDoc);
                                  });
    
    if ('subGroups' in source)
        source.subGroups.forEach (function (groupSource)
                                  {
                                      var subGroup = new doc.DocumentGroup ();
                                      
                                      subGroup.deserialize (groupSource);
                                      
                                      instance.subGroups.push (subGroup);
                                  });
};

doc.DocumentGroup.prototype.addGroup = function (name, id)
{
    var subGroup = new doc.DocumentGroup (name, id);
    
    this.subGroups.push (subGroup);
    
    return subGroup;
};

doc.DocumentGroup.prototype.addDocument = function (name, link, date, id)
{
    var newDoc = new doc.Document ({ name: name, link: link, date: date, id: id });
    
    this.documents.push (newDoc);
    
    return newDoc;
};
