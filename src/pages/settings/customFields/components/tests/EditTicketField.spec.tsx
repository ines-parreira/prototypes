import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import {useParams} from 'react-router-dom'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {QueryClientProvider} from '@tanstack/react-query'
import {
    ticketInputFieldDefinition,
    managedTicketInputFieldDefinition,
} from 'fixtures/customField'
import {useCustomFieldDefinition} from 'custom-fields/hooks/queries/useCustomFieldDefinition'
import {OBJECT_TYPES} from 'custom-fields/constants'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import EditTicketField from '../../EditCustomField'

jest.mock('react-router')
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinition')

const mockedStore = configureMockStore([thunk])
const useParamsMock = useParams as jest.Mock
const useCustomFieldDefinitionMock = useCustomFieldDefinition as jest.Mock
const queryClient = mockQueryClient()

describe('<EditTicketField/>', () => {
    it('should render a loader', () => {
        useParamsMock.mockReturnValueOnce({id: 1})
        useCustomFieldDefinitionMock.mockReturnValueOnce({
            data: null,
            isLoading: true,
        })

        const {container} = render(
            <EditTicketField objectType={OBJECT_TYPES.TICKET} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render no info alert and the edit form because it is not a managed ticket field', () => {
        useParamsMock.mockReturnValueOnce({id: ticketInputFieldDefinition.id})
        useCustomFieldDefinitionMock.mockReturnValueOnce({
            data: ticketInputFieldDefinition,
            isLoading: false,
        })

        const {container} = render(
            <Provider store={mockedStore({})}>
                <QueryClientProvider client={queryClient}>
                    <EditTicketField objectType={OBJECT_TYPES.TICKET} />
                </QueryClientProvider>
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render an info alert and the edit form because it is a "Contact reason" managed ticket field', () => {
        useParamsMock.mockReturnValueOnce({
            id: managedTicketInputFieldDefinition.id,
        })
        useCustomFieldDefinitionMock.mockReturnValueOnce({
            data: managedTicketInputFieldDefinition,
            isLoading: false,
        })

        const {container} = render(
            <Provider store={mockedStore({})}>
                <QueryClientProvider client={queryClient}>
                    <EditTicketField objectType={OBJECT_TYPES.TICKET} />
                </QueryClientProvider>
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
