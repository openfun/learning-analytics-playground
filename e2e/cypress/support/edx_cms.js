const { URL } = require("url");
const fs = require("fs");
const { HttpWrapper } = require("./utils");

class EdxCms extends HttpWrapper {
  categories = ["chapter", "sequential", "vertical", "problem"];

  constructor(env) {
    super();
    this.env = env;
    const edxCmsUrl = new URL(env.EDX_CMS_URL);
    this.commonOptions = {
      hostname: edxCmsUrl.hostname,
      port: edxCmsUrl.port,
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
  }

  /** Adds the login cookie and csrftoken to commonOptions. */
  setLoginCookie() {
    const options = {
      path: "/login_post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    };
    const callback = (_, response) => {
      const cookie = response.headers["set-cookie"];
      this.commonOptions.headers.Cookie = cookie.join(";");
      this.commonOptions.headers["X-CSRFToken"] = cookie[0].substring(10, 42);
    };
    const payload = {
      email: this.env.EDX_ADMIN_EMAIL,
      password: this.env.EDX_ADMIN_PASSWORD,
      honor_code: true,
    };
    return this.promiseRequest(options, callback, payload);
  }

  /** Creates edX demo courses. Writes details to configuration file. */
  seedCourses = async () => {
    await this.setLoginCookie();
    const demoConfig = this.env.EDX_COURSES_CONFIG;
    const config = require(`../../${demoConfig}.template.json`);
    await this.createCourses(config);
    fs.writeFileSync(`${demoConfig}.json`, JSON.stringify(config, null, 4));
  };

  createCourses = async (courses) => {
    const options = { path: "/course/" };
    // eslint-disable-next-line no-restricted-syntax
    for (const course of Object.values(courses)) {
      // eslint-disable-next-line no-await-in-loop
      await this.promiseRequest(options, null, course.body);
      const { org, number, run } = course.body;
      course.locator = `block-v1:${org}+${number}+${run}+type@course+block@course`;
      course.courseId = `course-v1:${org}+${number}+${run}`;
      // eslint-disable-next-line no-await-in-loop
      await this.createXblocks(course.chapter, this.categories, course.locator);
      // eslint-disable-next-line no-await-in-loop
      await this.publishXBlock(course.locator);
      // eslint-disable-next-line no-await-in-loop
      await this.configureCourse(course);
    }
  };

  createXblocks = async (xBlocks, categories, parent_locator) => {
    const options = { path: "/xblock/" };
    const category = categories[0];
    // eslint-disable-next-line no-restricted-syntax
    for (const xBlock of Object.values(xBlocks)) {
      const callback = (data) => JSON.parse(data).locator;
      const payload = { parent_locator, category, ...xBlock.body };
      // eslint-disable-next-line no-await-in-loop
      xBlock.locator = await this.promiseRequest(options, callback, payload);
      // eslint-disable-next-line no-await-in-loop
      await this.configureXBlock(xBlock);
      if (categories.length > 1) {
        const child = xBlock[categories[1]];
        // eslint-disable-next-line no-await-in-loop
        await this.createXblocks(child, categories.slice(1), xBlock.locator);
      }
    }
  };

  configureXBlock = async (xBlock) => {
    if (!xBlock.details || Object.keys(xBlock.details).length === 0) {
      return;
    }
    const options = {
      path: `/xblock/${encodeURIComponent(xBlock.locator)}`,
      method: "GET",
    };
    const callback = (data) => JSON.parse(data);
    const details = await this.promiseRequest(options, callback);
    options.method = "POST";
    const payload = { ...details, ...xBlock.details };
    xBlock.details = await this.promiseRequest(options, callback, payload);
  };

  publishXBlock = async (locator) => {
    const options = { path: `/xblock/${locator}` };
    const payload = { publish: "make_public" };
    await this.promiseRequest(options, null, payload);
  };

  configureCourse = async (course) => {
    const options = { path: `/settings/details/${course.courseId}` };
    await this.promiseRequest(options, null, course.details);
  };
}

module.exports = EdxCms;
