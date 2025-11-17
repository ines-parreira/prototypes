import React from 'react'

import { act, fireEvent, render, waitFor } from '@testing-library/react'

import type { CampaignFrequencySettings } from 'pages/convert/settings/types'

import { CampaignFrequencySetting } from '../CampaignFrequencySetting'

describe('<CampaignFrequencySetting />', () => {
    const defaultProps = {
        campaignFrequencySettings: {},
        onSettingsChange: jest.fn(),
    }

    it('should render', () => {
        const { getByText } = render(
            <CampaignFrequencySetting {...defaultProps} />,
        )
        expect(getByText('Frequency Settings')).toBeInTheDocument()
    })

    it('user can toggle', async () => {
        const onSettingsChangeMock = jest.fn()
        const { container } = render(
            <CampaignFrequencySetting
                {...defaultProps}
                onSettingsChange={onSettingsChangeMock}
            />,
        )

        act(() => {
            fireEvent.click(
                container.querySelector(
                    '#maximum-displayed-campaigns',
                ) as Element,
            )
            fireEvent.click(
                container.querySelector('#time-between-campaigns') as Element,
            )
        })

        await waitFor(() => {
            expect(onSettingsChangeMock).toHaveBeenCalledWith({
                max_campaign_in_session: { value: 8 },
            })
            expect(onSettingsChangeMock).toHaveBeenCalledWith({
                min_time_between_campaigns: { unit: 'seconds', value: 30 },
            })
        })
    })

    it('user can toggle off', async () => {
        const onSettingsChangeMock = jest.fn()

        const props = {
            ...defaultProps,
            campaignFrequencySettings: {
                max_campaign_in_session: {
                    value: 20,
                },
                min_time_between_campaigns: {
                    value: 10,
                    unit: 'seconds',
                },
            } as CampaignFrequencySettings,
        }

        const { container } = render(
            <CampaignFrequencySetting
                {...props}
                onSettingsChange={onSettingsChangeMock}
            />,
        )

        act(() => {
            fireEvent.click(
                container.querySelector(
                    '#maximum-displayed-campaigns',
                ) as Element,
            )
        })

        await waitFor(() => {
            expect(onSettingsChangeMock).toHaveBeenCalledWith({
                max_campaign_in_session: null,
                min_time_between_campaigns: { value: 10, unit: 'seconds' },
            })
        })
    })
})
