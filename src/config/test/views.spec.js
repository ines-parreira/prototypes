import {fromJS} from 'immutable'
import _isObject from 'lodash/isObject'

import * as viewsConfig from '../views'

import * as ticketFixtures from '../../fixtures/ticket'
import {customer} from '../../fixtures/customer'

global.console.error = jest.fn()

describe('Config: views', () => {
    describe('defaultCell', () => {
        const ticket = fromJS({
            status: 'open',
        })

        it('returns correct value', () => {
            expect(viewsConfig.defaultCell('status', ticket)).toBe('open')
        })

        it('returns empty string if wrong value and call console.error', () => {
            expect(viewsConfig.defaultCell('unknown', ticket)).toBe('')
            expect(console.error).toBeCalled()
            expect(viewsConfig.defaultCell('status', fromJS({}))).toBe('')
        })
    })

    describe('baseView', () => {
        it('has minimum properties required', () => {
            const view = viewsConfig.baseView().toJS()

            expect(view).toHaveProperty('id', 0)
            expect(view).toHaveProperty('name')
            expect(view).toHaveProperty('slug')
            expect(view).toHaveProperty('order_by')
            expect(view).toHaveProperty('display_order')
            expect(view).toHaveProperty('created_datetime')
            expect(view).toHaveProperty('order_dir')
            expect(view).toHaveProperty('filters')
            expect(view).toHaveProperty('filters_ast')
        })
    })

    describe('views', () => {
        const {views} = viewsConfig

        const fixtures = {
            ticket: ticketFixtures.ticket,
            customer
        }

        views.forEach((viewConfig) => {
            it('view structure', () => {
                const view = viewConfig.toJS()

                expect(_isObject(view)).toBe(true)
                expect(view).toHaveProperty('name')
                expect(view).toHaveProperty('type')
                expect(view).toHaveProperty('routeItem')
                expect(view).toHaveProperty('routeList')
                expect(view).toHaveProperty('api')
                expect(view).toHaveProperty('singular')
                expect(view).toHaveProperty('plural')
                expect(view).toHaveProperty('mainField')
                expect(view).toHaveProperty('fields')
                expect(view).toHaveProperty('cell')
                expect(view).toHaveProperty('newView')
                expect(view).toHaveProperty('searchView')
            })

            it('view fields structure', () => {
                const fields = viewConfig.get('fields').toJS()

                fields.forEach((field) => {
                    expect(_isObject(field)).toBe(true)
                    expect(field).toHaveProperty('name')
                    expect(field).toHaveProperty('title')
                })
            })

            it('cell function result', () => {
                const viewConfigName = viewConfig.get('name')
                const fixture = fromJS(fixtures[viewConfigName])

                // list of properties that return something else than a string
                const fieldNameToType = {
                    ticket: {
                        details: 'object',
                        tags: 'object',
                        language: 'object',
                        customer: 'object', // customer (then passed to RenderLabel)
                        assignee: 'object', // user (then passed to RenderLabel)
                    },
                    customer: {
                        name: 'string',
                    }
                }

                const fieldNames = viewConfig.get('fields').map((field) => field.get('name'))
                const cellFunction = viewConfig.get('cell')

                // check that each field renders the correct type once passed through the cell() function
                fieldNames.forEach((fieldName) => {
                    expect(typeof fieldName).toBe('string')
                    const cellResult = cellFunction(fieldName, fixture)
                    const expectedType = fieldNameToType[viewConfigName][fieldName] || 'string'
                    expect(typeof cellResult).toBe(expectedType)
                })
            })

            it('newView', () => {
                const newView = viewConfig.get('newView')().toJS()

                expect(newView).toHaveProperty('id', 0)
                expect(newView).toHaveProperty('name')
                expect(newView).toHaveProperty('slug')
                expect(newView).toHaveProperty('order_by')
                expect(newView).toHaveProperty('display_order')
                expect(newView).toHaveProperty('created_datetime')
                expect(newView).toHaveProperty('order_dir')
                expect(newView).toHaveProperty('filters')
                expect(newView).toHaveProperty('filters_ast')
                expect(newView).toHaveProperty('fields')
                expect(newView).toHaveProperty('type')
            })

            it('searchView', () => {
                const term = 'term'
                const searchView = viewConfig.get('searchView')(term).toJS()

                expect(searchView).toHaveProperty('id', 0)
                expect(searchView).toHaveProperty('name')
                expect(searchView).toHaveProperty('slug')
                expect(searchView).toHaveProperty('order_by')
                expect(searchView).toHaveProperty('display_order')
                expect(searchView).toHaveProperty('created_datetime')
                expect(searchView).toHaveProperty('order_dir')
                expect(searchView).toHaveProperty('filters')
                expect(searchView).toHaveProperty('filters_ast')
                expect(searchView).toHaveProperty('fields')
                expect(searchView).toHaveProperty('type')
                expect(searchView).toHaveProperty('search', term)
            })
        })
    })

    describe('getConfigByName', () => {
        it('returns correct config', () => {
            const viewConfig = viewsConfig.views.last()
            const name = viewConfig.get('name')

            expect(viewsConfig.getConfigByName(name)).toEqual(viewConfig)
        })
    })

    describe('getConfigByType', () => {
        it('returns correct config', () => {
            const viewConfig = viewsConfig.views.last()
            const type = viewConfig.get('type')

            expect(viewsConfig.getConfigByType(type)).toEqual(viewConfig)
        })
    })
})
