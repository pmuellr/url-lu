url-lu: CLI access to a toml database of urls and passwords
===============================================================================

`url-lu` is a command-line tool that reads a [TOML][] database of urls and
passwords, and provides queries over that data.

[TOML]: https://github.com/toml-lang/toml

Here's an example database:

```toml
# url-lu configuration file: see https://github.com/pmuellr/url-lu
# file must be named ~/.url-lu.toml
# file must be set to mode 600 to be used

[dev.urls]
elasticsearch = "https://els.example.com:19200"
kibana        = "https://kbn.example.com:15601"

[dev.passwords]
elastic = "changeme"
testing = "testing"

[prod.urls]
elasticsearch = "https://els.example.com:9200"
kibana        = "https://kbn.example.com:5601"

[prod.passwords]
elastic = "super-secret"
testing = "another-super-secret"
```

For the file above, there are two groups: `dev` and `prod`. Each group defines
two urls, named `elasticsearch` and `kibana`.  Each group also defines two
users, named `elastic` and `testing`, and the passwords for those users.

Below are some example queries you can run against this database:

```console
$ url-lu password dev elastic
changeme

$ url-lu user:password dev elastic
elastic:changeme

$ url-lu url dev kibana
https://kbn.example.com:15601/

$ url-lu url dev kibana elastic
https://elastic:changeme@kbn.example.com:15601

$ url-lu dump # passwords are not printed with the dump command
group dev
    urls
        elasticsearch https://els.example.com:19200
        kibana        https://kbn.example.com:15601
    users
        elastic
        testing

group prod
    urls
        elasticsearch https://els.example.com:9200
        kibana        https://kbn.example.com:5601
    users
        elastic
        testing
```

## usage

    url-lu password <group> <user>
        writes the password for the specified group / user

    url-lu user:password <group> <user>
        writes the user:password for the specified group / user

    url-lu url <group> <urlName> [<user>]
        writes the url for the specified group / urlName,
        with optional user/password

    url-lu dump
        writes the data from `~/.url-lu.toml` without the passwords

options:

    -h --help       print this help
    -v --version    print the version of the program

Set the DEBUG environment variable to anything to get diagnostic output.

## install

    npm install -g pmuellr/url-lu

## change log

#### 1.0.0 - 2020-02-01

- initial release
