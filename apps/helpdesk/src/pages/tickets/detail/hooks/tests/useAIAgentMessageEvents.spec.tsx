import React from 'react'

import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketStatus } from 'business/types/ticket'
import { MacroActionName } from 'models/macroAction/types'
import type { Action, TicketMessage } from 'models/ticket/types'
import { TicketEventEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import {
    findAndSplitMessageTags,
    useAIAgentMessageEvents,
} from '../useAIAgentMessageEvents'

const mockStore = configureMockStore([thunk])
const store = {
    tags: fromJS({
        items: [
            { name: 'tag1' },
            { name: 'tag2' },
            { name: 'tag3' },
            { name: 'tag4' },
        ],
    }),
}

describe('useAIAgentMessageEvents', () => {
    it('should return an empty state when no actions with AddTags name are present', () => {
        const message = {
            actions: [{ name: 'SomeAction', arguments: { tags: 'tag1' } }],
        } as unknown as TicketMessage

        const { result } = renderHook(
            () => useAIAgentMessageEvents([message]),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            },
        )

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
                {
                    name: MacroActionName.AddTags,
                    arguments: { tags: 'tag1,tag2' },
                },
            ],
        } as unknown as TicketMessage

        const { result } = renderHook(
            () => useAIAgentMessageEvents([message]),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            },
        )

        expect(result.current).toEqual([
            {
                tags: [{ name: 'tag1' }, { name: 'tag2' }],
                action: null,
            },
        ])
    })

    it('should return the close event', () => {
        const message = {
            actions: [
                {
                    name: MacroActionName.SetStatus,
                    arguments: { status: TicketStatus.Closed },
                },
            ],
        } as unknown as TicketMessage

        const { result } = renderHook(
            () => useAIAgentMessageEvents([message]),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            },
        )

        expect(result.current).toEqual([
            {
                tags: [],
                action: TicketEventEnum.CLOSE,
            },
        ])
    })

    it('should return the handover event', () => {
        const message = {
            actions: [
                {
                    name: MacroActionName.AddTags,
                    arguments: { tags: 'ai_handover' },
                },
            ],
        } as unknown as TicketMessage

        const { result } = renderHook(
            () => useAIAgentMessageEvents([message]),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            },
        )

        expect(result.current).toEqual([
            {
                tags: [],
                action: TicketEventEnum.HANDOVER,
            },
        ])
    })

    it('should return the snooze event', () => {
        const message = {
            actions: [{ name: MacroActionName.SnoozeTicket }],
        } as unknown as TicketMessage

        const { result } = renderHook(
            () => useAIAgentMessageEvents([message]),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(store)}>{children}</Provider>
                ),
            },
        )

        expect(result.current).toEqual([
            {
                tags: [],
                action: TicketEventEnum.SNOOZE,
            },
        ])
    })
})

describe('findAndSplitMessageTags', () => {
    it('should return an array of tags when the AddTags action is present with comma-separated tags', () => {
        const actions: Action[] = [
            { name: 'SomeOtherAction' },
            {
                name: MacroActionName.AddTags,
                arguments: { tags: 'tag1,tag2,tag3' },
            },
        ] as unknown as Action[]

        expect(findAndSplitMessageTags(actions)).toEqual([
            'tag1',
            'tag2',
            'tag3',
        ])
    })

    it('should return an empty array when the AddTags action is missing', () => {
        const actions: Action[] = [
            { name: 'SomeOtherAction' },
        ] as unknown as Action[]
        expect(findAndSplitMessageTags(actions)).toEqual([])
    })

    it('should return an empty array when the AddTags action is present but has no arguments', () => {
        const actions: Action[] = [
            { name: MacroActionName.AddTags },
        ] as unknown as Action[]
        expect(findAndSplitMessageTags(actions)).toEqual([])
    })

    it('should return an empty array when the AddTags action is present but tags argument is missing', () => {
        const actions: Action[] = [
            { name: MacroActionName.AddTags, arguments: {} },
        ] as unknown as Action[]
        expect(findAndSplitMessageTags(actions)).toEqual([])
    })

    it('should return an empty array when the AddTags action is present but tags argument is an empty string', () => {
        const actions: Action[] = [
            { name: MacroActionName.AddTags, arguments: { tags: '' } },
        ] as unknown as Action[]
        expect(findAndSplitMessageTags(actions)).toEqual([])
    })

    it('should return an array with a single tag when only one tag is present', () => {
        const actions: Action[] = [
            { name: MacroActionName.AddTags, arguments: { tags: 'singleTag' } },
        ] as unknown as Action[]
        expect(findAndSplitMessageTags(actions)).toEqual(['singleTag'])
    })

    it('should trim spaces around tags', () => {
        const actions: Action[] = [
            {
                name: MacroActionName.AddTags,
                arguments: { tags: ' tag1 , tag2 , tag3 ' },
            },
        ] as unknown as Action[]
        expect(findAndSplitMessageTags(actions)).toEqual([
            'tag1',
            'tag2',
            'tag3',
        ])
    })

    it('should handle cases where tags contain extra commas', () => {
        const actions: Action[] = [
            {
                name: MacroActionName.AddTags,
                arguments: { tags: ',tag1,,tag2,,' },
            },
        ] as unknown as Action[]
        expect(findAndSplitMessageTags(actions)).toEqual(['tag1', 'tag2'])
    })

    it('should handle cases where the tags are just commas', () => {
        const actions: Action[] = [
            { name: MacroActionName.AddTags, arguments: { tags: ',,,' } },
        ] as unknown as Action[]
        expect(findAndSplitMessageTags(actions)).toEqual([])
    })

    it('should handle cases where tags contain only spaces', () => {
        const actions: Action[] = [
            { name: MacroActionName.AddTags, arguments: { tags: '   ' } },
        ] as unknown as Action[]
        expect(findAndSplitMessageTags(actions)).toEqual([])
    })
})
