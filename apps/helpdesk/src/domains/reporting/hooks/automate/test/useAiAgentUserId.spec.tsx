import type { ReactNode } from 'react'
import React from 'react'

import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { User } from 'config/types/user'
import { UserRole } from 'config/types/user'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { agents } from 'fixtures/agents'
import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'
import type { RootState, StoreDispatch } from 'state/types'

const mockStore = configureMockStore<RootState, StoreDispatch>()

describe('useAiAgentUserId', () => {
    const aiAgent: User = {
        ...agents[0],
        role: {
            name: UserRole.Bot,
        },
        email: AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS[0],
    }
    const state = {
        agents: fromJS({
            all: [aiAgent],
        }),
    } as RootState

    it('should return AiAgents Id', () => {
        const { result } = renderHook(() => useAIAgentUserId(), {
            wrapper: ({ children }: { children?: ReactNode }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual(aiAgent.id)
    })
})
