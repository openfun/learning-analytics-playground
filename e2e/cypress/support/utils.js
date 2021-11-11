// Utilities
const http = require("http");

class HttpWrapper {
  static isUrlEncoded(options) {
    return options.headers["Content-Type"].includes(
      "application/x-www-form-urlencoded"
    );
  }

  static urlEncode(payload) {
    // eslint-disable-next-line compat/compat
    return new URLSearchParams(payload).toString();
  }

  static jsonEncode(payload) {
    // eslint-disable-next-line compat/compat
    return new TextEncoder().encode(JSON.stringify(payload));
  }

  static encode(options, payload) {
    const encoded = HttpWrapper.isUrlEncoded(options)
      ? this.urlEncode(payload)
      : this.jsonEncode(payload);
    options.headers["Content-Length"] = encoded.length;
    return encoded;
  }

  /** Promise wrapper for http.request. */
  promiseRequest = (options, callback = null, payload = null) => {
    options = Object.assign(this.commonOptions, options);
    callback = callback || ((data) => JSON.parse(data));
    let encodedPayload = null;
    if (payload) {
      encodedPayload = HttpWrapper.encode(options, payload);
    }
    return new Promise((resolve, reject) => {
      const request = http.request(options, (response) => {
        let data = "";
        response.on("data", (chunk) => (data += chunk));
        response.on("end", () => resolve(callback(data, response)));
      });
      request.on("error", (error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        reject(error);
      });
      if (payload) {
        request.write(encodedPayload);
      }
      request.end();
    });
  };
}

module.exports.HttpWrapper = HttpWrapper;

// From https://stackoverflow.com/a/61676007
module.exports.isSubset = (superObj, subObj) => {
  return Object.keys(subObj).every((ele) => {
    if (typeof subObj[ele] === "object") {
      return isSubset(superObj[ele], subObj[ele]);
    }
    return subObj[ele] === superObj[ele];
  });
};
