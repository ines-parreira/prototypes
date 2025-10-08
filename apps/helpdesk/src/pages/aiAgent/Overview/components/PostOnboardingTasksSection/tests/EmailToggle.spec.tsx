import React from 'react'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { StoreConfiguration } from 'models/aiAgent/types'

import { EmailToggle } from '../EmailToggle'

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
        trialModeActivatedDatetime: null,
        previewModeActivatedDatetime: null,
        storeName: 'test-store',
        shopType: 'shopify',
    } as unknown as StoreConfiguration

    const defaultProps = {
        isEmailChannelEnabled: false,
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
            <MemoryRouter>
                <EmailToggle
                    {...defaultProps}
                    storeConfiguration={storeConfig}
                    setIsEmailChannelEnabled={setIsEmailChannelEnabled}
                    onEmailToggle={onEmailToggle}
                />
            </MemoryRouter>,
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
        render(
            <MemoryRouter>
                <EmailToggle {...defaultProps} />
            </MemoryRouter>,
        )

        expect(screen.getByText(/email address/)).toBeInTheDocument()
    })

    it('enables toggle when email integrations are available', () => {
        const storeConfig = {
            ...defaultStoreConfig,
            monitoredEmailIntegrations: [{ id: 1 }],
        } as unknown as StoreConfiguration

        render(
            <MemoryRouter>
                <EmailToggle
                    {...defaultProps}
                    storeConfiguration={storeConfig}
                />
            </MemoryRouter>,
        )

        const toggleButton = screen.getByRole('switch')
        expect(toggleButton).not.toBeDisabled()

        expect(screen.queryByAltText('warning')).not.toBeInTheDocument()
    })

    it('does not call onEmailToggle when storeConfiguration is undefined', async () => {
        const setIsEmailChannelEnabled = jest.fn()
        const onEmailToggle = jest.fn()

        render(
            <MemoryRouter>
                <EmailToggle
                    {...defaultProps}
                    storeConfiguration={undefined}
                    setIsEmailChannelEnabled={setIsEmailChannelEnabled}
                    onEmailToggle={onEmailToggle}
                />
            </MemoryRouter>,
        )

        const toggleButton = screen.getByRole('switch')
        await userEvent.click(toggleButton)

        expect(setIsEmailChannelEnabled).not.toHaveBeenCalled()
        expect(onEmailToggle).not.toHaveBeenCalled()
    })
})
