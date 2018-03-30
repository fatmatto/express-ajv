'use strict'

const Ajv = require('ajv')

/**
 * Returns a middleware with compiled ajv validators
 * @param  {Object} routeSchema An object with ajv schemas {body: Schema1, query: Schema2, prams: Schema3}
 */
let validateRoute = (routeSchema) => {
  let ajv = null

  let validators = {}

  // Compiling query schema beforehand
  if (routeSchema.hasOwnProperty('query')) {
    ajv = new Ajv()
    validators.query = ajv.compile(routeSchema.query)
  }

  // Compiling params schema beforehand
  if (routeSchema.hasOwnProperty('params')) {
    // We coerce types on params because they cann only be strings
    // since they are part of an url
    ajv = new Ajv({coerceTypes: true})
    validators.params = ajv.compile(routeSchema.params)
  }

  // Compiling body schema beforehand
  if (routeSchema.hasOwnProperty('body')) {
    ajv = new Ajv()
    validators.body = ajv.compile(routeSchema.body)
  }

  // The actual middleware that gets loaded by express
  // has already-compiled validators
  return (req, res, next) => {
    let validation = null

    if (validators.hasOwnProperty('params')) {
      validation = validators.params(req.params)
      if (!validation) {
        return next(validators.params.errors)
      }
    }

    if (validators.hasOwnProperty('query')) {
      validation = validators.query(req.query)
      if (!validation) {
        return next(validators.query.errors)
      }
    }

    if (validators.hasOwnProperty('body')) {
      validation = validators.body(req.body)
      if (!validation) {
        return next(validators.body.errors)
      }
    }

    return next()
  }
}

module.exports = {
  validateRoute: validateRoute
}
