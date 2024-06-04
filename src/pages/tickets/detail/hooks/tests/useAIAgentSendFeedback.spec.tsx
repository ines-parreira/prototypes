import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {QueryClientProvider} from '@tanstack/react-query'
import {fromJS} from 'immutable'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {TicketMessage} from 'models/ticket/types'
import {
    useSubmitAIAgentTicketMessagesFeedback,
    useDeleteAIAgentTicketMessagesFeedback,
} from 'models/aiAgentFeedback/queries'
import {assumeMock} from 'utils/testing'
import {SubmitMessageFeedback} from 'models/aiAgentFeedback/types'
import {useAIAgentSendFeedback} from '../useAIAgentSendFeedback'

const queryClient = mockQueryClient()

jest.mock('models/aiAgentFeedback/queries')

const mockStore = configureMockStore([thunk])
const store = {
    tags: fromJS({
        items: [{name: 'tag1'}, {name: 'tag2'}, {name: 'tag3'}, {name: 'tag4'}],
    }),
}

const mockedUseSubmitAIAgentTicketMessagesFeedback = assumeMock(
    useSubmitAIAgentTicketMessagesFeedback
)

const mockedUseDeleteAIAgentTicketMessagesFeedback = assumeMock(
    useDeleteAIAgentTicketMessagesFeedback
)

describe('useAIAgentSendFeedback', () => {
    beforeEach(() => {
        mockedUseSubmitAIAgentTicketMessagesFeedback.mockReturnValue({
            mutateAsync: jest.fn().mockReturnValue({data: {}}),
            isLoading: false,
        } as unknown as ReturnType<typeof useSubmitAIAgentTicketMessagesFeedback>)

        mockedUseDeleteAIAgentTicketMessagesFeedback.mockReturnValue({
            mutateAsync: jest.fn().mockReturnValue({data: {}}),
            isLoading: false,
        } as unknown as ReturnType<typeof useDeleteAIAgentTicketMessagesFeedback>)
    })

    it('should send feedback', async () => {
        const message = {
            ticket_id: '1',
            id: '2',
        } as unknown as TicketMessage
        const payload: SubmitMessageFeedback = {
            feedbackOnResource: [
                {
                    resourceType: 'action',
                    resourceId: 3,
                    type: 'binary',
                    feedback: 'thumbs_up',
                },
            ],
        }

        const {result} = renderHook(() => useAIAgentSendFeedback(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(store)}>{children}</Provider>
                </QueryClientProvider>
            ),
        })

        await result.current.aiAgentSendFeedback(message, payload)

        expect(mockedUseSubmitAIAgentTicketMessagesFeedback).toHaveBeenCalled()
    })
})
