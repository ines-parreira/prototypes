import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import { renderWithRouter } from 'utils/testing'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import VoiceIntegration from '../VoiceIntegration'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('core/flags')
jest.mock(
    'pages/integrations/integration/components/voice/VoiceIntegrationQueueRoutes',
    () => () => <div>QueueRoutes</div>,
)
jest.mock(
    'pages/integrations/integration/components/voice/VoiceIntegrationOnboarding/VoiceIntegrationOnboarding',
    () => () => <div>VoiceIntegrationOnboarding</div>,
)
jest.mock('state/integrations/selectors', () => ({
    getIntegrationById: jest.fn(),
    getPhoneIntegrations: jest.fn(),
}))
jest.mock('pages/integrations/integration/utils/defaultRoutes', () => ({
    getDefaultRoutes: jest.fn(() => ({
        integrations: '/integrations',
        about: '/integrations/about',
    })),
}))
jest.mock(
    'pages/integrations/integration/components/phone/PhoneIntegrationBreadcrumbs',
    () => () => <div>PhoneIntegrationBreadcrumbs</div>,
)
jest.mock(
    'pages/integrations/integration/components/voice/VoiceIntegrationDetails',
    () => () => <div>VoiceIntegrationDetails</div>,
)
jest.mock(
    'pages/integrations/integration/components/phone/PhoneIntegrationsList',
    () => () => <div>PhoneIntegrationsList</div>,
)
jest.mock(
    'pages/integrations/integration/components/voice/VoiceIntegrationIvr',
    () => () => <div>VoiceIntegrationIvr</div>,
)
jest.mock(
    'pages/integrations/integration/components/voice/VoiceIntegrationIVRPreferences',
    () => () => <div>VoiceIntegrationIVRPreferences</div>,
)
jest.mock('../VoiceIntegrationSettingsPage', () => () => (
    <div>VoiceIntegrationSettings</div>
))
jest.mock(
    'pages/integrations/integration/components/voice/VoiceIntegrationVoicemail',
    () => () => <div>VoiceIntegrationVoicemail</div>,
)

describe('VoiceIntegration', () => {
    const renderComponent = (route: string = '') =>
        renderWithRouter(<VoiceIntegration />, { route })

    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(null)
    })

    it('should render Queues when FF is on', () => {
        renderComponent()

        expect(screen.getByText('QueueRoutes')).toBeInTheDocument()
    })

    it('should not render secondary navigation when on specific queue page', () => {
        renderComponent(`${PHONE_INTEGRATION_BASE_URL}/queues/123`)

        expect(screen.queryByText('About')).toBeNull()
    })

    it('should render integration settings', () => {
        useAppSelectorMock.mockReturnValue({
            id: 1,
            name: 'testing',
            type: 'phone',
            meta: {
                function: 'standard',
            },
        })

        renderComponent()

        expect(screen.queryByText('Preferences')).toBeNull()
        expect(screen.queryByText('Voicemail')).toBeNull()
        expect(screen.queryByText('Greetings & Music')).toBeNull()
    })

    it('should render route for IVR integration', () => {
        useAppSelectorMock.mockReturnValue({
            id: 1,
            name: 'testing',
            type: 'phone',
            meta: {
                function: 'ivr',
            },
        })

        renderComponent()

        expect(screen.queryByText('Preferences')).toBeInTheDocument()
        expect(screen.queryByText('Voicemail')).toBeInTheDocument()
        expect(screen.queryByText('IVR')).toBeInTheDocument()
    })

    it('should render the VoiceIntegrationOnboarding component on /new', () => {
        renderComponent(`${PHONE_INTEGRATION_BASE_URL}/new`)

        expect(
            screen.getByText('VoiceIntegrationOnboarding'),
        ).toBeInTheDocument()
    })
})
