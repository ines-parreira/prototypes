import React from 'react'

import { render } from '@testing-library/react'

import { NOT_AVAILABLE_PLACEHOLDER } from 'domains/reporting/pages/common/utils'
import VoiceCallVolumeMetricEmpty from 'domains/reporting/pages/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetricEmpty'

describe('<VoiceCallVolumeMetricEmpty />', () => {
    it('should render', () => {
        const { getByText } = render(
            <VoiceCallVolumeMetricEmpty
                title={'Total calls'}
                hint={'Total number of inbound and outbound calls'}
            />,
        )

        expect(getByText('Total calls')).toBeInTheDocument()
        expect(getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })
})
