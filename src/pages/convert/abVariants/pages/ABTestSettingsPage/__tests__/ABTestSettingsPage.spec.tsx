import React from 'react'
import {render} from '@testing-library/react'

import {campaignWithABGroup} from 'fixtures/abGroup'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'

import ABTestSettingPage from '../ABTestSettingsPage'

jest.mock('hooks/useGetDateAndTimeFormat')

const mockUseGetDateAndTimeFormat = jest.mocked(useGetDateAndTimeFormat)

mockUseGetDateAndTimeFormat.mockReturnValue('MM/DD/YYYY')

describe('<ABTestSettingPage />', () => {
    it('renders', () => {
        const {getByText} = render(
            <ABTestSettingPage
                canCreateDeleteObjects={true}
                campaign={campaignWithABGroup as Campaign}
                integrationId="4"
                onDelete={jest.fn()}
                onDuplicate={jest.fn()}
            />
        )
        expect(getByText('Back to Campaigns list')).toBeInTheDocument()
    })
})
