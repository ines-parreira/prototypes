import { screen } from '@testing-library/react'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { assumeMock, renderWithRouter } from 'utils/testing'

import VoiceIntegration from '../VoiceIntegration'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('core/flags')
jest.mock(
    'pages/integrations/integration/components/voice/VoiceIntegrationQueueRoutes',
    () => () => <div>QueueRoutes</div>,
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
    'pages/integrations/integration/components/voice/VoiceIntegrationDetails',
    () => () => <div>VoiceIntegrationDetails</div>,
)
jest.mock(
    'pages/integrations/integration/components/voice/VoiceIntegrationCreate',
    () => () => <div>VoiceIntegrationCreate</div>,
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

    it('should render integration settings under FF', () => {
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

        expect(screen.queryByText('New settings')).toBeInTheDocument()
    })
})
