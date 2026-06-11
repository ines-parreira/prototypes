import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useLocation } from 'react-router-dom'

import { mockGetIntegrationHandler } from '@gorgias/helpdesk-mocks'
import type { PhoneIntegration } from '@gorgias/helpdesk-queries'
import { IntegrationType } from '@gorgias/helpdesk-types'

import { integrationsState } from 'fixtures/integrations'
import type { RootState } from 'state/types'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import { VoiceIntegrationSettingsPage } from '../VoiceIntegrationSettingsPage'

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone,
) as unknown as PhoneIntegration
jest.mock('../VoiceIntegrationSettingsForm', () => ({
    VoiceIntegrationSettingsForm: () => <div>VoiceIntegrationSettingsForm</div>,
}))
const CurrentPath = () => {
    const location = useLocation()

    return <output aria-label="Current path">{location.pathname}</output>
}

const server = setupServer(
    mockGetIntegrationHandler(async () => HttpResponse.json(phoneIntegration))
        .handler,
)

describe('VoiceIntegrationSettings', () => {
    const renderComponent = (storeState: RootState) => {
        return render(
            <>
                <VoiceIntegrationSettingsPage />
                <CurrentPath />
            </>,
            {
                initialEntries: ['/app/settings/channels/phone/1/preferences'],
                path: '/app/settings/channels/phone/:integrationId?/:tab?',
                storeState: storeState,
            },
        )
    }

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should render', async () => {
        renderComponent({} as RootState)
        expect(
            await screen.findByText('VoiceIntegrationSettingsForm'),
        ).toBeInTheDocument()
    })
    it('should not render without valid integration', () => {
        server.use(
            mockGetIntegrationHandler(async () => HttpResponse.json({} as any))
                .handler,
        )

        const { queryByText } = renderComponent({} as RootState)
        expect(queryByText('VoiceIntegrationSettingsForm')).toBeNull()
    })
    it('should redirect to phone integrations page if get integration fails', async () => {
        server.use(
            mockGetIntegrationHandler(async () =>
                HttpResponse.json(null as never, { status: 500 }),
            ).handler,
        )

        const { queryByText } = renderComponent({} as RootState)
        expect(queryByText('VoiceIntegrationSettingsForm')).toBeNull()
        const toastEl = await screen.findByRole('status', {
            name: 'Failed to fetch integration',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        expect(screen.getByLabelText('Current path')).toHaveTextContent(
            PHONE_INTEGRATION_BASE_URL,
        )
    })
    it('should not render while loading integration', () => {
        server.use(
            mockGetIntegrationHandler(() => new Promise(() => undefined))
                .handler,
        )

        const { queryByText } = renderComponent({} as RootState)
        expect(queryByText('VoiceIntegrationSettingsForm')).toBeNull()
    })
})
