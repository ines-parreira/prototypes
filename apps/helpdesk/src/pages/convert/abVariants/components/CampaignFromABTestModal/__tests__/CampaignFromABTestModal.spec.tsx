import React from 'react'

import { act, waitFor } from '@testing-library/react'

import { campaign, campaignVariant } from 'fixtures/campaign'
import { channelConnection } from 'fixtures/channelConnection'
import { useCreateCampaign } from 'pages/convert/campaigns/hooks/useCreateCampaign'
import { Campaign } from 'pages/convert/campaigns/types/Campaign'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import history from 'pages/history'
import { assumeMock, renderWithStore } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

import CampaignFromABTestModal from '../CampaignFromABTestModal'

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection,
)
jest.mock('pages/convert/campaigns/hooks/useCreateCampaign')
const useCreateCampaignMock = assumeMock(useCreateCampaign)

describe('<CampaignFromABTestModal />', () => {
    const onClose = jest.fn()
    const createMock = jest.fn()

    beforeEach(() => {
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)
        useCreateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: createMock,
            } as unknown as ReturnType<typeof useCreateCampaign>
        })
    })

    it('renders', () => {
        const { getByText } = renderWithStore(
            <CampaignFromABTestModal
                isOpen={true}
                campaign={campaign as Campaign}
                integrationId={1}
                onClose={onClose}
            />,
            {},
        )

        expect(getByText('Create new campaign')).toBeInTheDocument()
        expect(getByText('Control Variant')).toBeInTheDocument()
        expect(getByText('Variant A')).toBeInTheDocument()
    })

    it('user selected `control variant`', async () => {
        const historySpy = jest.spyOn(history, 'push')

        const { getByText, getByRole } = renderWithStore(
            <CampaignFromABTestModal
                isOpen={true}
                campaign={campaign as Campaign}
                integrationId={1}
                onClose={onClose}
            />,
            {},
        )

        act(() => {
            userEvent.click(getByText('Control Variant'))
        })

        userEvent.click(getByRole('button', { name: 'Create Campaign' }))

        expect(createMock).toHaveBeenCalledWith([
            undefined,
            expect.objectContaining({
                message_html: campaign.message_html,
                message_text: campaign.message_text,
            }),
        ])

        // Ensure redirection happens
        await waitFor(() => {
            expect(historySpy.mock.calls.length).toEqual(1)
        })
    })

    it('user selected variant', async () => {
        const historySpy = jest.spyOn(history, 'push')

        const { getByText, getByRole } = renderWithStore(
            <CampaignFromABTestModal
                isOpen={true}
                campaign={campaign as Campaign}
                integrationId={1}
                onClose={onClose}
            />,
            {},
        )

        act(() => {
            userEvent.click(getByText('Variant A'))
        })

        userEvent.click(getByRole('button', { name: 'Create Campaign' }))

        expect(createMock).toHaveBeenCalledWith([
            undefined,
            expect.objectContaining({
                message_html: campaignVariant.message_html,
                message_text: campaignVariant.message_text,
            }),
        ])

        // Ensure redirection happens
        await waitFor(() => {
            expect(historySpy.mock.calls.length).toEqual(1)
        })
    })
})
