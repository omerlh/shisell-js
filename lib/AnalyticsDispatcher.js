var deepExtend = require('./deep-extend');
var AnalyticsContext = require('./AnalyticsContext');

function AnalyticsDispatcher(dispatch, context){
    var self = this;
    self.Context = context || new AnalyticsContext();

    self.dispatch = function(eventName, analyticsContext) {
        var unionContext = unionContexts(self.Context, analyticsContext);
        return dispatch(eventName, unionContext);
    };

    function unionContexts(oldContext, newContext){
        var unionContext = {};
        deepExtend(unionContext, oldContext);
        deepExtend(unionContext, newContext || {});
        unionContext.Scopes = unionArrays(oldContext.Scopes,(newContext || {}).Scopes);
        unionContext.Filters = unionArrays(oldContext.Filters,(newContext || {}).Filters);
        return unionContext;
    }

    function unionArrays(first,second){
        if (!first) return second || [];
        if (!second) return first || [];
        return first.concat(second);
    }

    return self;
}

AnalyticsDispatcher.prototype.withContext = function(analyticsContext){
    return new AnalyticsDispatcher(this.dispatch, analyticsContext);
};

AnalyticsDispatcher.prototype.createScoped = function(scope){
    var newContext = new AnalyticsContext();
    newContext.Scopes = [scope];
    return this.withContext(newContext);
};

AnalyticsDispatcher.prototype.withExtra = function(key,value){
    var newContext = new AnalyticsContext();
    newContext.ExtraData[key] = value;
    return this.withContext(newContext);
};

AnalyticsDispatcher.prototype.withExtras = function(extras) {
    if (!extras || (typeof extras !== 'object')) return this; 
    var newContext = new AnalyticsContext();
    newContext.ExtraData = extras;
    return this.withContext(newContext);
} 

AnalyticsDispatcher.prototype.withFilter = function(filter){
    if (!filter) return this;
    var newContext = new AnalyticsContext();
    newContext.Filters.push(filter);
    return this.withContext(newContext);
};

AnalyticsDispatcher.prototype.withFilters = function(filters){
    if (!filters) return this;
    var newContext = new AnalyticsContext();
    newContext.Filters.push.apply(newContext.Filters, filters);
    return this.withContext(newContext);
};

AnalyticsDispatcher.prototype.withMeta = function(key,value){
    var newContext = new AnalyticsContext();
    newContext.MetaData[key] = value;
    return this.withContext(newContext);
};

AnalyticsDispatcher.prototype.withIdentity = function (key, value) {
    var newContext = new AnalyticsContext();
    newContext.Identities[key] = value;
    return this.withContext(newContext);
};

AnalyticsDispatcher.prototype.withIdentities = function(identities) {   
    if (!identities || (typeof identities !== 'object')) return this; 
    var newContext = new AnalyticsContext();
    newContext.Identities = identities;
    return this.withContext(newContext);
}

module.exports = AnalyticsDispatcher;
