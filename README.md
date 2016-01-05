# JustMatch API Frontend [![Code Climate](https://codeclimate.com/repos/568b9c653e8d2f3e5c0005cd/badges/3f87038cad7a3c82ba49/gpa.svg)](https://codeclimate.com/repos/568b9c653e8d2f3e5c0005cd/feed)

Welcome to the, official, frontend for the Just Arrived matching service.

* [Built with](#built-with)
* [Getting started](#getting-started)
* [Deploy](#deploy)
* [Contributing](#contributing)
* [License](#license)

## Built with

* NodeJS 5
* Angular 1.4

## Getting Started

```
$ git clone git@github.com:justarrived/just-match-frontend.git
$ cd just-match-frontend
$ bin/setup
$ bin/server
# You can now open http://localhost:9000
```

You now have a NodeJS webserver accepting requests at [http://localhost:9000](http://localhost:9000) and a server on /api proxying to api.example.com.

## Deploy

:warning: The deploy isn't finalized yet, but it will most definitely be something along the lines of pushing a few static files to AWS S3.

Build release

```
$ grunt build
```

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

## License

This project is open source and licensed under the permissive [MIT](LICENSE.txt) license
