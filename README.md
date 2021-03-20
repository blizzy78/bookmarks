My Personal Bookmarks Application
=================================

![Screenshot](bookmarks.png)

This is the web application I use to manage my personal bookmarks. It's rather simplistic, but searchable,
and has tags.

*I don't plan on supporting it for anyone else to use, but if you want to try it out, be my guest.
I will infrequently change things around, add, remove, and break things, so consider this a warning.
**Use backups.***


Usage
-----

You can use Lucene-style search syntax in the query field, such as

- `foo bar` (same as `foo OR bar`)
- `foo AND bar`
- `+foo -bar +tags:baz -tags:qux`

Click on any tag in the search results to add it to the query.

To add new bookmarks, click on the "New" button. To edit or delete bookmarks, search first, then hover over
a bookmark's title, then click on the little edit button next to it.


Running
-------

To start the application, simply build it using go:

```shell
go build -o bookmarks .
```

then run the executable:

```shell
WWW_LOGIN=<login> WWW_PASSWORD=<password> ./bookmarks
```

There are no other requirements to run it, the executable is self-contained.

A web server will be spun up at :8080. Bookmarks data will be saved to folder `./bookmarks.bleve/`


Development Environment
-----------------------

I'm using my all-in-one [dev container] for Visual Studio Code.

After initial checkout of the project inside the dev container, run inside the container:

```shell
npm install
```

to install dev dependencies.

Then simply press F5 in Visual Studio Code to launch. The launch configuration has `user`/`pass` set up
as login credentials. It is also set up to always load templates from disk so that the application does not
need to be restarted.


CSS
---

The application uses [Tailwind CSS] for all CSS, except for editing tags.

To regenerate the embedded CSS file `templates/css/bookmarks.css`, run inside the container:

```shell
make css-prod
```

This will generate the file and strip it down to the bare minimum required for production.

To generate a full-blown CSS file for development instead, run:

```shell
make css
```


License
-------

This application is licensed under the MIT license.



[Tailwind CSS]: https://tailwindcss.com/
[dev container]: https://github.com/blizzy78/dev-container
