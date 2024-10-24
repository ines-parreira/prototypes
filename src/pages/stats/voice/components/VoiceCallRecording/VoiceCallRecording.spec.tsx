import {fireEvent, render} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {VoiceCallSummary} from 'pages/stats/voice/models/types'
import {RootState, StoreDispatch} from 'state/types'

import VoiceCallRecording from './VoiceCallRecording'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('VoiceCallRecording', () => {
    const renderComponent = (
        props: ComponentProps<typeof VoiceCallRecording>
    ) => {
        return render(
            <Provider store={mockStore({})}>
                <VoiceCallRecording {...props} />
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
        const {getByRole, getByTestId} = renderComponent({voiceCall})

        expect(getByRole('button', {name: 'play_arrow'})).toBeInTheDocument()
        expect(getByRole('button', {name: 'download'})).toBeInTheDocument()

        fireEvent.click(getByRole('button', {name: 'play_arrow'}))
        expect(getByTestId('audio-player')).toBeInTheDocument()
    })

    it('should not render download button when isDownloadable is false', () => {
        const {queryByRole} = renderComponent({
            voiceCall: {
                callRecordingUrl: 'https://www.google.com',
                callRecordingAvailable: true,
            } as VoiceCallSummary,
            isDownloadable: false,
        })

        expect(queryByRole('button', {name: 'download'})).toBeNull()
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
        const {getByText} = renderComponent({voiceCall})

        expect(getByText('-')).toBeInTheDocument()
    })
})
