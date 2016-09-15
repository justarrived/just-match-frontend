# JustMatch API Frontend [![Code Climate](https://codeclimate.com/repos/568b9c653e8d2f3e5c0005cd/badges/3f87038cad7a3c82ba49/gpa.svg)](https://codeclimate.com/repos/568b9c653e8d2f3e5c0005cd/feed)

Welcome to the, official, frontend for the Just Arrived matching service.

* [Built with](#built-with)
* [Getting started](#getting-started)
* [Deploy](#deploy)
* [Commands](#commands)
* [Contributing](#contributing)
* [Contributors](#contributors)
* [License](#license)

## Built with

* NodeJS 5
* Angular 1.4

## Getting Started [![Stories in Ready](https://badge.waffle.io/justarrived/just-match-frontend.svg?label=ready&title=Ready+tasks)](http://waffle.io/justarrived/just-match-frontend)

:warning: If you are on a Windows machine please see the [Getting Started on Windows](#getting-started-on-windows) section.

```
$ git clone git@github.com:justarrived/just-match-frontend.git
$ cd just-match-frontend
$ script/setup
$ script/server
# You can now open http://localhost:9000
```

You now have a NodeJS webserver accepting requests at [http://localhost:9000](http://localhost:9000) and a server on /api proxying to api.example.com.

## Getting Started on Windows

```
$ git clone git@github.com:justarrived/just-match-frontend.git
```

In order to run the app make sure you have Ruby and SASS installed, if you don't follow step 1 and 2 in this guide: https://www.impressivewebs.com/sass-on-windows/.

Install grunt

```
sudo npm install -g grunt-cli
```

Install all dependencies

```
npm install
```

Finally start the app

```
grunt watch
```

You now have a NodeJS webserver accepting requests at [http://localhost:9000](http://localhost:9000) and a server on /api proxying to api.example.com.

## Deploy

:warning: The deploy isn't finalized yet, but it will most definitely be something along the lines of pushing a few static files to AWS S3.

Build release

```
$ grunt build
```

## Commands

There are a few connivence commands

* `script/bootstrap` - installs/updates all dependencies
* `script/setup` - sets up a project to be used for the first time
* `script/server` - starts app

## Contributing

We would love if you'd like to help us build and improve this product for the
benefit of everyone. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org/) code of conduct.

Any contributions, feedback and suggestions are more than welcome.

If you want to contribute

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Translations

Translations are managed at [Transifex](https://www.transifex.com/justarrived/just-match-frontend).

To push or pull new translations, you need to install the [Transifex client](http://docs.transifex.com/client/setup/).

__Fetch translations from transifex__

```
$ script/pull-translations
```

__Push source language file to transifex__

```
$ script/push-translations
```

The configuration is in [.tx/config](.tx/config).

## Contributors

[Our awesome contributors](https://github.com/justarrived/just-match-frontend/graphs/contributors).

## License

This project is open source and licensed under the permissive [MIT](LICENSE.txt) license
