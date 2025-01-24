import {render, RenderResult} from '@testing-library/react'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import React from 'react'

import FormField from 'components/Form/FormField'
import {FeatureFlagKey} from 'config/featureFlags'
import {assumeMock} from 'utils/testing'

import VoiceIntegrationPreferencesTranscription from '../VoiceIntegrationPreferencesTranscription'

jest.mock('components/Form/FormField')
const FormFieldMock = assumeMock(FormField)

describe('<VoiceIntegrationPreferencesTranscription />', () => {
    beforeEach(() => {
        FormFieldMock.mockImplementation(({children}: any) => (
            <div>{children}</div>
        ))
    })

    const renderComponent = (): RenderResult => {
        return render(<VoiceIntegrationPreferencesTranscription />)
    }

    beforeEach(() => {
        resetLDMocks()
        mockFlags({[FeatureFlagKey.SummarizeCalls]: false})
    })

    it('should render transcription preferences', () => {
        const {getByText} = renderComponent()

        expect(getByText('Transcription')).toBeInTheDocument()
        expect(getByText('Call recording transcription')).toBeInTheDocument()
        expect(getByText('Voicemail transcription')).toBeInTheDocument()
        expect(
            getByText(
                'Use speech-to-text to transcribe all recorded calls and/or voicemails'
            )
        ).toBeInTheDocument()
    })

    it('should render transcription preferences with summary', () => {
        mockFlags({[FeatureFlagKey.SummarizeCalls]: true})
        const {getByText} = renderComponent()

        expect(getByText('Transcription')).toBeInTheDocument()
        expect(
            getByText(
                'Automatically transcribes and summarizes recorded calls and/or voicemails for quick reference and easy follow-up. Transcriptions are generated for English, French, German and Spanish, summaries are only generated in English.'
            )
        ).toBeInTheDocument()
    })
})
