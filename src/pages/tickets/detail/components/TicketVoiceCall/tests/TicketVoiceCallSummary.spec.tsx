import {render} from '@testing-library/react'
import React from 'react'

import {VoiceCallSummary} from 'models/voiceCall/types'

import TicketVoiceCallSummary from '../TicketVoiceCallSummary'

describe('TicketVoiceCallSummary', () => {
    const renderSummary = (summaries: VoiceCallSummary[]) => {
        return render(<TicketVoiceCallSummary summaries={summaries} />)
    }

    it("should render nothing if there's no summaries", () => {
        const {container} = renderSummary([])

        expect(container).toBeEmptyDOMElement()
    })

    it("should render summaries if there's any", () => {
        const summaries: VoiceCallSummary[] = [
            {
                id: 1,
                summary: 'Summary 1',
                recording_id: 1,
                created_datetime: '2022-01-01T00:00:00.000Z',
            },
            {
                id: 2,
                summary: 'Summary 2',
                recording_id: 2,
                created_datetime: '2022-01-02T00:00:00.000Z',
            },
        ]
        const {getByText} = renderSummary(summaries)

        expect(getByText('Call Summary')).toBeInTheDocument()
        expect(getByText('Summary 1')).toBeInTheDocument()
        expect(getByText('Summary 2')).toBeInTheDocument()
    })
})
