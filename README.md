MBO API
=======

Description
-----------
A library implementing communication with the MINDBODY Online [Public API](https://developers.mindbodyonline.com/PublicDocumentation/GettingStarted). Uses a Factory pattern to create SOAP clients that communicate with the API.

Installation
------------
```
npm install mbo-api
```


Use
---
#### Set Up
To set up the services you first `require` the package in your code, creating the service factory.
```javascript
var mboFactory = require( 'mbo-api' );
```
You must then set the [source credentials](https://developers.mindbodyonline.com/PublicDocumentation/Authentication) from your MINDBODY Online Developers account.
> Note that versions 1.X of this package use Source Credentials to authenticate requests to the server. In version 6 of the API, this will become depreicated and authentication will shift to API Keys.
> When using API Key authentication, only one site id may be used.
```javascript
mboFactory.setSourceCredentials( <SOURCENAME>, <PASSWORD> );
mboFactory.setApiKey( <API KEY>)
```
The factory is now ready for use :)

#### Services
There are [5 services](https://developers.mindbodyonline.com/PublicDocumentation/Overview) that can be called upon:
* Class
* Client
* Sale
* Site
* Staff

To create an instance of a service you use the `create<Service>Service` or `create<Service>ServiceAsync` functions. The former returns the service immediately, while the latter returns an A+ Promise resolved with the service. It is highly recommended to use the `Async` versions of creation.
```javascript
var clientService = mboFactory.createClientService();
clientService.on( 'ready', callback )

mboFactory.createStaffServiceAsync()
    .then( function( staffService ) {
        ...
    } );
```

Each service implements the functions defined by the WSDL as `service.<function>` (retaining capitalization), and accepts the stated arguments as an object. These functions return an A+ Promise that resolve to the results extracted from the response. The raw response from the function can be obtained using the functions `service.<function>Response` (again, retaining capitalization).
```javascript
clientService.GetClients( { SearchText: filter } )
    .then( function( clients ) {
        ...
    } );
    
classService.GetClassVisits( { ClassID: id } )
    .then( function( clients ) {
        ...
    } );
    
siteService.GetActivationCodeResponse()
    .spread( function( result, raw, header ) {
        ...
    } );
```

In addition, multiple custom functions have been implemented for common tasks performed in each of the services. These are differentiated from the API defined function by beginning with a lower case letter.

##### Common Functions
These are functions that all the services have.
* **`setUserCredentials( <username>, <password>, <siteIds> )`**: Sets the [User Credentials](https://developers.mindbodyonline.com/PublicDocumentation/Authentication#user-credentials) for authentication of calls that require them.

* **`useDefaultCredentials()`**: Sets the [User Credentials](https://developers.mindbodyonline.com/PublicDocumentation/Authentication#user-credentials) to the default, which are the Source Credentials, with the username prepended with an underscore.

* **`addSiteIds( <siteIds> )`**: Adds the provided site ids to the service for interaction.

* **`defaultParam( <key>, [<value>] )`**: Gets or sets the default value of the [common call parameter](https://developers.mindbodyonline.com/PublicDocumentation/WorkingWithSOAP) `<key>`.  

* **`log( <type>, <path>, <host>, <port> )`**: Enables or disables logging for the service. See below for more details.

##### Class Service
* **`getClassAttendees( <classId> )`**: Returns an A+ Promis resolved with the ids of clients who attended the class identified by `classId`. 

##### Client Service
* **`getClientCount( <search> )`**: Returns an A+ Promise resolved with the number of clients filtered by `search`, as described by the [`GetClients`](https://developers.mindbodyonline.com/PublicDocumentation/ClientService#getclients) `SearchText` parameter.

* **`getAllClients( <search>, <params> )`**: Returns an A+ Proimise resolved with all the clients filtered by `search`, as described by the [`GetClients`](https://developers.mindbodyonline.com/PublicDocumentation/ClientService#getclients) `SearchText` parameter. `params` can be used to set the [common call parameters](https://developers.mindbodyonline.com/PublicDocumentation/WorkingWithSOAP).

* **`getClientsById( <ids>, <params> )`**: Returns an A+ Promise resolved to an array of clients with ids matching `ids`. `params` can be used to set the [common call parameters](https://developers.mindbodyonline.com/PublicDocumentation/WorkingWithSOAP).

* **`getClientById( <id> )`**: Returns an A+ Promise resolved to the client with id `id`. 

* **`getClientIndexValues( <id> )`**: Returns an A+ Promise resolved to an array of objects represting the [Client Index Values](https://support.mindbodyonline.com/s/article/203259183-Client-Indexes) of the client with id `id`. Each object has the form `{ index: { id, name }, value: { id, name } }`. Client Indexes which do not have an assigned value are excluded.

* **`getClientAccountBalancesById( <ids> )`**: Returns an A+ Promise resolved to an object with keys `ids` and values of those client's account balances. Acts as a wrapper for the [`GetClientAccountBalances`](https://developers.mindbodyonline.com/PublicDocumentation/ClientService) API function.

##### Site Service
> The `GetActivationCodes` function has been slightly modified for ease of use. As opposed to the return value described by the WSDL, it returns an A+ Promised resolved to an object of the form `{ ActivationCode: <activation code>, ActivationLink: <activation link> }`.

* **`getActivationCodes()`**: Returns an A+ Promise resolved to an an object of the form `{ code: <activation code>, link: <activation link> }`.

* **`hasSiteAccess( <id> )`**: Returns an A+ Promise resolved to `true` or `false` of whether provided credentials have access to the site identified by `id`.

##### Events
The MBO API package uses events to notify you when your service is ready to be used. When the service is first created it will emit an `initialized` event. However, the service is not ready to be used until the `ready` event is emitted.

Logging
-------
The `mbo-api` package enables logging metadata of the calls the API makes for use in statistics and debugging. There are two types of logging. Setting the `type` parameter to `'local'` will log the metadata to the local file given in `path`. Setting the `type` parameter to `remote` will send the metadata via an `http` request to `host:port/path`. `type` can also be set to false to disable logging.

The metadata is stored or sent as a JSON string with keys `service`, `params`, `method`, `error`. `service` is the name of the service being used. `params` describes both the [common call parameters](https://developers.mindbodyonline.com/PublicDocumentation/WorkingWithSOAP), and the method specifc parameters used in the call. `method` was the method called on the service. `error` is `undefined` unless an error occurred, in which case it is an object with keys `status`, `errorCode`, and `message`.
