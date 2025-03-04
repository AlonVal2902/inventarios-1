import base from "./base.js";

const endpoint = "/inventario";

const findAll = async () => await base.get(endpoint);

const findOne = async (id) => await base.get(`${endpoint}/${id}`);

const update = async (id, payload) =>
  await base.put(`${endpoint}/${id}`, payload);
const create = async (payload) => await base.post(endpoint, payload);

const api = { findAll, findOne, update, create };

export default api;
