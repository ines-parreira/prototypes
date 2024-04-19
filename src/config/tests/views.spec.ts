import {render, screen} from '@testing-library/react'
import {fromJS, Map, List} from 'immutable'
import _isObject from 'lodash/isObject'

import {ReactComponentElement} from 'react'
import {isImmutable} from 'common/utils'
import * as viewsConfig from 'config/views'

import * as ticketFixtures from 'fixtures/ticket'
import {customer} from 'fixtures/customer'
import {getAST} from 'utils'
import {
    ViewType,
    View,
    ViewField,
    ViewVisibility,
    EntityType,
} from 'models/view/types'

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

    describe('ViewField.DetailsWithHighlight cell', () => {
        it('should render the ticket details without highlights', () => {
            const subject = 'qwe'
            const excerpt = 'asd'
            const messages_count = 4
            const ticketWithHighlight = fromJS({
                ...ticketFixtures.ticket,
                messages_count,
                subject,
                excerpt,
                highlight: {},
            })
            const withHighlightView:
                | Record<'name' | 'cell', unknown>
                | undefined = (
                viewsConfig.views.toJS() as Record<'name' | 'cell', unknown>[]
            ).find((view) => view.name === EntityType.TicketWithHighlight)

            if (withHighlightView) {
                const cell = withHighlightView.cell as (
                    fieldName: ViewField,
                    item: Map<any, any>
                ) => ReactComponentElement<any>
                render(
                    cell(ViewField.DetailsWithHighlight, ticketWithHighlight)
                )
            }

            expect(
                screen.getByText(`(${messages_count}) ${subject}`)
            ).toBeInTheDocument()
            expect(screen.getByText(excerpt)).toBeInTheDocument()
        })

        it('should render the ticket details with highlights', () => {
            const subject = 'qwe'
            const excerpt = 'asd'
            const messages_count = 4
            const highlightedSubject = 'highlighted subject'
            const highlightedMessage = 'highlighted message'
            const ticketWithHighlight = fromJS({
                ...ticketFixtures.ticket,
                messages_count,
                subject,
                excerpt,
                highlights: fromJS({
                    'subject.highlight': [
                        `asd <em>${highlightedSubject}</em> tyu`,
                    ],
                    'messages.body.text': [
                        `asd <em>${highlightedMessage}</em> tyu`,
                    ],
                }),
            })
            const withHighlightView:
                | Record<'name' | 'cell', unknown>
                | undefined = (
                viewsConfig.views.toJS() as Record<'name' | 'cell', unknown>[]
            ).find((view) => view.name === EntityType.TicketWithHighlight)

            if (withHighlightView) {
                const cell = withHighlightView.cell as (
                    fieldName: ViewField,
                    item: Map<any, any>
                ) => ReactComponentElement<any>
                render(
                    cell(ViewField.DetailsWithHighlight, ticketWithHighlight)
                )
            }

            expect(screen.getByText(highlightedSubject)).toBeInTheDocument()
            expect(
                screen.getByText(highlightedSubject).tagName.toLocaleLowerCase()
            ).toBe('em')
            expect(screen.getByText(highlightedMessage)).toBeInTheDocument()
            expect(
                screen.getByText(highlightedMessage).tagName.toLocaleLowerCase()
            ).toBe('em')
        })
    })

    describe('baseView', () => {
        it('has minimum properties required', () => {
            const view = viewsConfig.baseView().toJS()
            expect(view).toHaveProperty('id', 0)
            expect(view).toHaveProperty('name')
            expect(view).toHaveProperty('slug')
            expect(view).toHaveProperty('order_by')
            expect(view).toHaveProperty('created_datetime')
            expect(view).toHaveProperty('order_dir')
            expect(view).toHaveProperty('filters')
            expect(view).toHaveProperty('filters_ast')
        })
        it('has filtered_as as immutable', () => {
            const baseView = viewsConfig.baseView()
            expect(isImmutable(baseView.getIn(['filters_ast']))).toEqual(true)
        })
    })

    describe('defaultMergeTicketsView', () => {
        it('has minimum properties required', () => {
            const view = viewsConfig.defaultMergeTicketsView(1).toJS()
            expect(view).toHaveProperty('id', 0)
            expect(view).toHaveProperty('search')
            expect(view).toHaveProperty('fields')
            expect(view).toHaveProperty('filters_ast')
            expect(view).toHaveProperty('order_by')
            expect(view).toHaveProperty('order_dir')
            expect(view).toHaveProperty('type')
            expect(view).toHaveProperty('slug')
        })
        it('has filtered_ast as immutable', () => {
            const baseView = viewsConfig.defaultMergeTicketsView(1)
            expect(isImmutable(baseView.getIn(['filters_ast']))).toEqual(true)
        })
    })

    describe.each(viewsConfig.views.toJS() as Record<string, unknown>[])(
        '$name view',
        (config) => {
            const viewConfig = fromJS(config) as Map<any, any>
            const defaultFilters = 'isEmpty(ticket.created_datetime)'
            const fixtures = {
                [EntityType.Ticket]: ticketFixtures.ticket,
                [EntityType.TicketWithHighlight]: {
                    ...ticketFixtures.ticket,
                    highlights: {},
                },
                [EntityType.Customer]: customer,
            }

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
                const viewConfigName: keyof typeof fixtures =
                    viewConfig.get('name')
                const fixture: Map<any, any> = fromJS(fixtures[viewConfigName])
                const nonStringTicketFields = {
                    id: 'number',
                    details: 'object',
                    tags: 'object',
                    customer: 'object', // customer (then passed to RenderLabel)
                    assignee: 'object', // user (then passed to RenderLabel)
                    assignee_team: 'object', // team (then passed to RenderLabel)
                }

                const fieldNameToType = {
                    [EntityType.Ticket]: nonStringTicketFields,
                    [EntityType.TicketWithHighlight]: nonStringTicketFields,
                    [EntityType.Customer]: {
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

            describe('newView()', () => {
                it('has all properties', () => {
                    const newView = (
                        viewConfig.get('newView') as () => Map<any, any>
                    )().toJS() as View

                    expect(newView).toHaveProperty('id', 0)
                    expect(newView).toHaveProperty('name')
                    expect(newView).toHaveProperty('slug')
                    expect(newView).toHaveProperty('order_by')
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

                it('has filtered_ast as immutable', () => {
                    const newView = (
                        viewConfig.get('newView') as () => Map<any, any>
                    )()
                    expect(isImmutable(newView.getIn(['filters_ast']))).toEqual(
                        true
                    )
                })

                it('should has filtered_ast as immutable when filters are passed as argument', () => {
                    const newView = (
                        viewConfig.get('newView') as (
                            visibility?: ViewVisibility,
                            viewName?: string,
                            filters?: string
                        ) => Map<any, any>
                    )(ViewVisibility.Private, 'Some view', defaultFilters)

                    expect(isImmutable(newView.getIn(['filters_ast']))).toBe(
                        true
                    )
                })
            })

            describe('searchView()', () => {
                it('it has all properties', () => {
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
                it('has filtered_ast as immutable', () => {
                    const searchView = (
                        viewConfig.get('searchView') as () => Map<any, any>
                    )()
                    expect(
                        isImmutable(searchView.getIn(['filters_ast']))
                    ).toEqual(true)
                })

                it('should has filtered_ast as immutable when filters are passed as argument', () => {
                    const searchView = (
                        viewConfig.get('searchView') as (
                            query?: string,
                            filters?: string
                        ) => Map<any, any>
                    )('some query', defaultFilters)

                    expect(isImmutable(searchView.getIn(['filters_ast']))).toBe(
                        true
                    )
                })
            })
        }
    )

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
            expect(viewsConfig.getTicketViewField(ViewField.Assignee)).toEqual(
                fromJS({
                    name: ViewField.Assignee,
                    title: 'Assignee user',
                    path: 'assignee_user.id',
                    filter: {
                        type: 'agent',
                    },
                })
            )
        })
    })

    describe('getTicketViewFieldPath', () => {
        it('should return the path corresponding to the passed field', () => {
            expect(
                viewsConfig.getTicketViewFieldPath(
                    viewsConfig.getTicketViewField(ViewField.Channel)
                )
            ).toEqual('ticket.channel')
        })
    })
})
