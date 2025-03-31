import { screen } from '@testing-library/react'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { assumeMock, renderWithRouter } from 'utils/testing'

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
    'pages/integrations/integration/components/voice/DEPRECATED_VoiceIntegrationCreate',
    () => () => <div>DEPRECATED_VoiceIntegrationCreate</div>,
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
    'pages/integrations/integration/components/voice/VoiceIntegrationVoicemail',
    () => () => <div>VoiceIntegrationVoicemail</div>,
)
jest.mock(
    'pages/integrations/integration/components/voice/VoiceIntegrationGreetingMessage',
    () => () => <div>VoiceIntegrationGreetingMessage</div>,
)
jest.mock(
    'pages/integrations/integration/components/voice/VoiceIntegrationPreferences',
    () => () => <div>VoiceIntegrationPreferences</div>,
)
jest.mock('../VoiceIntegrationSettingsPage', () => () => (
    <div>VoiceIntegrationSettings</div>
))

const useFlagMock = assumeMock(useFlag)

describe('VoiceIntegration', () => {
    const renderComponent = (route: string = '') =>
        renderWithRouter(<VoiceIntegration />, { route })

    beforeEach(() => {
        useFlagMock.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue(null)
    })

    it('should not render Queues when FF is off', () => {
        useFlagMock.mockReturnValue(false)
        renderComponent()

        expect(screen.queryByText('Queues')).toBeNull()
        expect(screen.queryByText('QueueRoutes')).toBeNull()
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
        useFlagMock.mockReturnValue(true)

        renderComponent()

        expect(screen.queryByText('Preferences')).toBeNull()
        expect(screen.queryByText('Voicemail')).toBeNull()
        expect(screen.queryByText('Greetings & Music')).toBeNull()
    })

    it('should render old route for IVR integration', () => {
        useAppSelectorMock.mockReturnValue({
            id: 1,
            name: 'testing',
            type: 'phone',
            meta: {
                function: 'ivr',
            },
        })
        useFlagMock.mockReturnValue(true)

        renderComponent()

        expect(screen.queryByText('Preferences')).toBeInTheDocument()
        expect(screen.queryByText('Voicemail')).toBeInTheDocument()
        expect(screen.queryByText('IVR')).toBeInTheDocument()
    })

    it('should render integration settings with FF off', () => {
        useAppSelectorMock.mockReturnValue({
            id: 1,
            name: 'testing',
            type: 'phone',
            meta: {
                function: 'standard',
            },
        })
        useFlagMock.mockReturnValue(false)

        renderComponent()

        expect(screen.queryByText('Preferences')).toBeInTheDocument()
        expect(screen.queryByText('Voicemail')).toBeInTheDocument()
        expect(screen.queryByText('Greetings & Music')).toBeInTheDocument()
    })

    it('should render old route for IVR integration with FF off', () => {
        useAppSelectorMock.mockReturnValue({
            id: 1,
            name: 'testing',
            type: 'phone',
            meta: {
                function: 'ivr',
            },
        })
        useFlagMock.mockReturnValue(false)

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

    it('should render the DEPRECATED_VoiceIntegrationCreate component on /new when FF is off', () => {
        useFlagMock.mockReturnValue(false)
        renderComponent(`${PHONE_INTEGRATION_BASE_URL}/new`)

        expect(
            screen.getByText('DEPRECATED_VoiceIntegrationCreate'),
        ).toBeInTheDocument()
    })
})
