'use strict';

/**
 * Registro.js controller
 *
 * @description: A set of functions called "actions" for managing `Registro`.
 */

module.exports = {

  /**
   * Retrieve registro records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.registro.search(ctx.query);
    } else {
      return strapi.services.registro.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a registro record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.registro.fetch(ctx.params);
  },

  /**
   * Count registro records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.registro.count(ctx.query);
  },

  /**
   * Create a/an registro record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.registro.add(ctx.request.body);
  },

  /**
   * Update a/an registro record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.registro.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an registro record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.registro.remove(ctx.params);
  }
};
