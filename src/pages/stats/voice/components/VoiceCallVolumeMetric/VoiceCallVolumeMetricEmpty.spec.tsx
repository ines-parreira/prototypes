import React from 'react'

import { render } from '@testing-library/react'

import { NOT_AVAILABLE_PLACEHOLDER } from 'pages/stats/common/utils'

import VoiceCallVolumeMetricEmpty from './VoiceCallVolumeMetricEmpty'

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
