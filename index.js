const axios = require("axios");

class wordpressGravityFormsAuthentication {
  constructor(api, options) {
    this.options = options;

    if (!options.base64Token && !options.baseUrl) {
      throw new Error(`Missing base64Token option.`);
    }

    if (!options.baseUrl) {
      throw new Error(`Missing baseUrl option.`);
    }

    const baseUrl = options.baseUrl

    axios.defaults.headers.common["Content-Type"] = "application/json";
    axios.defaults.headers.common["Authorization"] = options.base64Token;
    this.client = axios;

    api.loadSource(async actions => {
      const forms = await this.getGravityForms(actions, baseUrl);
      await this.getSpecificGravityForm(actions, baseUrl, forms);
    });
  }

  async getSpecificGravityForm(actions, baseUrl, forms) {
    const formData = [];
    for (const form of forms) {
      console.log(
        `Loading data from ${baseUrl}/wp-json/gf/v2/forms/${form.id}`
      );
      let {data} = await this.client.get(`${baseUrl}/wp-json/gf/v2/forms/${form.id}`);
      const typeCastedData = this.typeCastMaxLength(data)
      formData.push(
        typeCastedData
      );
    }
    const collection = actions.addCollection({
      typeName: "GravityForms"
    });
    for (const form of formData) {
      collection.addNode({
        form
      });
    }
  }

  async getGravityForms(actions, baseUrl) {
    console.log(`Loading data from ${baseUrl}/wp-json/gf/v2/forms`);
    const { data } = await this.client.get(`${baseUrl}/wp-json/gf/v2/forms`);
    const collection = actions.addCollection({
      typeName: "GravityFormsIndex"
    });
    const keys = [];
    for (const item of Object.keys(data)) {
      collection.addNode({
        id: data[item].id,
        title: data[item].title,
        entries: data[item].entries
      });
      keys.push(data[item]);
    }
    return keys;
  }

  typeCastMaxLength(data){
    data.fields[0].maxLength = String(data.fields[0].maxLength);
    return data;
  }
}

module.exports = wordpressGravityFormsAuthentication;
