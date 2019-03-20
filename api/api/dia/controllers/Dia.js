'use strict';

/**
 * Dia.js controller
 *
 * @description: A set of functions called "actions" for managing `Dia`.
 */

module.exports = {

  /**
   * Retrieve dia records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.dia.search(ctx.query);
    } else {
      return strapi.services.dia.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a dia record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.dia.fetch(ctx.params);
  },

  /**
   * Count dia records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.dia.count(ctx.query);
  },

  /**
   * Create a/an dia record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.dia.add(ctx.request.body);
  },

  /**
   * Update a/an dia record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.dia.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an dia record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.dia.remove(ctx.params);
  }
};
