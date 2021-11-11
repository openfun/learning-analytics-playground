const { HttpWrapper } = require("./utils");

class EdxCms extends HttpWrapper {
  constructor(env) {
    super();
    this.env = env;
    this.commonOptions = {
      hostname: env.EDX_CMS_HOST,
      port: env.EDX_CMS_PORT,
    };
    this.csrftoken = null;
  }

  getCsrftoken = () => {
    const options = { path: "/signin", method: "GET" };
    return this.promiseRequest(options, (_, response) => {
      return response.headers["set-cookie"][0].substring(10, 42);
    });
  };

  getLoginCookie = (csrfmiddlewaretoken) => {
    const options = {
      path: "/login_post",
      method: "POST",
      headers: {
        "X-CSRFToken": csrfmiddlewaretoken,
        Cookie: `csrftoken=${csrfmiddlewaretoken}`,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    };
    const payload = {
      csrfmiddlewaretoken,
      email: this.env.EDX_ADMIN_EMAIL,
      password: this.env.EDX_ADMIN_PASSWORD,
      honor_code: true,
    };
    return this.promiseRequest(
      options,
      (_, response) => {
        return response.headers["set-cookie"].join(";");
      },
      payload
    );
  };

  addStaffMember = (email, cookie) => {
    const options = {
      path: `/course_team/course-v1:organisation+numero_du_cours+course/${email}`,
      method: "POST",
      headers: {
        "X-CSRFToken": cookie.substring(10, 42),
        Cookie: cookie,
        "Content-Type": "application/json",
      },
    };
    const payload = { role: "staff" };
    return this.promiseRequest(
      options,
      (_, response) => response.statusCode === 204,
      payload
    );
  };
}

module.exports = EdxCms;
