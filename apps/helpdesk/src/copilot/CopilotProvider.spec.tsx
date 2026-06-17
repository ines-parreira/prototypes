import { isValidElement } from 'react'
import type { ReactElement } from 'react'
import { act, screen } from '@testing-library/react'

import { history } from '@repo/routing'
import { assumeMock, render } from '@repo/testing'

import {
    CopilotProvider as BaseCopilotProvider,
    useRunLifecycle,
    useThreadLifecycle,
} from '@gorgias/copilot'
import type {
    RunLifecycleCallbacks,
    ThreadLifecycleCallbacks,
} from '@gorgias/copilot'

import { createCopilotAgent, fetchCopilotShops } from 'utils/sdk'

import { GuidanceConfirmationPreview } from './confirmation/GuidanceConfirmationPreview'
import { SkillConfirmationPreview } from './confirmation/SkillConfirmationPreview'
import {
    CopilotProvider,
    GAIA_CONVERSATION_ID_QUERY_PARAM,
} from './CopilotProvider'

jest.mock('utils/sdk', () => ({
    createCopilotAgent: jest.fn(() => ({ id: 'copilot-agent' })),
    fetchCopilotShops: jest.fn(async () => []),
}))

jest.mock('./tracking/CopilotTracking', () => ({
    CopilotTracking: () => null,
}))

jest.mock('./uiActions/CopilotUiActionsProvider', () => ({
    CopilotUiActionsProvider: () => null,
}))

