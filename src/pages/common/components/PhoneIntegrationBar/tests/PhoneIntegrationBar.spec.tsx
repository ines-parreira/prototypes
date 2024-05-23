import React from 'react'
import MockAdapter from 'axios-mock-adapter'
import {Call, Device} from '@twilio/voice-sdk'

import {mockIncomingCall, mockDevice, mockOutgoingCall} from 'tests/twilioMocks'
import {initialState} from 'state/twilio/voiceDevice'
import client from 'models/api/resources'
import {assumeMock, renderWithRouter} from 'utils/testing'
import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import {VoiceDeviceContextState} from 'pages/integrations/integration/components/voice/VoiceDeviceContext'
import PhoneIntegrationBar from '../PhoneIntegrationBar'

jest.mock('@twilio/voice-sdk')

jest.mock('../OngoingPhoneCall/OngoingPhoneCall', () => () => (
    <div data-testid="ongoing-phone-call" />
))

jest.mock('../IncomingPhoneCall/IncomingPhoneCall', () => () => (
    <div data-testid="incoming-phone-call" />
))

jest.mock('../OutgoingPhoneCall/OutgoingPhoneCall', () => () => (
    <div data-testid="outgoing-phone-call" />
))

jest.mock('hooks/integrations/phone/useVoiceDevice')

const useVoiceDeviceMock = assumeMock(useVoiceDevice)

describe('<PhoneIntegrationBar/>', () => {
    const mockedServer = new MockAdapter(client)

    beforeEach(() => {
        window.location.protocol = 'https:'
        jest.resetAllMocks()
        mockedServer.reset()
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
        const {findByTestId} = renderWithRouter(<PhoneIntegrationBar />)
        expect(await findByTestId('incoming-phone-call')).toBeTruthy()
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

        const {findByTestId} = renderWithRouter(<PhoneIntegrationBar />)

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

        const {findByTestId} = renderWithRouter(<PhoneIntegrationBar />)

        expect(await findByTestId('ongoing-phone-call')).toBeTruthy()
    })
})
