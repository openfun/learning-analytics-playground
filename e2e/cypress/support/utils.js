// Utilities
const http = require("http");

class HttpWrapper {
  static isUrlEncoded(options) {
    const contentType = options.headers["Content-Type"];
    return (
      contentType && contentType.includes("application/x-www-form-urlencoded")
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
    delete options.headers["Content-Length"];
    if (!payload) {
      return null;
    }
    const encoded = HttpWrapper.isUrlEncoded(options)
      ? this.urlEncode(payload)
      : this.jsonEncode(payload);
    options.headers["Content-Length"] = encoded.length;
    return encoded;
  }

  /** Promise wrapper for http.request. */
  promiseRequest = (options, callback = null, payload = null) => {
    const mergedOptions = { ...this.commonOptions, ...options };
    callback = callback || (() => {});
    payload = HttpWrapper.encode(mergedOptions, payload);
    return new Promise((resolve, reject) => {
      const request = this.request(mergedOptions, resolve, callback);
      request.on("error", (error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        reject(error);
      });
      if (payload) {
        request.write(payload);
      }
      request.end();
    });
  };

  request = (options, resolve, callback) => {
    return http.request(options, (response) => {
      if (response.statusCode >= 400) {
        const msg = `Response status code ${response.statusCode}`;
        // eslint-disable-next-line no-console
        console.error(msg);
      }
      let data = "";
      response.on("data", (chunk) => (data += chunk));
      response.on("end", () => resolve(callback(data, response)));
    });
  };
}

// From https://stackoverflow.com/a/61676007
const isSubset = (superObj, subObj) => {
  return Object.keys(subObj).every((ele) => {
    if (typeof subObj[ele] === "object" && typeof superObj[ele] === "object") {
      return isSubset(superObj[ele], subObj[ele]);
    }
    return subObj[ele] === superObj[ele];
  });
};

module.exports.HttpWrapper = HttpWrapper;
module.exports.isSubset = isSubset;
