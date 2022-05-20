// Utilities
const http = require("http");

class HttpWrapper {
  boundary = null;

  static isUrlEncoded(options) {
    const contentType = options.headers["Content-Type"];
    return (
      contentType && contentType.includes("application/x-www-form-urlencoded")
    );
  }

  static isFormDataEncoded(options) {
    const contentType = options.headers["Content-Type"];
    return contentType && contentType.includes("multipart/form-data");
  }

  static urlEncode(payload) {
    // eslint-disable-next-line compat/compat
    return new URLSearchParams(payload).toString();
  }

  static getBoundary() {
    if (this.boundary) {
      return this.boundary;
    }
    // generates a 56 character boundary
    let boundary = "---------------------------";
    for (let i = 0; i < 29; i++) {
      boundary += Math.floor(Math.random() * 10).toString(16);
    }
    this.boundary = boundary;
    return boundary;
  }

  static formEncode(payload) {
    let content = [];
    Object.keys(payload).forEach((key) => {
      const { contentType, filename } = payload[key].options;
      content = content.concat([
        Buffer.from(`--${this.getBoundary()}\r\n`, "utf8"),
        Buffer.from(
          `Content-Disposition: form-data; name="${key}"; filename="${filename}"\r\n`,
          "utf8"
        ),
        Buffer.from(`Content-Type: ${contentType}\r\n\r\n`, "utf8"),
        payload[key].value,
        Buffer.from(`\r\n--${this.getBoundary()}`, "utf8"),
      ]);
    });
    content = content.concat(Buffer.from("--\r\n", "utf8"));
    return Buffer.concat(content);
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
    let encoded = null;
    if (this.isUrlEncoded(options)) {
      encoded = this.urlEncode(payload);
    } else if (this.isFormDataEncoded(options)) {
      encoded = this.formEncode(payload);
      const contentType = `multipart/form-data; boundary=${this.getBoundary()}`;
      options.headers["Content-Type"] = contentType;
    } else {
      encoded = this.jsonEncode(payload);
    }
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

const getAssets = (courseName = "demoCourse1") => {
  return Cypress.env("EDX_COURSES")[courseName].assets;
};

const getProblem = (section, problemName, unitName = null) => {
  unitName = unitName || problemName;
  return section.vertical[unitName].problem[problemName];
};

const getSectionAndURL = (
  sectionName,
  chapterName = "demoChapter1",
  courseName = "demoCourse1"
) => {
  const course = Cypress.env("EDX_COURSES")[courseName];
  const chapter = course.chapter[chapterName];
  const section = chapter.sequential[sectionName];
  const { courseId } = course;
  const chapterId = getXblockId(chapter);
  const sectionId = getXblockId(section);
  const sectionUrl = `/courses/${courseId}/courseware/${chapterId}/${sectionId}/`;
  return [section, sectionUrl];
};

const getXblockId = (xBlock) => {
  return xBlock.locator.slice(-32);
};

module.exports.HttpWrapper = HttpWrapper;
module.exports.isSubset = isSubset;
module.exports.getAssets = getAssets;
module.exports.getSectionAndURL = getSectionAndURL;
module.exports.getProblem = getProblem;
module.exports.getXblockId = getXblockId;
