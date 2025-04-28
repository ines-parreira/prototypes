import React, { ReactNode } from 'react'

import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { User, UserRole } from 'config/types/user'
import { agents } from 'fixtures/agents'
import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'
import { RootState, StoreDispatch } from 'state/types'
import { renderHook } from 'utils/testing/renderHook'

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

        expect(result.current).toEqual(String(aiAgent.id))
    })
})
