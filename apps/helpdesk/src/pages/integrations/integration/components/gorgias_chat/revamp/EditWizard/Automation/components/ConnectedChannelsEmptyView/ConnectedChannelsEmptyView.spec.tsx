import type { ComponentProps, ReactNode } from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router-dom'

import { AutomateFeatures } from 'pages/automate/common/types'

import { ConnectedChannelsEmptyView } from './ConnectedChannelsEmptyView'

jest.mock('pages/automate/common/components/AutomatePaywallView', () => ({
    __esModule: true,
    default: ({
        automateFeature,
        customCta,
    }: {
        automateFeature: string
        customCta: ReactNode
    }) => (
        <div>
            <span>Paywall feature: {automateFeature}</span>
            {customCta}
        </div>
    ),
}))
const CurrentPath = () => {
    const location = useLocation()

    return <output aria-label="Current path">{location.pathname}</output>
}
const renderComponent = (
    view: ComponentProps<typeof ConnectedChannelsEmptyView>['view'],
    route: string,
    path: string,
) => {
    return render(
        <>
            <ConnectedChannelsEmptyView view={view} />
            <CurrentPath />
        </>,
        {
            initialEntries: [route],
            path,
        },
    )
}
describe('ConnectedChannelsEmptyView', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })
    describe('when on specific channel automate view', () => {
        it('should navigate to installation page for Chat on click', async () => {
            const user = userEvent.setup()
            renderComponent(
                AutomateFeatures.AutomateChat,
                '/app/settings/channels/gorgias_chat/123/automate',
                '/app/settings/channels/gorgias_chat/:integrationId/:view?',
            )
            await user.click(
                screen.getByRole('button', { name: 'Go To Connect Store' }),
            )
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                '/app/settings/channels/gorgias_chat/123/installation',
            )
        })
        it('should navigate to publish page for Contact Form on click', async () => {
            const user = userEvent.setup()
            renderComponent(
                AutomateFeatures.AutomateContactForm,
                '/app/settings/contact-form/456/automate',
                '/app/settings/contact-form/:contactFormId/:view?',
            )
            await user.click(
                screen.getByRole('button', { name: 'Go To Connect Store' }),
            )
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                '/app/settings/contact-form/456/publish',
            )
        })
        it('should navigate to publish-track page for Help Center on click', async () => {
            const user = userEvent.setup()
            renderComponent(
                AutomateFeatures.AutomateHelpCenter,
                '/app/settings/help-center/789/automate',
                '/app/settings/help-center/:helpCenterId/:view?',
            )
            await user.click(
                screen.getByRole('button', { name: 'Go To Connect Store' }),
            )
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                '/app/settings/help-center/789/publish-track',
            )
        })
    })
    describe('when on general view', () => {
        it('should navigate to gorgias_chat settings for Chat on click', async () => {
            const user = userEvent.setup()
            renderComponent(
                AutomateFeatures.AutomateChat,
                '/app/settings/channels/gorgias_chat',
                '/app/settings/channels/gorgias_chat',
            )
            await user.click(screen.getByRole('button', { name: 'Go To Chat' }))
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                '/app/settings/channels/gorgias_chat',
            )
        })
        it('should navigate to contact-form settings for Contact Form on click', async () => {
            const user = userEvent.setup()
            renderComponent(
                AutomateFeatures.AutomateContactForm,
                '/app/settings/contact-form',
                '/app/settings/contact-form',
            )
            await user.click(
                screen.getByRole('button', { name: 'Go To Contact Form' }),
            )
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                '/app/settings/contact-form',
            )
        })
        it('should navigate to help-center settings for Help Center on click', async () => {
            const user = userEvent.setup()
            renderComponent(
                AutomateFeatures.AutomateHelpCenter,
                '/app/settings/help-center',
                '/app/settings/help-center',
            )
            await user.click(
                screen.getByRole('button', { name: 'Go To Help Center' }),
            )
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                '/app/settings/help-center',
            )
        })
    })
    it('should pass the correct automateFeature to AutomatePaywallView', () => {
        renderComponent(
            AutomateFeatures.AutomateChat,
            '/app/settings/channels/gorgias_chat',
            '/app/settings/channels/gorgias_chat',
        )
        expect(
            screen.getByText('Paywall feature: AutomateChat'),
        ).toBeInTheDocument()
    })
})
