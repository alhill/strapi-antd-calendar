'use strict';

/**
 * Equipo.js controller
 *
 * @description: A set of functions called "actions" for managing `Equipo`.
 */

module.exports = {

  /**
   * Retrieve equipo records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.equipo.search(ctx.query);
    } else {
      return strapi.services.equipo.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a equipo record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.equipo.fetch(ctx.params);
  },

  /**
   * Count equipo records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.equipo.count(ctx.query);
  },

  /**
   * Create a/an equipo record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.equipo.add(ctx.request.body);
  },

  /**
   * Update a/an equipo record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.equipo.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an equipo record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.equipo.remove(ctx.params);
  }
};
