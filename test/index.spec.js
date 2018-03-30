'use strict'

const sinon = require('sinon')
const chai = require('chai')
const request = require('supertest')
const { validateRoute } = require('../index')

let expect = chai.expect

function getMockHttpRequest(query, body, params, headers) {
    return {
        query: query || { page: 1, per_page: 20 },
        body: body || { email: 'foo@bar.baz', password: 'secret' },
        params: params || { id: '12212' },
        headers: headers || { 'Content-Type': 'application/json' }
    }
}

function getMockHttpResponse() {
    return {
        send: (data) => { },
        statusCode: 200
    }
}

function getMockNextFunction() {
    return (data) => { }
}

describe('Testing the express-ajv middleware', () => {
    it('Should return a middleware function', () => {
        expect(typeof validateRoute({})).to.equals('function')
    })

    it('Should correctly continue the middleware chain', () => {
        let middleware = validateRoute({
            query: {
                type: 'object',
                properties: {
                    'page': { type: 'integer' }
                }
            }
        })
        let req = getMockHttpRequest()
        let res = getMockHttpResponse()
        let next = getMockNextFunction()

        let spy = sinon.spy()
        middleware(req, res, spy)
        expect(spy.called).to.equals(true)
    })

    it('Should correctly validate invalid body', (done) => {
        let middleware = validateRoute({
            body: {
                type: 'object',
                properties: {
                    'rofl': { type: 'integer' }
                },
                required: ['rofl']
            }
        })
        let req = getMockHttpRequest({ lmao: 1 }, {}, { lol: 1 })
        let res = getMockHttpResponse()

        middleware(req, res, (err) => {
            expect(typeof err).to.not.equals('undefined')
            done()
        })
    })

    it('Should correctly validate invalid query', (done) => {
        let middleware = validateRoute({
            query: {
                type: 'object',
                properties: {
                    'lmao': { type: 'integer' }
                },
                required: ['lmao']
            }
        })
        let req = getMockHttpRequest({}, {}, { lol: 1 })
        let res = getMockHttpResponse()

        middleware(req, res, (err) => {
            expect(typeof err).to.not.equals('undefined')
            done()
        })
    })

    it('Should correctly validate invalid params', (done) => {
        let middleware = validateRoute({
            params: {
                type: 'object',
                properties: {
                    'lmao': { type: 'integer' }
                },
                required: ['lmao']
            }
        })
        let req = getMockHttpRequest({ lmao: 1 }, { lmao: 1 }, {})
        let res = getMockHttpResponse()

        middleware(req, res, (err) => {
            expect(typeof err).to.not.equals('undefined')
            done()
        })
    })

    it('Should correctly validate valid requests', (done) => {
        let middleware = validateRoute({
            query: {
                type: 'object',
                properties: {
                    'lmao': { type: 'integer' }
                },
                required: ['lmao']
            },
            body: {
                type: 'object',
                properties: {
                    'rofl': { type: 'integer' }
                },
                required: ['rofl']
            },
            params: {
                type: 'object',
                properties: {
                    'lol': { type: 'integer' }
                },
                required: ['lol']
            }
        })
        let req = getMockHttpRequest({ lmao: 1 }, { rofl: 2 }, { lol: 1 })
        let res = getMockHttpResponse()

        middleware(req, res, (err) => {
            expect(typeof err).to.equals('undefined')
            done()
        })
    })
})
