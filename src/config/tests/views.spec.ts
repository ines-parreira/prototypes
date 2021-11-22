import {fromJS, Map, List} from 'immutable'
import _isObject from 'lodash/isObject'

import * as viewsConfig from '../views'

import * as ticketFixtures from '../../fixtures/ticket'
import {customer} from '../../fixtures/customer'
import {getAST} from '../../utils'
import {ViewType, View, ViewField} from '../../models/view/types'

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
            customer,
        }

        views.forEach((viewConfig: Map<any, any>) => {
            it('view structure', () => {
                const view = viewConfig.toJS() as Record<string, unknown>

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
                const fields = (
                    viewConfig.get('fields') as List<any>
                ).toJS() as Record<string, unknown>[]

                fields.forEach((field) => {
                    expect(_isObject(field)).toBe(true)
                    expect(field).toHaveProperty('name')
                    expect(field).toHaveProperty('title')
                })
            })

            it('cell function result', () => {
                const viewConfigName = viewConfig.get(
                    'name'
                ) as keyof typeof fixtures
                const fixture = fromJS(fixtures[viewConfigName]) as Map<
                    any,
                    any
                >

                // list of properties that return something else than a string
                const fieldNameToType = {
                    ticket: {
                        details: 'object',
                        tags: 'object',
                        language: 'object',
                        customer: 'object', // customer (then passed to RenderLabel)
                        assignee: 'object', // user (then passed to RenderLabel)
                        assignee_team: 'object', // team (then passed to RenderLabel)
                    },
                    customer: {
                        name: 'string',
                    },
                }

                const fieldNames = (viewConfig.get('fields') as List<any>).map(
                    (field: Map<any, any>) => field.get('name') as string
                )
                const cellFunction = viewConfig.get('cell') as (
                    fieldName: any,
                    fixture: any
                ) => any

                // check that each field renders the correct type once passed through the cell() function
                fieldNames.forEach((fieldName) => {
                    expect(typeof fieldName).toBe('string')
                    const cellResult = cellFunction(fieldName, fixture)
                    const expectedType =
                        //@ts-ignore fieldName is never undefined
                        fieldNameToType[viewConfigName][fieldName] || 'string'
                    expect(typeof cellResult).toBe(expectedType)
                })
            })

            it('newView', () => {
                const newView = (
                    viewConfig.get('newView') as () => Map<any, any>
                )().toJS() as View

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
                if (newView.type === ViewType.TicketList) {
                    expect(newView).toHaveProperty('visibility')
                }
            })

            it('searchView', () => {
                const term = 'term'
                const filters = 'eq("ticket.channel", "chat")'
                const searchView = (
                    viewConfig.get('searchView') as (
                        term: string,
                        filters?: string
                    ) => Map<any, any>
                )(term, filters).toJS()

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
                expect(searchView).toHaveProperty('filters', filters)
                expect(searchView).toHaveProperty(
                    'filters_ast',
                    getAST(filters)
                )
            })
        })
    })

    describe('getConfigByName', () => {
        it('returns correct config', () => {
            const viewConfig = viewsConfig.views.last() as Map<any, any>
            const name = viewConfig.get('name')

            expect(viewsConfig.getConfigByName(name)).toEqual(viewConfig)
        })
    })

    describe('getConfigByType', () => {
        it('returns correct config', () => {
            const viewConfig = viewsConfig.views.last() as Map<any, any>
            const type = viewConfig.get('type')

            expect(viewsConfig.getConfigByType(type)).toEqual(viewConfig)
        })
    })

    describe('getExpirationTimeForCount()', () => {
        it.each([
            [50, 30],
            [99, 30],
            [100, 60],
            [201, 121],
        ])(
            'should return the expiration time for each view count',
            (count, expectedTime) => {
                expect(viewsConfig.getExpirationTimeForCount(count)).toEqual(
                    expectedTime
                )
            }
        )
    })

    describe('getTicketViewField', () => {
        it('should return the field corresponding to the passed field name', () => {
            expect(
                viewsConfig.getTicketViewField(ViewField.Assignee)
            ).toMatchSnapshot()
        })
    })

    describe('getTicketViewFieldPath', () => {
        it('should return the path corresponding to the passed field', () => {
            expect(
                viewsConfig.getTicketViewFieldPath(
                    viewsConfig.getTicketViewField(ViewField.Channel)
                )
            ).toMatchSnapshot()
        })
    })
})