describe('CopilotProvider', () => {
    const baseCopilotProviderMock = assumeMock(BaseCopilotProvider)
    const createCopilotAgentMock = assumeMock(createCopilotAgent)
    const historyReplaceMock = assumeMock(history.replace)
    const useRunLifecycleMock = assumeMock(useRunLifecycle)
    const useThreadLifecycleMock = assumeMock(useThreadLifecycle)
    let runLifecycleCallbacks: RunLifecycleCallbacks
    let threadLifecycleCallbacks: ThreadLifecycleCallbacks

    beforeEach(() => {
        baseCopilotProviderMock.mockClear()
        createCopilotAgentMock.mockClear()
        historyReplaceMock.mockClear()
        runLifecycleCallbacks = {}
        threadLifecycleCallbacks = {}
        useRunLifecycleMock.mockImplementation(
            (callbacks: RunLifecycleCallbacks) => {
                runLifecycleCallbacks = callbacks
                return { isRunning: false }
            },
        )
        useThreadLifecycleMock.mockImplementation(
            (callbacks: ThreadLifecycleCallbacks) => {
                threadLifecycleCallbacks = callbacks
            },
        )
        window.GORGIAS_STATE = {
            currentAccount: { domain: 'acme', id: 123 },
        } as typeof window.GORGIAS_STATE
        window.USER_IMPERSONATED = null
    })

    it('renders children inside the copilot provider', () => {
        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
        )

        expect(screen.getByText('Helpdesk')).toBeInTheDocument()
    })

    it('hands the constructed agent, account domain, and shop fetcher to BaseCopilotProvider', () => {
        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
        )

        const props = baseCopilotProviderMock.mock.calls[0][0]

        expect(createCopilotAgentMock).toHaveBeenCalledTimes(1)
        expect(props.agent).toEqual({ id: 'copilot-agent' })
        expect(props.accountDomain).toBe('acme')
        expect(props.fetchShops).toBe(fetchCopilotShops)
    })

    it('enables internals only when the user is impersonating', () => {
        window.USER_IMPERSONATED = true

        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
        )

        expect(baseCopilotProviderMock.mock.calls[0][0].showInternals).toBe(
            true,
        )
    })

    it('hands a renderReference function that resolves links to BaseCopilotProvider', () => {
        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
        )
        const props = baseCopilotProviderMock.mock.calls[0][0]
        expect(typeof props.renderReference).toBe('function')

        const element = props.renderReference({
            reference: { type: 'ticket', id: 42 },
            children: 'label',
        })
        render(<>{element}</>)
        expect(screen.getByRole('link', { name: 'label' })).toHaveAttribute(
            'href',
            '/app/ticket/42',
        )
    })

    it('routes guidance and skill confirmations to their previews and falls back to null otherwise', () => {
        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
        )
        const props = baseCopilotProviderMock.mock.calls[0][0]
        const renderConfirmationPreview = props.renderConfirmationPreview
        expect(typeof renderConfirmationPreview).toBe('function')

        const handlers = {
            onApprove: jest.fn(),
            onReject: jest.fn(),
            approveLabel: 'Publish',
        }

        const guidanceElement = renderConfirmationPreview!({
            ...handlers,
            payload: {
                type: 'guidance',
                id: 7,
                shopName: 'acme',
                shopType: 'shopify',
            },
        })
        expect(isValidElement(guidanceElement)).toBe(true)
        expect((guidanceElement as ReactElement).type).toBe(
            GuidanceConfirmationPreview,
        )

        const skillElement = renderConfirmationPreview!({
            ...handlers,
            payload: {
                type: 'skill',
                id: 7,
                shopName: 'acme',
                shopType: 'shopify',
            },
        })
        expect(isValidElement(skillElement)).toBe(true)
        expect((skillElement as ReactElement).type).toBe(
            SkillConfirmationPreview,
        )

        const unknownElement = renderConfirmationPreview!({
            ...handlers,
            payload: { type: 'unknown' } as never,
        })
        expect(unknownElement).toBeNull()
    })

    it('passes conversation deep-link props to BaseCopilotProvider', () => {
        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
            {
                initialEntries: [
                    `/app/ticket/42?${GAIA_CONVERSATION_ID_QUERY_PARAM}=0b85907b-7f8e-4ef8-9b8a-9f2c2b8f8d11`,
                ],
            },
        )

        const props = baseCopilotProviderMock.mock.calls[0][0]
        expect(props.initialThreadId).toBe(
            '0b85907b-7f8e-4ef8-9b8a-9f2c2b8f8d11',
        )
        expect(props.conversationLinkParam).toBe(
            GAIA_CONVERSATION_ID_QUERY_PARAM,
        )
    })

    it('updates the conversation deep link when the active thread switches', () => {
        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
            {
                initialEntries: [
                    `/app/ticket/42?foo=bar&${GAIA_CONVERSATION_ID_QUERY_PARAM}=previous-thread`,
                ],
            },
        )

        act(() => {
            threadLifecycleCallbacks.onThreadSwitched?.({
                fromThreadId: 'previous-thread',
                toThreadId: 'selected-thread',
            })
        })

        expect(historyReplaceMock).toHaveBeenCalledWith({
            search: `foo=bar&${GAIA_CONVERSATION_ID_QUERY_PARAM}=selected-thread`,
        })
    })

    it('clears the conversation deep link when a new empty thread is created', () => {
        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
            {
                initialEntries: [
                    `/app/ticket/42?foo=bar&${GAIA_CONVERSATION_ID_QUERY_PARAM}=previous-thread`,
                ],
            },
        )

        act(() => {
            threadLifecycleCallbacks.onThreadCreated?.({
                threadId: 'new-thread',
            })
        })

        expect(historyReplaceMock).toHaveBeenCalledWith({
            search: 'foo=bar',
        })
    })

    it('sets the conversation deep link when a new thread starts from a user message', () => {
        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
            {
                initialEntries: ['/app/ticket/42?foo=bar'],
            },
        )

        act(() => {
            runLifecycleCallbacks.onStart?.({
                threadId: 'new-thread',
                runId: 'run-1',
                userMessage: 'hello',
            })
        })

        expect(historyReplaceMock).toHaveBeenCalledWith({
            search: `foo=bar&${GAIA_CONVERSATION_ID_QUERY_PARAM}=new-thread`,
        })
    })
})
