import { isValidElement } from 'react'
import type { ReactElement } from 'react'
import { screen } from '@testing-library/react'

import { assumeMock, render } from '@repo/testing'

import { CopilotProvider as BaseCopilotProvider } from '@gorgias/copilot'

import { createCopilotAgent, fetchCopilotShops } from 'utils/sdk'

import { GuidanceConfirmationPreview } from './confirmation/GuidanceConfirmationPreview'
import { CopilotProvider } from './CopilotProvider'

jest.mock('utils/sdk', () => ({
    createCopilotAgent: jest.fn(() => ({ id: 'copilot-agent' })),
    fetchCopilotShops: jest.fn(async () => []),
}))

describe('CopilotProvider', () => {
    const baseCopilotProviderMock = assumeMock(BaseCopilotProvider)
    const createCopilotAgentMock = assumeMock(createCopilotAgent)

    beforeEach(() => {
        baseCopilotProviderMock.mockClear()
        createCopilotAgentMock.mockClear()
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

    it('routes guidance confirmations to the preview and falls back to null otherwise', () => {
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

        const unknownElement = renderConfirmationPreview!({
            ...handlers,
            payload: { type: 'unknown' } as never,
        })
        expect(unknownElement).toBeNull()
    })
})
