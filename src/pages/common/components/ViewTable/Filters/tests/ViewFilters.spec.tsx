import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {
    removeFieldFilter,
    updateFieldFilter,
    updateFieldFilterOperator,
} from 'state/views/actions'

import {view as viewFixture} from '../../../../../../fixtures/views'
import {CallExpression} from '../CallExpression'
import ViewFilters from '../ViewFilters'

jest.mock('state/views/actions')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    agents: fromJS([]),
    schemas: fromJS({
        definitions: {
            Ticket: {
                properties: {
                    status: {
                        type: 'string',
                        default: 'open',
                        description:
                            'Ticket status is used for managing the lifecycle of the ticket',
                        meta: {
                            enum: ['open', 'closed'],
                            rules: {
                                widget: 'select',
                            },
                            filters: {
                                widget: 'multi-select',
                            },
                            operators: {
                                eq: {
                                    label: 'is',
                                },
                            },
                        },
                    },
                },
            },
        },
    }),
    teams: fromJS([]),
    views: fromJS({
        active: viewFixture,
    }),
}

;(removeFieldFilter as jest.Mock).mockImplementation(() => () => ({}))
;(updateFieldFilter as jest.Mock).mockImplementation(() => () => ({}))
;(updateFieldFilterOperator as jest.Mock).mockImplementation(() => () => ({}))

jest.mock(
    '../CallExpression',
    () => (props: ComponentProps<typeof CallExpression>) => {
        const {removeCondition, updateOperator, updateFieldFilter} = props

        removeCondition(0)
        updateOperator(0, 'eq')
        updateFieldFilter(0, 'foo')

        return <div>CallExpression</div>
    }
)

describe('<ViewFilters />', () => {
    it('should return null if schemas are empty', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    schemas: fromJS({}),
                })}
            >
                <ViewFilters />
            </Provider>
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('should return no filters if none are selected', () => {
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    views: fromJS({
                        active: {...viewFixture, filters_ast: null},
                    }),
                })}
            >
                <ViewFilters />
            </Provider>
        )
        expect(getByText('No filters selected')).toBeInTheDocument()
    })

    it('should throw if expression node is not CallExpression or LogicalExpression', () => {
        expect(() =>
            render(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        views: fromJS({
                            active: {
                                ...viewFixture,
                                filters_ast: {
                                    body: [{expression: {type: 'Expression'}}],
                                },
                            },
                        }),
                    })}
                >
                    <ViewFilters />
                </Provider>
            )
        ).toThrow('Unknown type: Expression')
    })

    it('should render CallExpression', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <ViewFilters />
            </Provider>
        )
        expect(container).toHaveTextContent('CallExpression')
    })

    it('should walk through LogicalExpression', () => {
        const {getAllByText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    views: fromJS({
                        active: {
                            ...viewFixture,
                            filters_ast: {
                                body: [
                                    {
                                        expression: {
                                            type: 'LogicalExpression',
                                            left: {type: 'CallExpression'},
                                            right: {type: 'CallExpression'},
                                        },
                                    },
                                ],
                            },
                        },
                    }),
                })}
            >
                <ViewFilters />
            </Provider>
        )

        expect(getAllByText('CallExpression')).toHaveLength(2)
    })

    // this test is not ideal, as it just satisfies code coverage
    // in reality, the prop drilling should be refactored
    it('should pass dispatched actions to CallExpression', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <ViewFilters />
            </Provider>
        )

        expect(removeFieldFilter).toHaveBeenCalled()
        expect(updateFieldFilter).toHaveBeenCalled()
        expect(updateFieldFilterOperator).toHaveBeenCalled()
    })
})
