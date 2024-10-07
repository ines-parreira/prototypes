import MockAdapter from 'axios-mock-adapter'
import {Map} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'

import {appQueryClient} from 'api/queryClient'
import {
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import client from 'models/api/resources'
import {customFieldDefinitionKeys} from 'custom-fields/hooks/queries/queries'
import {getCustomFields} from 'custom-fields/resources'
import {initialState as newMessageState} from 'state/newMessage/reducers'
import {initialState as ticketState} from 'state/ticket/reducers'
import {StoreDispatch} from 'state/types'

import triggerTicketFieldsRefreshAndInvalidation from '../triggerTicketFieldsRefreshAndInvalidation'

type MockedRootState = {
    ticket: Map<any, any>
    newMessage?: Map<any, any>
    currentUser?: Map<any, any>
    views?: Map<any, any>
}

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)

describe('triggerTicketFieldsRefreshAndInvalidation()', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({
            ticket: ticketState,
            newMessage: newMessageState,
        })
        mockServer = new MockAdapter(client)
    })

    it('should dispatch SET_INVALID_CUSTOM_FIELDS_TO_ERRORED with correct errored fields', async () => {
        mockServer.onGet('/api/custom-fields/').reply(200, {
            data: [
                ticketDropdownFieldDefinition,
                {...ticketInputFieldDefinition, required: true},
            ],
        })

        const params = {
            archived: false,
            object_type: 'Ticket',
        } as const

        await appQueryClient.prefetchQuery({
            queryKey: customFieldDefinitionKeys.list(params),
            queryFn: () => getCustomFields(params),
        })

        await store.dispatch(triggerTicketFieldsRefreshAndInvalidation())
        expect(store.getActions()).toMatchSnapshot()
    })
})
