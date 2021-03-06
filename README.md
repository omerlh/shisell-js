# ![Shisell](http://i.imgur.com/mDUAVwl.png)
[![Build Status](https://api.travis-ci.org/Soluto/shisell-js.svg?branch=master)](https://travis-ci.org/Soluto/shisell-js)
[![Code Climate](https://codeclimate.com/github/Soluto/shisell-js/badges/gpa.svg)](https://codeclimate.com/github/Soluto/shisell-js)
[![Test Coverage](https://codeclimate.com/github/Soluto/shisell-js/badges/coverage.svg)](https://codeclimate.com/github/Soluto/shisell-js/coverage)
[![Dependency Status](https://www.versioneye.com/user/projects/595b5fa5368b080033562e8b/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/595b5fa5368b080033562e8b)

Shisell is a service agnostic abstraction for analytic dispatchers.

It helps you dispatch analytic events that are scoped to a component or module with extra data, different identities, meta data and lazy filters. Shisell's analytic dispatchers are immutable and can be composed by passing a dispatcher to a child module. Shisell can be used as an abstraction for sending analytic events so you can switch and add services without rewriting the actual dispatch code.

Shisell is isomorphic and can be used on different environments (client, server, and native).

## Install

```sh
$ npm install --save shisell
```

## Usage

When you dispatch analytics with shisell in ends up calling the writer function that is passed to the root dispatcher. A writer function is just a function that accepts an object of the type [AnalyticsEventModel](https://github.com/Soluto/shisell-js/blob/master/lib/AnalyticsEventModel.js), and usually writes it to an analytics service (e.g. Mixpanel, Google Analytics etc.).
Shisell provides a writer out of the box that writes the event to the console. Once the root dispatcher is created you can compose dispatchers by calling one of the Dispatcher extension methods. Finally, call dispatch on one of the dispatchers with an event name.

```js
//Creating the root dispatcher
var rootDispatcher = shisell.createRootDispatcher(shisell.writers.console);

//Composing dispatchers
var loginViewDispatcher = rootDispatcher.createScoped('LoginView');
var registrationBoxDispatcher = loginViewDispatcher.withExtra('type', 'registration');
//...
document.getElementById('btn-register').addEventListener("click", function(){
  registrationBoxDispatcher.withIdentity('email', userEmail).withExtra('btn','register').dispatch('click');
});

//console output:
// {  
//    "Scope":"LoginView",
//    "Name":"click",
//    "MetaData":{},
//    "ExtraData":{  
//       "type":"registration",
//       "btn":"register"
//    },
//    "Identities":{  
//       "email":"shisell@soluto.com"
//    }
// }
```

#### Using Filters

Filters are functions that are run by the root dispatcher at the time of the dispatch. Filters can be used to add dynamic values at any dispatcher level to the resulting event model. Here's an example adding a Timestamp propery:

```js
var rootDispatcher = shisell
                      .createRootDispatcher(shisell.writers.console)
                      .withFilter(function(model){
                        return Promise.resolve()
                          .then(function(){
                            model.ExtraData["timestamp"] = new Date().getTime();
                          });
                        });

var homePageDispatcher = rootDispatcher.createScoped('HomePage');
//...
homePageDispatcher.dispatch('PageView')

//console output:
// {  
//    "Scope":"HomePage",
//    "Name":"PageView",
//    "MetaData":{  
//
//    },
//    "ExtraData":{  
//       "timestamp":1448185925589
//    },
//    "Identities":{  
//
//    }
// }
```

Note: currently filters have to be asynchronous (return a promise).

#### Extending the Dispatcher
We use several different extension methods for composing dispatchers, and you can easily add a custom one. For example, let's say that we frequently create dispatchers with several extra data properties that are part of our user model. So we have this sort of code often:

```js
var homeViewDispatcher = rootDispatcher
                          .withExtra('firstName', user.firstName)
                          .withExtra('lastName', user.lastName)
                          .withExtra('email', user.email)
                          .withExtra('age', user.age);
```

Instead of writing this code every time you can add an extension method that does this for you:

```js
//Extending the dispatcher (to preserve 'this' semantics, don't use an arrow function)
shisell.ext.withUser = function(user){
  var newContext = new AnalyticsContext();
  newContext.ExtraData['firstName'] = user.firstName;
  newContext.ExtraData['lastName'] = user.lastName;
  newContext.ExtraData['email'] = user.email;
  newContext.ExtraData['age'] = user.age;
  return this.withContext(newContext);
}

//Usage
var homeViewDispatcher = rootDispatcher.withUser(user);
```

#### Creating a Custom Root Dispatcher
When you call 'dispatch' on a dispatcher, it creates a union of the [AnalyticsContext](https://github.com/Soluto/shisell-js/blob/master/lib/AnalyticsContext.js) of each dispatcher along the way until reaching the root dispatcher. The default root dispatcher that is generated by calling 'createRootDispatcher' simply converts the unified context to an AnalyticsEventModel and passes it on to the writer function.

If you would like to use a different model than the AnalyticsEventModel you can create your own custom dispatcher by creating a new [AnalyticsDispatcher](https://github.com/Soluto/shisell-js/blob/master/lib/AnalyticsDispatcher.js) and passing it a function that receives two parameters - the eventName and the context.

Note: it is the root dispatcher's responsibility to run the filters.

## Contributing
Thanks for thinking about contributing! We are looking for contributions of any sort and size - features, bug fixes, documentation or anything else that you think will make shisell better.
* Fork and clone locally
* Create a topic specific branch
* Add a cool feature or fix a bug
* Add tests
* Send a Pull Request

#### Running Tests
```sh
$ npm test
```
