import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { FormField } from 'core/forms'
import { assumeMock } from 'utils/testing'

import VoiceIntegrationPreferencesTranscription from '../VoiceIntegrationPreferencesTranscription'

jest.mock('core/forms')
const FormFieldMock = assumeMock(FormField)

describe('<VoiceIntegrationPreferencesTranscription />', () => {
    beforeEach(() => {
        FormFieldMock.mockImplementation(({ children }: any) => (
            <div>{children}</div>
        ))
    })

    const renderComponent = (): RenderResult => {
        return render(<VoiceIntegrationPreferencesTranscription />)
    }

    it('should render transcription preferences with summary', () => {
        const { getByText } = renderComponent()

        expect(getByText('Transcription')).toBeInTheDocument()
        expect(getByText('Call recording transcription')).toBeInTheDocument()
        expect(getByText('Voicemail transcription')).toBeInTheDocument()
        expect(
            getByText(
                'Automatically transcribes and summarizes recorded calls and/or voicemails for quick reference and easy follow-up. Transcriptions are generated for English, French, German and Spanish, summaries are only generated in English.',
            ),
        ).toBeInTheDocument()
    })
})
