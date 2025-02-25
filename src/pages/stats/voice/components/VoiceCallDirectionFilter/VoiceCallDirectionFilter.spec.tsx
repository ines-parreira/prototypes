import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import {
    ALL_CALLS_FILTER_LABEL,
    INBOUND_CALLS_FILTER_LABEL,
    MISSED_CALLS_FILTER_LABEL,
    OUTBOUND_CALLS_FILTER_LABEL,
} from 'pages/stats/voice/constants/voiceOverview'
import { VoiceCallFilterOptions } from 'pages/stats/voice/models/types'

import VoiceCallDirectionFilter from './VoiceCallDirectionFilter'

describe('VoiceCallDirectionFilter', () => {
    it('should render', () => {
        const mockFilterSelect = jest.fn()
        const { getByText, getAllByText } = render(
            <VoiceCallDirectionFilter onFilterSelect={mockFilterSelect} />,
        )
        expect(getAllByText(ALL_CALLS_FILTER_LABEL)).toHaveLength(2)
        expect(getByText(INBOUND_CALLS_FILTER_LABEL)).toBeInTheDocument()
        expect(getByText(OUTBOUND_CALLS_FILTER_LABEL)).toBeInTheDocument()
        expect(getByText(MISSED_CALLS_FILTER_LABEL)).toBeInTheDocument()
    })

    it.each([
        {
            label: INBOUND_CALLS_FILTER_LABEL,
            value: VoiceCallFilterOptions.Inbound,
        },
        {
            label: OUTBOUND_CALLS_FILTER_LABEL,
            value: VoiceCallFilterOptions.Outbound,
        },
        {
            label: MISSED_CALLS_FILTER_LABEL,
            value: VoiceCallFilterOptions.Missed,
        },
    ])('should change selector', (filter) => {
        const mockFilterSelect = jest.fn()
        const { getByText, getAllByText } = render(
            <VoiceCallDirectionFilter onFilterSelect={mockFilterSelect} />,
        )
        fireEvent.click(getAllByText(ALL_CALLS_FILTER_LABEL)[0])
        fireEvent.click(getByText(filter.label))

        expect(mockFilterSelect).toHaveBeenCalledWith(filter.value)
        expect(getAllByText(filter.label)).toHaveLength(2)
    })
})
