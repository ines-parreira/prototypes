import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import type { StoreConfiguration } from 'models/aiAgent/types'

import { EmailToggle } from '../../AiAgentTasks/EmailToggle'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            deployEmail: '/mock/deploy-email-route',
        },
    }),
}))
describe('EmailToggle', () => {
    const defaultStoreConfig = {
        monitoredEmailIntegrations: [],
        emailChannelDeactivatedDatetime: 'some-date',
        previewModeActivatedDatetime: null,
        storeName: 'test-store',
        shopType: 'shopify',
    } as unknown as StoreConfiguration
    const defaultProps = {
        isEmailChannelEnabled: false,
        isLoading: false,
        setIsEmailChannelEnabled: jest.fn(),
        storeConfiguration: defaultStoreConfig,
        shopName: 'test-shop',
        onEmailToggle: jest.fn(),
    }
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('calls onEmailToggle when toggle is clicked', async () => {
        const setIsEmailChannelEnabled = jest.fn()
        const onEmailToggle = jest.fn()
        const storeConfig = {
            ...defaultStoreConfig,
            monitoredEmailIntegrations: [{ id: 1 }],
        } as unknown as StoreConfiguration
        render(
            <EmailToggle
                {...defaultProps}
                storeConfiguration={storeConfig}
                setIsEmailChannelEnabled={setIsEmailChannelEnabled}
                onEmailToggle={onEmailToggle}
            />,
            {},
        )
        const toggleButton = screen.getByRole('switch')
        await userEvent.click(toggleButton)
        expect(setIsEmailChannelEnabled).toHaveBeenCalledWith(true)
        expect(onEmailToggle).toHaveBeenCalledWith({
            ...storeConfig,
            emailChannelDeactivatedDatetime: null,
        })
    })
    it('shows warning when email is disabled due to missing integrations', () => {
        render(<EmailToggle {...defaultProps} />, {})
        expect(
            screen.getByRole('link', { name: 'Connect an email address' }),
        ).toBeInTheDocument()
    })
    it('enables toggle when email integrations are available', () => {
        const storeConfig = {
            ...defaultStoreConfig,
            monitoredEmailIntegrations: [{ id: 1 }],
        } as unknown as StoreConfiguration
        render(
            <EmailToggle {...defaultProps} storeConfiguration={storeConfig} />,
            {},
        )
        const toggleButton = screen.getByRole('switch')
        expect(toggleButton).not.toBeDisabled()
        expect(screen.queryByAltText('warning')).not.toBeInTheDocument()
    })
    it('shows the start-trial caption and calls onStartTrial when channel is connected and trial-gated', async () => {
        const onStartTrial = jest.fn()
        const storeConfig = {
            ...defaultStoreConfig,
            monitoredEmailIntegrations: [{ id: 1 }],
        } as unknown as StoreConfiguration
        render(
            <EmailToggle
                {...defaultProps}
                storeConfiguration={storeConfig}
                showTrialGateWarning
                onStartTrial={onStartTrial}
            />,
            {},
        )

        expect(
            screen.getByText(/to deploy/, { exact: false }),
        ).toBeInTheDocument()
        await userEvent.click(
            screen.getByRole('link', { name: 'Start AI Agent trial' }),
        )
        expect(onStartTrial).toHaveBeenCalledTimes(1)
    })
    it('does not show the start-trial caption when not trial-gated', () => {
        const storeConfig = {
            ...defaultStoreConfig,
            monitoredEmailIntegrations: [{ id: 1 }],
        } as unknown as StoreConfiguration
        render(
            <EmailToggle
                {...defaultProps}
                storeConfiguration={storeConfig}
                onStartTrial={jest.fn()}
            />,
            {},
        )
        expect(
            screen.queryByRole('link', { name: 'Start AI Agent trial' }),
        ).not.toBeInTheDocument()
    })
    it('does not show the start-trial caption for a read-only (completed) toggle that is not trial-gated', () => {
        const storeConfig = {
            ...defaultStoreConfig,
            monitoredEmailIntegrations: [{ id: 1 }],
        } as unknown as StoreConfiguration
        render(
            <EmailToggle
                {...defaultProps}
                storeConfiguration={storeConfig}
                isReadOnly
            />,
            {},
        )
        expect(
            screen.queryByRole('link', { name: 'Start AI Agent trial' }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(/to deploy/, { exact: false }),
        ).not.toBeInTheDocument()
    })
    it('does not call onEmailToggle when storeConfiguration is undefined', async () => {
        const setIsEmailChannelEnabled = jest.fn()
        const onEmailToggle = jest.fn()
        render(
            <EmailToggle
                {...defaultProps}
                storeConfiguration={undefined}
                setIsEmailChannelEnabled={setIsEmailChannelEnabled}
                onEmailToggle={onEmailToggle}
            />,
            {},
        )
        const toggleButton = screen.getByRole('switch')
        await userEvent.click(toggleButton)
        expect(setIsEmailChannelEnabled).not.toHaveBeenCalled()
        expect(onEmailToggle).not.toHaveBeenCalled()
    })
})
