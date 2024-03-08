import React from 'react'
import {render} from '@testing-library/react'

import {CampaignPreferences} from '../CampaignPreferences'

jest.mock('launchdarkly-react-client-sdk')

describe('CampaignPreferences', () => {
    it('should render correctly', () => {
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
})
