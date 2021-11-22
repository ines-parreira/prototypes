import React from 'react'
import {fromJS} from 'immutable'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    removeFieldFilter,
    updateFieldFilter,
    updateFieldFilterOperator,
} from '../../../../../../state/views/actions'
import {view as viewFixture} from '../../../../../../fixtures/views'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import ViewFilters from '../ViewFilters'

jest.mock('../../../../../../state/views/actions')

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

;(
    removeFieldFilter as jest.MockedFunction<
        typeof removeFieldFilter
    > as jest.SpyInstance
).mockImplementation(() => () => ({}))
;(
    updateFieldFilter as jest.MockedFunction<
        typeof updateFieldFilter
    > as jest.SpyInstance
).mockImplementation(() => () => ({}))
;(
    updateFieldFilterOperator as jest.MockedFunction<
        typeof updateFieldFilterOperator
    > as jest.SpyInstance
).mockImplementation(() => () => ({}))

describe('<ViewFilters />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should update active view on remove field', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <ViewFilters />
            </Provider>
        )
        fireEvent.click(getByText('clear'))
        expect(removeFieldFilter).toHaveBeenLastCalledWith(0)
    })

    it('should update active view on update field', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <ViewFilters />
            </Provider>
        )
        fireEvent.click(getByText('closed'))
        fireEvent.click(getByText('open'))
        expect(updateFieldFilter).toHaveBeenLastCalledWith(0, 'open')
    })

    it('should update active view on update field operator', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <ViewFilters />
            </Provider>
        )
        fireEvent.change(container.querySelector('select')!, {
            target: {value: 'neq'},
        })

        expect(updateFieldFilterOperator).toHaveBeenLastCalledWith(0, 'neq')
    })
})
