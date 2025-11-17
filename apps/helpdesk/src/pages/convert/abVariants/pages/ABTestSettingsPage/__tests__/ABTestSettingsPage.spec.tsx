import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { campaignWithABGroup } from 'fixtures/abGroup'
import { channelConnection } from 'fixtures/channelConnection'
import { useCreateCampaign } from 'pages/convert/campaigns/hooks/useCreateCampaign'
import type { Campaign } from 'pages/convert/campaigns/types/Campaign'
import { ABGroupStatus } from 'pages/convert/campaigns/types/enums/ABGroupStatus.enum'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import { renderWithStore } from 'utils/testing'

import ABTestSettingPage from '../ABTestSettingsPage'

jest.mock('pages/convert/abVariants/components/VariantsList', () => () => (
    <div>Variant List</div>
))
jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection,
)
jest.mock('pages/convert/campaigns/hooks/useCreateCampaign')
const useCreateCampaignMock = assumeMock(useCreateCampaign)

jest.mock('hooks/useGetDateAndTimeFormat')

describe('<ABTestSettingPage />', () => {
    it('renders', () => {
        const { getByText } = render(
            <MemoryRouter>
                <ABTestSettingPage
                    canCreateDeleteObjects={true}
                    campaign={campaignWithABGroup as Campaign}
                    integrationId={4}
                    onDelete={jest.fn()}
                    onDuplicate={jest.fn()}
                />
            </MemoryRouter>,
        )
        expect(getByText('Back to Campaigns list')).toBeInTheDocument()
    })
    it('renders create campaign button', () => {
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)
        useCreateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: jest.fn(),
            } as unknown as ReturnType<typeof useCreateCampaign>
        })

        const { getByText } = renderWithStore(
            <MemoryRouter>
                <ABTestSettingPage
                    canCreateDeleteObjects={true}
                    campaign={
                        {
                            ...campaignWithABGroup,
                            ab_group: {
                                ...campaignWithABGroup.ab_group,
                                status: ABGroupStatus.Completed,
                            },
                        } as Campaign
                    }
                    integrationId={4}
                    onDelete={jest.fn()}
                    onDuplicate={jest.fn()}
                />
            </MemoryRouter>,
            {},
        )
        expect(getByText('New Campaign From Winner')).toBeInTheDocument()
    })
})
