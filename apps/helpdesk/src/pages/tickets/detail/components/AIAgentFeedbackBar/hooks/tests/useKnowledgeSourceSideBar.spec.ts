import React from 'react'

import { renderHook } from '@repo/testing'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import type { RootState, StoreDispatch } from 'state/types'

import { KnowledgeSourceSideBarProvider } from '../../KnowledgeSourceSideBarProvider'
import { useKnowledgeSourceSideBar } from '../useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'

jest.mock('common/navigation/hooks/useNavBar/useNavBar', () => ({
    useNavBar: () => ({
        navBarDisplay: 'default',
        setNavBarDisplay: jest.fn(),
    }),
}))

jest.mock('split-ticket-view-toggle', () => ({
    useSplitTicketView: () => ({
        isEnabled: true,
        setIsEnabled: jest.fn(),
    }),
}))

jest.mock('@repo/ai-agent', () => ({
    useFeedbackTracking: jest.fn(() => ({
        onKnowledgeResourceClick: jest.fn(),
    })),
}))
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

describe('useKnowledgeSourceSideBar', () => {
    const store = mockStore({
        ticket: Map({ id: 123 }),
        currentAccount: fromJS(account),
        currentUser: fromJS(user),
    } as any)

    it('throws an error if used outside the provider', () => {
        expect(() => renderHook(useKnowledgeSourceSideBar)).toThrow(
            new Error(
                'useKnowledgeSourceSideBar must be used within a KnowledgeSourceSideBarProvider',
            ),
        )
    })

    it('returns context value when used within the provider', () => {
        const { result } = renderHook(() => useKnowledgeSourceSideBar(), {
            wrapper: ({ children }) =>
                React.createElement(
                    Provider,
                    { store },
                    React.createElement(
                        KnowledgeSourceSideBarProvider,
                        null,
                        children,
                    ),
                ),
        })

        expect(result.current).toMatchObject({
            mode: null,
            selectedResource: null,
            openPreview: expect.any(Function),
            openEdit: expect.any(Function),
            openCreate: expect.any(Function),
            closeModal: expect.any(Function),
        })
    })
})
