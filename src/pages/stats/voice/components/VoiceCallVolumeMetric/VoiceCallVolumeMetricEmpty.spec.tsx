import React from 'react'

import { render } from '@testing-library/react'

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
        expect(getByText('-')).toBeInTheDocument()
    })
})
