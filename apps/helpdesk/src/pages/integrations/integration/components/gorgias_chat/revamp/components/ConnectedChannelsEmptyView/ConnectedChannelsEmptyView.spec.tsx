import type { ComponentProps, ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { AutomateFeatures } from 'pages/automate/common/types'

import { ConnectedChannelsEmptyView } from './ConnectedChannelsEmptyView'

const mockHistoryPush = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockHistoryPush }),
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Button: ({
        children,
        onClick,
    }: {
        children: ReactNode
        onClick?: () => void
    }) => <button onClick={onClick}>{children}</button>,
}))

jest.mock('pages/automate/common/components/AutomatePaywallView', () => ({
    __esModule: true,
    default: ({
        automateFeature,
        customCta,
    }: {
        automateFeature: string
        customCta: ReactNode
    }) => (
        <div data-automate-feature={automateFeature}>
            <span>Paywall View</span>
            {customCta}
        </div>
    ),
}))

const renderWithRouter = (
    view: ComponentProps<typeof ConnectedChannelsEmptyView>['view'],
    route: string,
    path: string,
) => {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <Route path={path}>
                <ConnectedChannelsEmptyView view={view} />
            </Route>
        </MemoryRouter>,
    )
}

describe('ConnectedChannelsEmptyView', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('when on specific channel automate view', () => {
        it('should navigate to installation page for Chat on click', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                AutomateFeatures.AutomateChat,
                '/app/settings/channels/gorgias_chat/123/automate',
                '/app/settings/channels/gorgias_chat/:integrationId/automate',
            )

            await user.click(
                screen.getByRole('button', { name: 'Go To Connect Store' }),
            )

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/settings/channels/gorgias_chat/123/installation',
            )
        })

        it('should navigate to publish page for Contact Form on click', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                AutomateFeatures.AutomateContactForm,
                '/app/settings/contact-form/456/automate',
                '/app/settings/contact-form/:contactFormId/automate',
            )

            await user.click(
                screen.getByRole('button', { name: 'Go To Connect Store' }),
            )

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/settings/contact-form/456/publish',
            )
        })

        it('should navigate to publish-track page for Help Center on click', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                AutomateFeatures.AutomateHelpCenter,
                '/app/settings/help-center/789/automate',
                '/app/settings/help-center/:helpCenterId/automate',
            )

            await user.click(
                screen.getByRole('button', { name: 'Go To Connect Store' }),
            )

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/settings/help-center/789/publish-track',
            )
        })
    })

    describe('when on general view', () => {
        it('should navigate to gorgias_chat settings for Chat on click', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                AutomateFeatures.AutomateChat,
                '/app/settings/channels/gorgias_chat',
                '/app/settings/channels/gorgias_chat',
            )

            await user.click(screen.getByRole('button', { name: 'Go To Chat' }))

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/settings/channels/gorgias_chat',
            )
        })

        it('should navigate to contact-form settings for Contact Form on click', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                AutomateFeatures.AutomateContactForm,
                '/app/settings/contact-form',
                '/app/settings/contact-form',
            )

            await user.click(
                screen.getByRole('button', { name: 'Go To Contact Form' }),
            )

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/settings/contact-form',
            )
        })

        it('should navigate to help-center settings for Help Center on click', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                AutomateFeatures.AutomateHelpCenter,
                '/app/settings/help-center',
                '/app/settings/help-center',
            )

            await user.click(
                screen.getByRole('button', { name: 'Go To Help Center' }),
            )

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/settings/help-center',
            )
        })
    })

    it('should pass the correct automateFeature to AutomatePaywallView', () => {
        const { container } = renderWithRouter(
            AutomateFeatures.AutomateChat,
            '/app/settings/channels/gorgias_chat',
            '/app/settings/channels/gorgias_chat',
        )

        expect(
            container.querySelector('[data-automate-feature="AutomateChat"]'),
        ).toBeInTheDocument()
    })
})
