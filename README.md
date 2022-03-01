# Learning analytics playground

## Description

This tool is dedicated to generate learning events (_aka_ tracking logs) from a LMS platform to
feed dashboard development testing datasets. It is intended to be used locally.

## Usage

### Launch Edx platform

1. Run the following command to launch the Edx platform:

```
make bootstrap
make run-edx
```

> Note: as the command includes migrations, it may take some time to complete (several minutes).
> Go grab a coffee, a tea or whatever pleases you!

2. When connections are established, you can access to:

   - the LMS server on [localhost:8072](http://localhost:8072)
   - the CMS server on [localhost:8082](http://localhost:8082)
   - the Graylog server on [localhost:9000](http://localhost:9000)

3. Two users are available for testing the LMS/CMS:

| Role    | Email             | Password |
| ------- | ----------------- | -------- |
| admin   | admin@example.com | admin    |
| student | edx@exampler.com  | edx      |

> Note that it is also possible to create customized users at your convenience,
> but remember that those accounts will not persist if you remove the database container.

### Run end-to-end tests

In this playground, end-to-end tests have been implemented to simulate learning events generation.

As this project is evolving, the tests will progressively comprises a wide panel of use cases.

> Note that when running the tests for the first time their execution takes a bit longer because 
> of the course seeding.

The following command runs end-to-end tests:

```
make test
```

## Graylog

Generated events with end-to-end tests or with manual navigation on the LMS service are observable on the Graylog server.

### Configure an input on Graylog interface

1. Access Graylog interface with `admin`:`admin` credentials.

2. To configure the input where to listen the LMS server, click on `System` bar menu and `Inputs`
   button.

3. On Select input, choose `GELF TCP` and click on <kbd>Launch new input</kbd> button.

4. In the input window appearing, enter the input title you want.

5. Check that binding adress is `0.0.0.0` and the listening port is 12201.

6. Ensure that `Null frame delimiter?` option is activated (on the bottom of the windows),
   otherwise logs won't be recognized and streamed.

7. Click on <kbd>Save</kbd> button.

### Stream events

1. Go on LMS server and navigate through the website.

2. On the Graylog server, go on `Search` and update the timeframe on `Search in all messages`
   option if no logs are visible.

3. You should see appearing a list of all the messages you have generated!

## Keycloak

The keycloak SSO service is pre-configured for the `fun-mooc` realm. Once
started with the project's `make run`, it can be accessed at
[http://localhost:8080](http://localhost:8080). Administrator credentials are:
`admin:pass`.

For now only the `potsie` client has been configured to login to grafana (see
the [openfun/potsie](https://github.com/openfun/potsie) project) using a
Keycloak account (it should have been created by the `make bootstrap` command).
You can login to grafana using the following credentials: `grafana:funfunfun`.

## License

This work is released under the MIT license (see [LICENSE](./LICENSE)).
