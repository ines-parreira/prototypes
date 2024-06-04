import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {TicketEventEnum} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import {TicketStatus} from 'business/types/ticket'
import {TicketMessage} from 'models/ticket/types'
import {MacroActionName} from 'models/macroAction/types'
import {useAIAgentMessageEvents} from '../useAIAgentMessageEvents'

const mockStore = configureMockStore([thunk])
const store = {
    tags: fromJS({
        items: [{name: 'tag1'}, {name: 'tag2'}, {name: 'tag3'}, {name: 'tag4'}],
    }),
}

describe('useAIAgentMessageEvents', () => {
    it('should return an empty state when no actions with AddTags name are present', () => {
        const message = {
            actions: [{name: 'SomeAction', arguments: {tags: 'tag1'}}],
        } as unknown as TicketMessage

        const {result} = renderHook(() => useAIAgentMessageEvents([message]), {
            wrapper: ({children}) => (
                <Provider store={mockStore(store)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual([
            {
                tags: [],
                action: null,
            },
        ])
    })

    it('should return an array of tag names when actions with AddTags name are present', () => {
        const message = {
            actions: [
                {name: MacroActionName.AddTags, arguments: {tags: 'tag1'}},
                {name: MacroActionName.AddTags, arguments: {tags: 'tag2'}},
            ],
        } as unknown as TicketMessage

        const {result} = renderHook(() => useAIAgentMessageEvents([message]), {
            wrapper: ({children}) => (
                <Provider store={mockStore(store)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual([
            {
                tags: [{name: 'tag1'}, {name: 'tag2'}],
                action: null,
            },
        ])
    })

    it('should return the close event', () => {
        const message = {
            actions: [
                {
                    name: MacroActionName.SetStatus,
                    arguments: {status: TicketStatus.Closed},
                },
            ],
        } as unknown as TicketMessage

        const {result} = renderHook(() => useAIAgentMessageEvents([message]), {
            wrapper: ({children}) => (
                <Provider store={mockStore(store)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual([
            {
                tags: [],
                action: TicketEventEnum.CLOSE,
            },
        ])
    })

    it('should return the handover event', () => {
        const message = {
            actions: [{name: MacroActionName.SetAssignee}],
        } as unknown as TicketMessage

        const {result} = renderHook(() => useAIAgentMessageEvents([message]), {
            wrapper: ({children}) => (
                <Provider store={mockStore(store)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual([
            {
                tags: [],
                action: TicketEventEnum.ASSIGN_TICKET,
            },
        ])
    })

    it('should return the snooze event', () => {
        const message = {
            actions: [{name: MacroActionName.SnoozeTicket}],
        } as unknown as TicketMessage

        const {result} = renderHook(() => useAIAgentMessageEvents([message]), {
            wrapper: ({children}) => (
                <Provider store={mockStore(store)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual([
            {
                tags: [],
                action: TicketEventEnum.SNOOZE,
            },
        ])
    })
})
