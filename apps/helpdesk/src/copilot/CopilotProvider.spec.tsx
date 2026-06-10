import { isValidElement } from 'react'
import type { ReactElement } from 'react'
import { screen, waitFor } from '@testing-library/react'

import { assumeMock, render } from '@repo/testing'

import { useLocation } from 'react-router-dom'
import {
    CopilotProvider as BaseCopilotProvider,
    useCopilot,
    useCopilotPanel,
} from '@gorgias/copilot'

import { createCopilotAgent, fetchCopilotShops } from 'utils/sdk'

import { GuidanceConfirmationPreview } from './confirmation/GuidanceConfirmationPreview'
import { SkillConfirmationPreview } from './confirmation/SkillConfirmationPreview'
import {
    COPILOT_CONVERSATION_ID_QUERY_PARAM,
    CopilotProvider,
} from './CopilotProvider'

jest.mock('utils/sdk', () => ({
    createCopilotAgent: jest.fn(() => ({ id: 'copilot-agent' })),
    fetchCopilotShops: jest.fn(async () => []),
}))

describe('CopilotProvider', () => {
    const baseCopilotProviderMock = assumeMock(BaseCopilotProvider)
    const createCopilotAgentMock = assumeMock(createCopilotAgent)
    const useCopilotMock = assumeMock(useCopilot)
    const useCopilotPanelMock = assumeMock(useCopilotPanel)

    beforeEach(() => {
        baseCopilotProviderMock.mockClear()
        createCopilotAgentMock.mockClear()
        useCopilotMock.mockReturnValue(buildCopilotMockReturn())
        useCopilotPanelMock.mockReturnValue(buildCopilotPanelMockReturn())
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

    it('opens copilot and switches to the forced conversation from the URL', () => {
        const switchThread = jest.fn()
        const setIsOpen = jest.fn()
        useCopilotMock.mockReturnValue(buildCopilotMockReturn({ switchThread }))
        useCopilotPanelMock.mockReturnValue(
            buildCopilotPanelMockReturn({ setIsOpen }),
        )

        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
            {
                initialEntries: [
                    `/app/ticket/42?${COPILOT_CONVERSATION_ID_QUERY_PARAM}=forced-conversation-123`,
                ],
            },
        )

        expect(switchThread).toHaveBeenCalledWith('forced-conversation-123')
        expect(setIsOpen).toHaveBeenCalledWith(true)
    })

    it('clears the forced conversation param and preserves the rest of the query string', async () => {
        const switchThread = jest.fn()
        const setIsOpen = jest.fn()
        useCopilotMock.mockReturnValue(buildCopilotMockReturn({ switchThread }))
        useCopilotPanelMock.mockReturnValue(
            buildCopilotPanelMockReturn({ setIsOpen }),
        )

        render(
            <CopilotProvider>
                <LocationSearchProbe />
            </CopilotProvider>,
            {
                initialEntries: [
                    '/app/ticket/42?tab=details&copilotConversationId=forced-conversation-123',
                ],
            },
        )

        expect(switchThread).toHaveBeenCalledWith('forced-conversation-123')
        expect(setIsOpen).toHaveBeenCalledWith(true)
        await waitFor(() => {
            expect(screen.getByLabelText('Current search')).toHaveTextContent(
                '?tab=details',
            )
        })
    })

    it('opens copilot without switching when the forced conversation is already active', () => {
        const switchThread = jest.fn()
        const setIsOpen = jest.fn()
        useCopilotMock.mockReturnValue(
            buildCopilotMockReturn({
                switchThread,
                threadId: 'active-conversation',
            }),
        )
        useCopilotPanelMock.mockReturnValue(
            buildCopilotPanelMockReturn({ setIsOpen }),
        )

        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
            {
                initialEntries: [
                    '/app/ticket/42?copilotConversationId=active-conversation',
                ],
            },
        )

        expect(switchThread).not.toHaveBeenCalled()
        expect(setIsOpen).toHaveBeenCalledWith(true)
    })

    it('ignores missing and blank forced conversation params', () => {
        const switchThread = jest.fn()
        const setIsOpen = jest.fn()
        useCopilotMock.mockReturnValue(buildCopilotMockReturn({ switchThread }))
        useCopilotPanelMock.mockReturnValue(
            buildCopilotPanelMockReturn({ setIsOpen }),
        )

        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
            {
                initialEntries: ['/app/ticket/42?copilotConversationId=%20'],
            },
        )

        expect(switchThread).not.toHaveBeenCalled()
        expect(setIsOpen).not.toHaveBeenCalled()
    })

    it('uses only the supported forced conversation query param', () => {
        const switchThread = jest.fn()
        const setIsOpen = jest.fn()
        useCopilotMock.mockReturnValue(buildCopilotMockReturn({ switchThread }))
        useCopilotPanelMock.mockReturnValue(
            buildCopilotPanelMockReturn({ setIsOpen }),
        )

        render(
            <CopilotProvider>
                <div>Helpdesk</div>
            </CopilotProvider>,
            {
                initialEntries: [
                    '/app/ticket/42?copilot-conversation-id=ignored&copilot_conversation_id=ignored',
                ],
            },
        )

        expect(switchThread).not.toHaveBeenCalled()
        expect(setIsOpen).not.toHaveBeenCalled()
    })
})

function buildCopilotMockReturn(
    overrides: Partial<ReturnType<typeof useCopilot>> = {},
): ReturnType<typeof useCopilot> {
    return {
        abort: jest.fn(),
        agent: {} as ReturnType<typeof useCopilot>['agent'],
        agentKey: 'agent-key',
        newThread: jest.fn(),
        sendPrompt: jest.fn(() => 'message-id'),
        switchThread: jest.fn(),
        threadId: 'current-thread',
        ...overrides,
    }
}

function buildCopilotPanelMockReturn(
    overrides: Partial<ReturnType<typeof useCopilotPanel>> = {},
): ReturnType<typeof useCopilotPanel> {
    return {
        isOpen: false,
        setIsOpen: jest.fn(),
        setWidth: jest.fn(),
        width: 400,
        ...overrides,
    }
}

function LocationSearchProbe() {
    const { search } = useLocation()

    return <output aria-label="Current search">{search}</output>
}
