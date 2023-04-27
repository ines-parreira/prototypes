import React from 'react'
import {render} from '@testing-library/react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import {CampaignPreferences} from '../CampaignPreferences'

jest.mock('launchdarkly-react-client-sdk')

describe('CampaignPreferences', () => {
    it('should render correctly', () => {
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.CampaignWithNoReply]: true,
        })

        const {getByText} = render(
            <CampaignPreferences
                isNoReply={false}
                triggers={{}}
                onChangeCollision={jest.fn()}
                onChangeNoReply={jest.fn()}
            />
        )

        expect(getByText('Campaign preferences')).toBeInTheDocument()

        expect(
            getByText('Customers can reply to this campaign')
        ).toBeInTheDocument()
        expect(getByText('Show this campaign individually')).toBeInTheDocument()
    })

    it('should render CampaignWithNoReply when flag is enabled', () => {
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.CampaignWithNoReply]: true,
        })

        const {getByText} = render(
            <CampaignPreferences
                isNoReply={false}
                triggers={{}}
                onChangeCollision={jest.fn()}
                onChangeNoReply={jest.fn()}
            />
        )

        expect(
            getByText('Customers can reply to this campaign')
        ).toBeInTheDocument()
    })

    it('should not render CampaignWithNoReply when flag is disabled', () => {
        ;(useFlags as jest.Mock).mockReturnValue({
            [FeatureFlagKey.CampaignWithNoReply]: false,
        })

        const {queryByText} = render(
            <CampaignPreferences
                isNoReply={false}
                triggers={{}}
                onChangeCollision={jest.fn()}
                onChangeNoReply={jest.fn()}
            />
        )

        expect(
            queryByText('Customers can reply to this campaign')
        ).not.toBeInTheDocument()
    })
})
