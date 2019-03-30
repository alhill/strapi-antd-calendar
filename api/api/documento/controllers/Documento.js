'use strict';

/**
 * Documento.js controller
 *
 * @description: A set of functions called "actions" for managing `Documento`.
 */

module.exports = {

  /**
   * Retrieve documento records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.documento.search(ctx.query);
    } else {
      return strapi.services.documento.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a documento record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.documento.fetch(ctx.params);
  },

  /**
   * Count documento records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.documento.count(ctx.query);
  },

  /**
   * Create a/an documento record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.documento.add(ctx.request.body);
  },

  /**
   * Update a/an documento record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.documento.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an documento record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.documento.remove(ctx.params);
  }
};
