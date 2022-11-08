const { HttpWrapper } = require("./utils");

class Graylog extends HttpWrapper {
  constructor(env) {
    super();
    // eslint-disable-next-line compat/compat
    const graylogUrl = new URL(env.GRAYLOG_URL);
    const credentials = Buffer.from(env.GRAYLOG_CREDENTIALS).toString("base64");
    this.commonOptions = {
      hostname: graylogUrl.hostname,
      port: graylogUrl.port,
      headers: {
        "X-Requested-By": "Learning Analytics Playground",
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${credentials}`,
      },
    };
    this.title = env.GRAYLOG_TEST_INPUT_TITLE;
    this.searchId = env.GRAYLOG_TEST_SEARCH_ID;
    this.searchLimit = env.GRAYLOG_TEXT_SEARCH_LIMIT;
    this.searchTypeId = env.GRAYLOG_TEST_SEARCH_TYPE_ID;
    this.searchRange = env.GRAYLOG_TEST_SEARCH_RANGE_IN_SECONDS;
  }

  getInputConfiguration = (nodeId) => {
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
  };

  getSearchConfiguration = (inputId) => {
    return {
      id: this.searchId,
      queries: [
        {
          id: this.searchId,
          timerange: {
            type: "relative",
            range: this.searchRange,
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
              limit: this.searchLimit,
            },
          ],
        },
      ],
    };
  };

  /** Returns the first node ID of the Graylog cluster. */
  getNodeId = () => {
    const options = { path: "/api/cluster" };
    const callback = (data) => Object.keys(JSON.parse(data))[0];
    return this.promiseRequest(options, callback);
  };

  /** Returns the Graylog search for the given id. */
  getSearch = (searchId) => {
    const options = { path: `/api/views/search/${searchId}` };
    return this.promiseRequest(options, (data) => JSON.parse(data));
  };

  /** Returns the list of Graylog inputs. */
  listInputs = () => {
    const options = { path: "/api/system/inputs" };
    return this.promiseRequest(options, (data) => JSON.parse(data).inputs);
  };

  /** Creates a Graylog input for the specified node. */
  createInput = (nodeId) => {
    const options = { path: "/api/system/inputs", method: "POST" };
    const payload = this.getInputConfiguration(nodeId);
    return this.promiseRequest(options, (data) => JSON.parse(data), payload);
  };

  /** Activates the Graylog input. */
  activateInput = (inputId) => {
    const options = {
      path: `/api/system/inputstates/${inputId}`,
      method: "PUT",
    };
    const callback = (_, response) => response.statusCode === 200;
    return this.promiseRequest(options, callback);
  };

  /** Creates a Graylog search. */
  createSearch = (inputId) => {
    const options = { path: "/api/views/search", method: "POST" };
    const payload = this.getSearchConfiguration(inputId);
    return this.promiseRequest(options, (data) => JSON.parse(data), payload);
  };

  /** Creates the test Graylog input and test Graylog search if they don't already exist. */
  initializeInput = async () => {
    // Note regarding the Graylog input:
    // We want to create and use only one input to keep the event history from multiple test runs.
    // However, Graylog's REST API doesn't provide a way to create an input with a specific ID.
    // Due to this, we are creating an input with a specific title and try to find it in the list
    // of all available Graylog inputs.
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
    const search = await this.getSearch(this.searchId);
    if (search.message === `Search with id ${this.searchId} does not exist`) {
      await this.createSearch(inputId);
    }
  };
}

module.exports = Graylog;
