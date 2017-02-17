Backpack for MongoDB
====================

Backpack is a Content Management System based on [MongoDB](http://www.mongodb.org/).
As a developer, you can simply focus on your front-end and use Backpack to manage
your content, such as HTML pages, images, menus, etc.

Backpack is designed to be very versatile in order to support a lot of different
use cases, such as custom web sites, portal pages or online shops.


Installation
------------

In order to run MongoDB you will need

* A web server (e.g. [Apache](http://httpd.apache.org/))
* PHP >=5.4
* MongoDB extension for PHP
* Either install [Imagemagick](http://www.imagemagick.org/) or the Imagemagick PHP extension

Since Backpack is using some rewrites, you should make sure that the `.htaccess` settings are
applied. This simply creates a nicer URLs, especially for GridFS files.


User management
---------------

All users are managed through MongoDB. Simply add a new user for your database.

I also recomment tools such as [RoboMongo](http://robomongo.org/) to maintain your database.

When you login to Backpack, use the following username format:

```
username@instancename
```

E.g. if your instance is called "mywebsite" and your MongoDB user is called "peter",
your login name would be "peter@mywebsite".


Building instructions
---------------------

In case you want to create your own build, you will have to install some dependencies.

### Composer dependencies ###

In order to install the required PHP libraries, run [Composer](https://getcomposer.org/).

```
> composer install
```


### Bower dependencies ###

The front-end requires several JavaScript and CSS libraries, such as

* Mootools
* CKEditor
* ACE Editor
* Bootstrap
* Roboto Fontface
* RequireJS
* Bootstrap
* gx.core
* gx.bootstrap

Simple run [Bower](http://bower.io/) in your project directory to install them.

```
> bower install
```


### Grunt ###

The building itself is done using [Grunt](http://gruntjs.com/) - besides the default builder
there is also a `dev` task, which will include all classes and files separately instead of
buidling a concatianted and minified version.

```
> npm install
> grunt
```


Instance Configuration
----------------------

When you check out the file structure, you will notice a directory called `instances`.
This directory contains the configuration files for all your different MongoDB connections.

The name of the directory reflects the name of the instance - the instance name is later being
used for the login, which has the format `username@instancename`. (More on that later)

Inside the instance directory you will find a file called `backpack.json` and a directory
called `collections`. The collections folder will contain the configuration files for
all your collections - the format for those files is described in the upcoming section.

When you checkout or download Backpack, you will see two example configurations called
"bluemixdemo" and "localdemo". The `backpack.json` contains three parameters:

* `mongo`: The connection URL and database name for MongoDB.
* `cache`: The path to your cache directory, which is used to cache preview images
* `rootpwd`: The fixed password for your root user
* `usercollection`: The collection ID for local users (default: `system.users`)
* `sandboxed`: If set, the instance can only access files inside the instance directory (default: 0)

So, a sample configuration file for your local MongoDB installation could look like this:

```json
{
    "mongo": {
        "url" : "mongodb://127.0.0.1:27017",
        "db"  : "backpack"
    },
    "cache": "./cache",
    "rootpwd": "secret",
    "usercollection": "localusers"
}
```

If you are running on [IBM Bluemix](http://www.bluemix.net) you can also simply
put the service name into to Mongo settings - see the Bluemix installation guide
bellow:

```json
{
    "mongo": {
        "service": "servicename"
    },
    "rootpwd": "demo"
}
```


Collection Configuration
-------------------------

Backpack utilized the flexible document model provided by MongoDB to enable you to
manage all sorts of different content types and meta information.

Each `.json` file in your instance's `collections` folder represents a single MongoDB
collection and includes the structure and settings for all documents that should be
contained in this collection.

Example:

```json
{
  "label": {
    "singular": "Page",
    "plural": "Pages"
  },
  "contenttype": "html",
  "published": 1,
  "icon": "star",
  "properties": {
    "title": {
      "label" : "Titel",
      "type"  : "string",
      "filter": "min_length",
      "len"   : 3
    },
    "location": {
      "type": "select",
      "allowempty": true,
      "options": [
        "header",
        "footer"
      ]
    },
    "banner": {
      "label": "Banner",
      "type": "reference:banners"
    }
  },
  "index": {
    "title": 1
  },
  "searchfields": [
    "title"
  ],
  "listfields": [
    "title"
  ]
}
```

Let's go through the individual config parameters, it's really quire simple:


### label ###

The label object simple contains the name of your collection (singular and plural).


### contenttype ###

The `contenttype` attribute defines your document's primary content.

The following content types exist:

| Content type | Editor                      |
|:-------------|:----------------------------|
| `txt`        | ACE Editor                  |
| `css`        | ACE Editor                  |
| `less`       | ACE Editor                  |
| `md`         | ACE Editor                  |
| `js`         | ACE Editor                  |
| `json`       | ACE Editor                  |
| `xml`        | ACE Editor                  |
| `html`       | ACE Editor                  |
| `raw`        | ACE Editor                  |
| `html`       | CKEditor (WYSIWYG)          |
| `none`       | No editor (only properties) |
| `file:image` | Image editor                |
| `list`       | List editor                 |


### properties ###

The `properties` object specifies the meta information that your document should include.
This is the great thing about MongoDb - you are 100% flexible in the information you want
to store for each document.

You can specify additioal form fields and properties through the following Attributes:

| Attribute    | Type         | Description                                                                 |
|:-------------|:-------------|:----------------------------------------------------------------------------|
| `label`      | string       | The form label                                                              |
| `type`       | string       | The field type (Possible values: `string`, `bool`, `select`, `reference:*`) |
| `default`    | string       | The default value                                                           |
| `options`    | object/array | An array or object with list options                                        |
| `allowempty` | int(0,1)     | Allow empty value for select boxes                                          |
| `filter`     | string       |                                                                             |


#### References ####

You can easily reference other documents simply by adding a reference field. For instance, `reference:banners`
would add a reference box to the `banners` collection.


#### Filters ####

Backpack also supports filters to validate your users' input. 

| Filter       | Description                                         | Additional params |
|:-------------|:----------------------------------------------------|:------------------|
| `ipv4`       | Validate IP v4 addresses                            |                   |
| `ipv6`       | Validate IP v6 addresses                            |                   |
| `min_length` | Requires the value to be at least n characters long | `len`: int        |
| `max_length` | Restricts the value to n characters in length       | `len`: int        |
| `intzero`    | Integer, including 0                                |                   |
| `int`        | Integer, excluding 0                                |                   |
| `float`      | Floating number, e.g. 4.23                          |                   |
| `langcode`   | Language codes, e.g. "en_US"                        |                   |
| `url`        | Validates URL format                                |                   |
| `email`      | Validates e-mail format                             |                   |
| `regexp`     | Validates the value agains a regular expression     | `regexp`: string  |


### published ###

If the parameter `published` exists, each document will include a checkbox labeled "public", which
allows you to specify if a document should be publicly available. E.g. if you publish an image,
the image URL can be viewed without being logged into Backpack.

The parameter value specifies the default setting, e.g. `"published": 1` means that for every new
document, the "public" checkbox will be checked by default.


### icon ###

You can specify an icon for each collection. Simply select one of the standard [Glyphicons](http://glyphicons.com/)
that ship with Bootstrap. You can see the full list of icons here: http://getbootstrap.com/components/


### indexes ###

Defines which properties should be indexed through MongoDB. See the MongoDb documentation on
[db.collection.ensureIndex](http://docs.mongodb.org/manual/reference/method/db.collection.ensureIndex/)
for more details.


### searchfields ###

Searchable fields can be specified through an array, which lists all field identifiers that should
be included in the global search.


### listfields ###

By default, Backpack only displays the document identifier in the document list. If you want to display
additional fields in the list, you can simply state those fields in the `listfields` array.


Additional configuration
------------------------

### Cache clean-up ###

In case you use Backpack to manage images, thumbnails for those images will be created with Imagemagick.
Those images will be cached in the instances `cache` directory. If not cleared regularly, this will
cost you some disc space after some time.

On Linux systems, simply create a file `/etc/cron.daily/backpack-cleanup`:

```
#!/bin/sh
find {cachedirectory} -type f -mtime +30 -exec rm {} \;
```

Replace `{cachedirectory}` with the path to your cache directory. This script will remove all temp files
older than 30 days.

Make sure that your script is also executable:

```
chmod 755 /etc/cron.daily/backpack-cleanup
```


Deployment on Bluemix
---------------------

We recommend using [IBM Bluemix](http://bluemix.net) - the Backpack build pack has been tested
for Bluemix and works out of the box. Also note that Bluemix is very well suited for productive
environments and scales very well. This is especially useful for online shops and e-commerce
systems, which is one of the core user groups of Backpack.

Simple follow those instructions to deploy Backpack on Bluemix:

### Step 1: Sign-up for Bluemix ###

Go to the [Bluemix Website](http://bluemix.net) and signup for a free account.

### Step 2: Download and configure Backpack ###

Simply [download backpack](https://github.com/zeyon/backpack) and unzip it or create your own fork
(follow the build instructions in that case).

In you backpack directory you will find a file called `manifest.template.yml`. Duplicate this file and
call it `manifest.yml`. Open this file with and editor and edit the settings for your application:

```yml
---
applications:
- name: {app-identifier}
  memory: 128M
  instances: 1
  host: {your-host-name}
  domain: mybluemix.net
  path: .
  buildpack: https://github.com/cloudfoundry/php-buildpack.git
```

In this file, you should now edit the following options:

* `name`: This is the unique identifier for your application
* `memory`: The memory size you require (can be quite low)
* `instances`: The number of instances (can stay at 1)
* `host`: Your app host name
* `domain`: The application domain (if unsure, leave mybluemix.net)

Next thing you need to do, is adding an instance configration, as described in configuration
guide above.

Simply edit the `backpack.json` you will find as an example in the `bluemixdemo` instance and
put the name of your MongoDB service in the settings. In this example, I have called
the service `mongo-backpack`. If you have to create a new MongoDB service (see step 4)
make sure you give it the same name as in this instance configuration file:

```json
{
    "mongo": {
        "service": "mongo-backpack"
    },
    "rootpwd": "demo"
}
```


### Step 3: Push Backpack on Bluemix ###

[Download the Cloud Foundery CLI](https://github.com/cloudfoundry/cli)
and install it on your computer.

Open a console and go into your backpack directory. First, you will have to login with your Bluemix
user account:

```
cf api https://api.ng.bluemix.net
cf login
```

After you are successfully logged in, you can upload backpack with the following command:

```
cf push -f manifest.yml
```


### Step 4: Create a new MongoDB service ###

Almost done! Now, we need to create a new service for MongoDB and connect it with Backpack.
Note that `{app-identifier}` is the same value as the `name` attribute you have specified in
you `manifest.yml` and `{db-identifier}` is the same value as the `mongo.service` parameter
in your instance's `backpack.json`.

```
cf create-service mongodb 100 {db-identifier}
cf bind-service {app-identifier} {db-identifier}
```

In order to ensure that the app environment gets updated, restart your application:

```
cf restart {app-identifier}
```


### Step 5: Login and test ###

You should now be able to login to your Backpack application. Login as `root@{instancename}`
(whereas `{instancename}` is the name you have selected for your instance directory)
and use the password your have specified in your `backpack.json` file.

In case something does not work out as planned, check the application log file for advice:

```
cf logs {app-identifier} --recent
```


About
-----

If you like the flexibility of Backpack, you might want to check out the people who are behind
it at [www.zeyos.com](https://www.zeyos.com) - we make great things happen for enterprises around the world.

Backpack has been used in a variety of projects, where customers needed a simple way to enter data
or to add content for various web applications, such as online shops, service portals or
web sites.

If you need information on commercial support or licensing, please contact us at [info@zeyos.com](mailto:info@zeyos.com).


Contributing
------------

There's many ways you can contribute to Backpack:

* Help us to maintain the Backpack website
* Add content (blog posts and tutorials)
* Create a fork and create pull requests for new features or bug-fixes

For any suggestions, simply add an issue on GitHub.


Licensing
---------

Backpack is licensed under the AGPL.
You are free to host your own system for both private and commercial use, as long
as you do not charge money for using Backpack itself. If you are interested in
commercial licensing, simply contact us.

The Backpack has been hand-crafted by [Roger Praun](http://www.roger-praun.de) - in case you
need some illustrations or a piece of art, he's the man to talk to.
