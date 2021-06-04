# Learning analytics playground

## Description

This tool is a first draft of connecting an LMS interface to a Graylog server to create a dataset 
of learning logs.

It is intended to be used locally. 
Currently, it is using [OpenEdx](https://github.com/openfun/openedx-docker)'s LMS service 
(with the fun-flavored dogwood's release).

## Getting started

- Clone the current repository.

- When using the tool for the first time, you need to run migrations. Run the following command:

```
make migrate
```

The tool is now ready for use ! :rocket:

## Usage

### Run the learning analytics playground tool

The whole learning tool (both LMS and graylog servers) are launched in one command. 

1. Run the following command:

```
make run
```

2. When connections are established, you can access:

    * the LMS server on [localhost:8072/login](http://localhost:8072/login)
    * the CMS server on [localhost:8082/signin](http://localhost:8072/signin)
    * the Graylog server on [localhost:9000](http://localhost:9000)


3. Two users are available for testing the LMS/CMS:

    * admin: `admin@example.com`:`admin`
    * student: `edx@example.com`:`edx`


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

### Stream logs from LMS server

1. Go on LMS server and navigate through the website.

2. On the Graylog server, go on `Search` and update the timeframe on `Search in all messages` 
option if no logs are visible. 

3. You should see appearing a list of all the messages you have generated!

## License

This work is released under the MIT license (see [LICENSE](./LICENSE)).
