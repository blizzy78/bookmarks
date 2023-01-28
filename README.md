My Personal Bookmarks Application
=================================

![Screenshot](bookmarks.png)

This is the web application I use to manage my personal bookmarks. It's rather simplistic, but fast,
searchable, and has tags.

*I don't plan on supporting it for anyone else to use, but if you want to try it out, be my guest.
I will infrequently change things around, add, remove, and break things, so consider this a warning.
**Use backups.***


Usage
-----

To add new bookmarks, click on the "New" button. To edit or delete bookmarks, search first, then hover over
a bookmark's title, then click on the little edit button next to it.


Running
-------

To start the application, simply build it using Mage:

```shell
mage
```

Then run the executable:

```shell
./bookmarks
```

There are no other requirements to run it, the executable is self-contained.

A web server will be started at :8080. Bookmarks data will be saved to folder `./bookmarks.bleve/`


Configuration File
------------------

**config.yaml**:

```yaml
# settings for the app's web server
server:
  # bind address
  address: :8080

# settings for Algolia
algolia:
  # app ID
  app-id: ABCDEF1234

  # API key (needs write access to the index)
  api-key: 1234567890abcdef1234567890abcdef

  # index name
  index-name: bookmarks
```


Development Environment
-----------------------

I'm using my all-in-one [development container] for Visual Studio Code.

Simply press F5 in Visual Studio Code to launch both frontend and backend applications.


License
-------

This application is licensed under the MIT license.



[development container]: https://github.com/blizzy78/dev-container
