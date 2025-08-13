import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useFlag } from 'core/flags'
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
jest.mock('../VoiceIntegrationFlowPage', () => () => (
    <div>VoiceIntegrationFlowPage</div>
))

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

describe('VoiceIntegration', () => {
    const renderComponent = (route: string = '') =>
        renderWithRouter(<VoiceIntegration />, { route })

    describe.each([true, false])(
        'routes outside of integration context',
        (extendedCallFlowsFF) => {
            beforeEach(() => {
                useAppSelectorMock.mockReturnValue(null)
                useFlagMock.mockReturnValue(extendedCallFlowsFF)
            })

            it('should render Queues', () => {
                renderComponent()

                expect(screen.getByText('QueueRoutes')).toBeInTheDocument()
            })

            it('should not render secondary navigation when on specific queue page', () => {
                renderComponent(`${PHONE_INTEGRATION_BASE_URL}/queues/123`)

                expect(screen.queryByText('About')).toBeNull()
            })

            it('should render the VoiceIntegrationOnboarding component on /new', () => {
                renderComponent(`${PHONE_INTEGRATION_BASE_URL}/new`)

                expect(
                    screen.getByText('VoiceIntegrationOnboarding'),
                ).toBeInTheDocument()
            })
        },
    )

    describe('integration context [FF off]', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(false)
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
    })

    describe('integration context', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        describe('with an integration that has a flow', () => {
            it('should render integration pages correctly', () => {
                useAppSelectorMock.mockReturnValue({
                    id: 1,
                    name: 'testing',
                    type: 'phone',
                    meta: {
                        function: 'standard',
                        flow: {
                            first_step_id: 'step-1',
                            steps: [],
                        },
                    },
                })

                renderComponent()

                expect(screen.queryByText('General')).toBeInTheDocument()
                expect(screen.queryByText('Call Flow')).toBeInTheDocument()
            })

            it('should render routes for IVR integration', () => {
                useAppSelectorMock.mockReturnValue({
                    id: 1,
                    name: 'testing',
                    type: 'phone',
                    meta: {
                        function: 'ivr',
                        flow: {
                            first_step_id: 'step-1',
                            steps: [],
                        },
                    },
                })

                renderComponent()

                // new routes should be rendered
                expect(screen.queryByText('General')).toBeInTheDocument()
                expect(screen.queryByText('Call Flow')).toBeInTheDocument()

                // old routes should not be rendered
                expect(screen.queryByText('Preferences')).toBeNull()
                expect(screen.queryByText('Voicemail')).toBeNull()
                expect(screen.queryByText('IVR')).toBeNull()
            })
        })

        describe('with an integration without a flow', () => {
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

                expect(screen.queryByText('General')).toBeNull()
                expect(screen.queryByText('Call Flow')).toBeNull()
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

                expect(screen.queryByText('General')).toBeNull()
                expect(screen.queryByText('Call Flow')).toBeNull()
            })
        })
    })
})
