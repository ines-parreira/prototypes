import { assumeMock } from '@repo/testing'
import { Call, Device } from '@twilio/voice-sdk'
import MockAdapter from 'axios-mock-adapter'

import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import client from 'models/api/resources'
import { VoiceDeviceContextState } from 'pages/integrations/integration/components/voice/VoiceDeviceContext'
import { initialState } from 'state/twilio/voiceDevice'
import {
    mockDevice,
    mockIncomingCall,
    mockMonitoringCall,
    mockOutgoingCall,
} from 'tests/twilioMocks'
import { renderWithRouter } from 'utils/testing'

import PhoneIntegrationCallBar from '../PhoneIntegrationCallBar'

jest.mock('@twilio/voice-sdk')
jest.mock('hooks/useConditionalShortcuts')

jest.mock('../OngoingPhoneCall/OngoingPhoneCall', () => () => (
    <div data-testid="ongoing-phone-call" />
))

jest.mock('../IncomingPhoneCall/IncomingPhoneCall', () => () => (
    <div data-testid="incoming-phone-call" />
))

jest.mock('../OutgoingPhoneCall/OutgoingPhoneCall', () => () => (
    <div data-testid="outgoing-phone-call" />
))

jest.mock('../MonitoringPhoneCall/MonitoringPhoneCall', () => () => (
    <div data-testid="monitoring-phone-call" />
))

jest.mock('hooks/integrations/phone/useVoiceDevice')

const useVoiceDeviceMock = assumeMock(useVoiceDevice)
const useConditionalShortcutsMock = assumeMock(useConditionalShortcuts)

describe('<PhoneIntegrationCallBar/>', () => {
    const mockedServer = new MockAdapter(client)

    beforeEach(() => {
        window.location.protocol = 'https:'
        jest.resetAllMocks()
        mockedServer.reset()
    })

    it('should bind shortcuts when there is a call', () => {
        useVoiceDeviceMock.mockReturnValue({
            ...initialState,
            call: mockIncomingCall() as Call,
        } as VoiceDeviceContextState)

        renderWithRouter(<PhoneIntegrationCallBar />)

        expect(useConditionalShortcutsMock).toHaveBeenCalledWith(
            true,
            'PhoneCall',
            {
                ACCEPT_CALL: {
                    action: expect.any(Function),
                },
            },
        )
    })

    it('should not bind shortcuts when there is no call', () => {
        useVoiceDeviceMock.mockReturnValue({
            ...initialState,
            call: null,
        } as VoiceDeviceContextState)

        renderWithRouter(<PhoneIntegrationCallBar />)

        expect(useConditionalShortcutsMock).toHaveBeenCalledWith(
            false,
            'PhoneCall',
            {
                ACCEPT_CALL: {
                    action: expect.any(Function),
                },
            },
        )
    })

    it('should render ringing call bar because there is an incoming call', async () => {
        const device = mockDevice() as Device
        const call = mockIncomingCall() as Call
        useVoiceDeviceMock.mockReturnValue({
            ...initialState,
            device,
            call,
            isRinging: true,
        } as VoiceDeviceContextState)
        const { findByTestId } = renderWithRouter(<PhoneIntegrationCallBar />)
        expect(await findByTestId('incoming-phone-call')).toBeTruthy()

        useConditionalShortcutsMock.mock.calls[0][2].ACCEPT_CALL.action?.({
            preventDefault: jest.fn(),
        } as any)
        expect(call.accept).toHaveBeenCalled()
    })

    it('should render outgoing call bar because there is an outgoing call', async () => {
        const device = mockDevice() as Device
        const call = mockOutgoingCall() as Call
        useVoiceDeviceMock.mockReturnValue({
            ...initialState,
            device,
            call,
            isDialing: true,
        } as VoiceDeviceContextState)

        const { findByTestId } = renderWithRouter(<PhoneIntegrationCallBar />)

        expect(await findByTestId('outgoing-phone-call')).toBeTruthy()
    })

    it('should render ongoing call bar because there is an ongoing call', async () => {
        const device = mockDevice() as Device
        const call = mockIncomingCall() as Call
        useVoiceDeviceMock.mockReturnValue({
            ...initialState,
            device,
            call,
            isRinging: false,
        } as VoiceDeviceContextState)

        const { findByTestId } = renderWithRouter(<PhoneIntegrationCallBar />)

        expect(await findByTestId('ongoing-phone-call')).toBeTruthy()
    })

    it('should render monitoring call bar when is_monitoring parameter is true', async () => {
        const device = mockDevice() as Device
        const call = mockMonitoringCall() as Call
        useVoiceDeviceMock.mockReturnValue({
            ...initialState,
            device,
            call,
        } as VoiceDeviceContextState)

        const { findByTestId } = renderWithRouter(<PhoneIntegrationCallBar />)

        expect(await findByTestId('monitoring-phone-call')).toBeTruthy()
    })
})
