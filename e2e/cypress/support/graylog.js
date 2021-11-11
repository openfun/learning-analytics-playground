const { HttpWrapper } = require("./utils");

class Graylog extends HttpWrapper {
  constructor(env) {
    super();
    this.env = env;
    this.commonOptions = {
      hostname: env.GRAYLOG_HOST,
      port: env.GRAYLOG_PORT,
      headers: {
        "X-Requested-By": "Learning Analytics Playground",
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(env.GRAYLOG_CREDENTIALS).toString(
          "base64"
        )}`,
      },
    };
    this.title = env.GRAYLOG_TEST_INPUT_TITLE;
    this.searchId = env.GRAYLOG_TEST_SEARCH_ID;
    this.searchTypeId = env.GRAYLOG_TEST_SEARCH_TYPE_ID;
  }

  getInputConfiguration(nodeId) {
    return {
      title: this.title,
      type: "org.graylog2.inputs.gelf.tcp.GELFTCPInput",
      configuration: {
        bind_address: "0.0.0.0",
        port: 12201,
        tls_enable: false,
      },
      node: nodeId,
    };
  }

  getSearchConfiguration(inputId) {
    return {
      id: this.searchId,
      queries: [
        {
          id: this.searchId,
          timerange: {
            type: "relative",
            range: this.env.GRAYLOG_TEST_SEARCH_RANGE_IN_SECONDS,
          },
          query: {
            type: "elasticsearch",
            query_string: "gl2_source_input:" + inputId,
          },
          search_types: [
            {
              id: this.searchTypeId,
              sort: [{ field: "timestamp", order: "DESC" }],
              type: "messages",
            },
          ],
        },
      ],
    };
  }

  /** Returns the first nodeId of the graylog cluster. */
  getNodeId() {
    const options = { path: "/api/cluster", method: "GET" };
    return this.promiseRequest(
      options,
      (data) => Object.keys(JSON.parse(data))[0]
    );
  }

  /** Returns the graylog search for the given id. */
  getSearch(searchId) {
    const options = { path: `/api/views/search/${searchId}`, method: "GET" };
    return this.promiseRequest(options);
  }

  /** Returns the list of graylog inputs. */
  listInputs() {
    const options = { path: "/api/system/inputs", method: "GET" };
    return this.promiseRequest(options, (data) => JSON.parse(data).inputs);
  }

  /** Creates a graylog input for the specified node. */
  createInput(nodeId) {
    const options = { path: "/api/system/inputs", method: "POST" };
    return this.promiseRequest(
      options,
      null,
      this.getInputConfiguration(nodeId)
    );
  }

  /** Activates the graylog input. */
  activateInput(inputId) {
    const options = {
      path: `/api/system/inputstates/${inputId}`,
      method: "PUT",
    };
    return this.promiseRequest(
      options,
      (_, response) => response.statusCode === 200
    );
  }

  /** Creates a Graylog search. */
  createSearch(inputId) {
    const options = { path: "/api/views/search", method: "POST" };
    return this.promiseRequest(
      options,
      null,
      this.getSearchConfiguration(inputId)
    );
  }

  /** Creates the test graylog input and test graylog search if they don't already exist. */
  async initializeInput() {
    // Note regarding the Graylog input:
    // We want to create and use only one input to keep the event history from multiple test runs.
    // However, Graylogs REST API doesn't provide a way to create an input with a specific ID.
    // Due to this, we are creating an input with a specific title and try to find it in the list
    // of all available graylog inputs.
    let inputId = null;
    const inputList = await this.listInputs();
    for (let i = 0; i < inputList.length; i++) {
      if (inputList[i].title === this.title) {
        inputId = inputList[i].id;
        break;
      }
    }
    if (!inputId) {
      const nodeId = await this.getNodeId();
      inputId = (await this.createInput(nodeId)).id;
    }
    await this.activateInput(inputId);
    let search = await this.getSearch(this.searchId);
    if (search.message === `Search with id ${this.searchId} does not exist`) {
      search = await this.createSearch(inputId);
    }
  }
}

module.exports = Graylog;
