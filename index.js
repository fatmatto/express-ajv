'use strict'

const Ajv = require('ajv')
const Errors = require('throwable-http-errors')
/**
 * Returns a middleware with compiled ajv validators
 * @param  {Object} routeSchema An object with ajv schemas {body: Schema1, query: Schema2, prams: Schema3}
 */
const validateRoute = routeSchema => {
  let ajv = null

  const validators = {}

  // Compiling query schema beforehand
  if (Object.prototype.hasOwnProperty.call(routeSchema, 'query')) {
    ajv = new Ajv()
    validators.query = ajv.compile(routeSchema.query)
  }

  // Compiling params schema beforehand
  if (Object.prototype.hasOwnProperty.call(routeSchema, 'params')) {
    // We coerce types on params because they cann only be strings
    // since they are part of an url
    ajv = new Ajv({ coerceTypes: true })
    validators.params = ajv.compile(routeSchema.params)
  }

  // Compiling body schema beforehand
  if (Object.prototype.hasOwnProperty.call(routeSchema, 'body')) {
    ajv = new Ajv()
    validators.body = ajv.compile(routeSchema.body)
  }

  // The actual middleware that gets loaded by express
  // has already-compiled validators
  return (req, res, next) => {
    let validation = null

    if (Object.prototype.hasOwnProperty.call(validators, 'params')) {
      validation = ajv.validate(routeSchema.params, req.params)
      if (!validation) {
        return next(new Errors.BadRequest(`Request url parameters validation failed: ${ajv.errorsText()}`))
      }
    }

    if (Object.prototype.hasOwnProperty.call(validators, 'query')) {
      validation = ajv.validate(routeSchema.query, req.query)
      if (!validation) {
        return next(new Errors.BadRequest(`Request query validation failed: ${ajv.errorsText()}`))
      }
    }

    if (Object.prototype.hasOwnProperty.call(validators, 'body')) {
      validation = ajv.validate(routeSchema.body, req.body)
      if (!validation) {
        return next(new Errors.BadRequest(`Request body validation failed: ${ajv.errorsText()}`))
      }
    }

    return next()
  }
}

module.exports = {
  validateRoute: validateRoute
}
