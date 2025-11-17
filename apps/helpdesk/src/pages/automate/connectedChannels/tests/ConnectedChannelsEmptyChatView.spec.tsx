import type React from 'react'

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, useRouteMatch } from 'react-router-dom'

import { AutomateFeatures } from 'pages/automate/common/types'

import { ConnectedChannelsEmptyView } from '../components/ConnectedChannelsEmptyView'

jest.mock('pages/automate/common/components/AutomatePaywallView', () => ({
    __esModule: true,
    default: ({ customCta }: { customCta: React.ReactNode }) => (
        <div>{customCta}</div>
    ),
}))

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useRouteMatch: jest.fn(),
}))
const useRouteMatchMock = useRouteMatch as jest.Mock

describe('ConnectedChannelsEmptyView', () => {
    it('should render the correct button text for AutomateChat when in automate page', () => {
        useRouteMatchMock.mockReturnValue({
            url: '/app/automation/shopType/shopName/channels',
        })
        render(
            <MemoryRouter
                initialEntries={['/app/automation/shopType/shopName/channels']}
            >
                <Route path="*">
                    <ConnectedChannelsEmptyView
                        view={AutomateFeatures.AutomateChat}
                    />
                </Route>
            </MemoryRouter>,
        )
        expect(screen.getByText('Go To Chat')).toBeInTheDocument()
    })

    it('should render the correct button text for AutomateChat when in settings page', () => {
        useRouteMatchMock.mockReturnValue({
            url: '/app/settings/automate',
            params: { integrationId: 1 },
        })
        render(
            <MemoryRouter initialEntries={['/app/settings/automate']}>
                <Route path="*">
                    <ConnectedChannelsEmptyView
                        view={AutomateFeatures.AutomateChat}
                    />
                </Route>
            </MemoryRouter>,
        )

        expect(screen.getByText('Go To Connect Store')).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'Go To Connect Store' }),
        ).toHaveAttribute(
            'href',
            '/app/settings/channels/gorgias_chat/1/installation',
        )
    })

    it('should render the correct button ext for AutomateContactForm when in settings page ', () => {
        useRouteMatchMock.mockReturnValue({
            url: '/app/settings/contact-form/automate',
            params: { contactFormId: 1 },
        })
        render(
            <MemoryRouter
                initialEntries={['/app/settings/contact-form/automate']}
            >
                <Route path="*">
                    <ConnectedChannelsEmptyView
                        view={AutomateFeatures.AutomateContactForm}
                    />
                </Route>
            </MemoryRouter>,
        )
        expect(screen.getByText('Go To Connect Store')).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'Go To Connect Store' }),
        ).toHaveAttribute('href', '/app/settings/contact-form/1/publish')
    })

    it('should render the correct button for AutomateContactForm when in automate page', () => {
        useRouteMatchMock.mockReturnValue({
            url: '/app/automation/shopType/shopName/channels',
        })

        render(
            <MemoryRouter
                initialEntries={['/app/automation/shopType/shopName/channels']}
            >
                <Route path="*">
                    <ConnectedChannelsEmptyView
                        view={AutomateFeatures.AutomateContactForm}
                    />
                </Route>
            </MemoryRouter>,
        )

        expect(screen.getByText('Go To Contact Form')).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'Go To Contact Form' }),
        ).toHaveAttribute('href', '/app/settings/contact-form')
    })

    it('should render the correct button for AutomateHelpCenter when in settings page ', () => {
        useRouteMatchMock.mockReturnValue({
            url: '/app/settings/help-center/automate',
            params: { helpCenterId: 1 },
        })
        render(
            <MemoryRouter
                initialEntries={['/app/settings/help-center/automate']}
            >
                <Route path="*">
                    <ConnectedChannelsEmptyView
                        view={AutomateFeatures.AutomateHelpCenter}
                    />
                </Route>
            </MemoryRouter>,
        )
        expect(screen.getByText('Go To Connect Store')).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'Go To Connect Store' }),
        ).toHaveAttribute('href', '/app/settings/help-center/1/publish-track')
    })

    it('should render the correct button for AutomateHelpCenter when in automate page', () => {
        useRouteMatchMock.mockReturnValue({
            url: '/app/automation/shopType/shopName/channels',
        })

        render(
            <MemoryRouter
                initialEntries={['/app/automation/shopType/shopName/channels']}
            >
                <Route path="*">
                    <ConnectedChannelsEmptyView
                        view={AutomateFeatures.AutomateHelpCenter}
                    />
                </Route>
            </MemoryRouter>,
        )

        expect(screen.getByText('Go To Help Center')).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'Go To Help Center' }),
        ).toHaveAttribute('href', '/app/settings/help-center')
    })
})
