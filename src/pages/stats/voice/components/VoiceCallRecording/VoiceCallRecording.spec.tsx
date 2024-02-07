import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {fireEvent, render} from '@testing-library/react'
import {RootState, StoreDispatch} from 'state/types'
import {VoiceCallSummary} from 'pages/stats/voice/models/types'
import VoiceCallRecording from './VoiceCallRecording'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('VoiceCallRecording', () => {
    const renderComponent = (voiceCall: VoiceCallSummary) => {
        return render(
            <Provider store={mockStore({})}>
                <VoiceCallRecording voiceCall={voiceCall} />
            </Provider>
        )
    }

    it.each([
        {
            callRecordingUrl: 'https://www.google.com',
            callRecordingAvailable: true,
            voicemailUrl: null,
            voicemailAvailable: null,
        } as VoiceCallSummary,
        {
            callRecordingUrl: null,
            callRecordingAvailable: null,
            voicemailUrl: 'https://www.google.com',
            voicemailAvailable: true,
        } as VoiceCallSummary,
    ])('should render recording buttons', (voiceCall) => {
        const {getByRole, getByTestId} = renderComponent(voiceCall)

        expect(getByRole('button', {name: 'play_arrow'})).toBeInTheDocument()
        expect(getByRole('button', {name: 'download'})).toBeInTheDocument()

        fireEvent.click(getByRole('button', {name: 'play_arrow'}))
        expect(getByTestId('audio-player')).toBeInTheDocument()
    })

    it.each([
        {
            callRecordingUrl: 'https://www.google.com',
            callRecordingAvailable: false,
            voicemailUrl: null,
            voicemailAvailable: null,
        } as VoiceCallSummary,
        {
            callRecordingUrl: null,
            callRecordingAvailable: null,
            voicemailUrl: 'https://www.google.com',
            voicemailAvailable: false,
        } as VoiceCallSummary,
    ])('should render deleted recording', (voiceCall) => {
        const {getByText} = renderComponent(voiceCall)

        expect(getByText('-')).toBeInTheDocument()
    })
})
