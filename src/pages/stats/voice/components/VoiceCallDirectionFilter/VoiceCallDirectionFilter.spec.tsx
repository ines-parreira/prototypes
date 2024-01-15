import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {VoiceCallFilterOptions} from 'pages/stats/voice/models/types'
import {
    ALL_CALLS_FILTER_LABEL,
    INBOUND_CALLS_FILTER_LABEL,
    OUTBOUND_CALLS_FILTER_LABEL,
} from 'pages/stats/voice/constants/voiceOverview'
import VoiceCallDirectionFilter from './VoiceCallDirectionFilter'

describe('VoiceCallDirectionFilter', () => {
    it('should render', () => {
        const mockFilterSelect = jest.fn()
        const {getByText, getAllByText} = render(
            <VoiceCallDirectionFilter onFilterSelect={mockFilterSelect} />
        )
        expect(getAllByText(ALL_CALLS_FILTER_LABEL)).toHaveLength(2)
        expect(getByText(INBOUND_CALLS_FILTER_LABEL)).toBeInTheDocument()
        expect(getByText(OUTBOUND_CALLS_FILTER_LABEL)).toBeInTheDocument()
    })

    it('should change selector', () => {
        const mockFilterSelect = jest.fn()
        const {getByText, getAllByText} = render(
            <VoiceCallDirectionFilter onFilterSelect={mockFilterSelect} />
        )
        fireEvent.click(getAllByText(ALL_CALLS_FILTER_LABEL)[0])
        fireEvent.click(getByText(INBOUND_CALLS_FILTER_LABEL))

        expect(mockFilterSelect).toHaveBeenCalledWith(
            VoiceCallFilterOptions.Inbound
        )
        expect(getAllByText(INBOUND_CALLS_FILTER_LABEL)).toHaveLength(2)
    })
})
