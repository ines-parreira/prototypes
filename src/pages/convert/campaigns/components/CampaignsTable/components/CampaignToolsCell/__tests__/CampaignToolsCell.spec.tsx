import {screen, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'

import * as useLocalStorage from 'hooks/useLocalStorage'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'

import {CampaignToolsCell} from '../CampaignToolsCell'

const useLocalStorageSpy = jest.spyOn(useLocalStorage, 'default') as jest.Mock

describe('<CampaignToolsCell />', () => {
    const onClickDelete = jest.fn()
    const onClickDuplicate = jest.fn()
    const onClickEdit = jest.fn()
    const campaign = {
        id: '1',
        name: 'test',
        is_light: false,
    } as Campaign
    const integration = fromJS({
        meta: {
            shop_type: 'shopify',
        },
    })

    const props = {
        campaign: campaign,
        integration: integration,
        createDisabled: false,
        isDeletingCampaign: false,
        isOverCampaignsLimit: false,
        onClickDelete: onClickDelete,
        onClickDuplicate: onClickDuplicate,
        onClickEdit: onClickEdit,
    }

    beforeEach(() => {
        useLocalStorageSpy.mockReturnValue([])
    })

    it('renders a delete and duplicate button, but not edit button', () => {
        render(<CampaignToolsCell {...props} />)

        screen.getByText('delete')
        screen.getByText('file_copy')
        expect(screen.queryByText('edit')).not.toBeInTheDocument()
    })

    it('renders a delete and edit button instead of duplicate button', () => {
        render(<CampaignToolsCell {...props} createDisabled={true} />)

        screen.getByText('delete')
        screen.getByText('edit')
        expect(screen.queryByText('file_copy')).not.toBeInTheDocument()
    })

    it('calls onClickDelete when delete button is clicked', () => {
        render(<CampaignToolsCell {...props} />)

        screen.getByLabelText('Delete campaign').click()
        screen.getByText('Confirm').click()

        expect(onClickDelete).toHaveBeenCalledWith(campaign)
    })

    it('calls onClickDuplicate when duplicate button is clicked', () => {
        render(<CampaignToolsCell {...props} />)

        screen.getByLabelText('Duplicate campaign').click()

        expect(onClickDuplicate).toHaveBeenCalledWith(
            expect.anything(),
            campaign
        )
    })

    it('renders only edit button and calls onClickEdit when button is clicked', () => {
        const lightCampaign = {
            ...campaign,
            is_light: true,
        }

        render(<CampaignToolsCell {...props} campaign={lightCampaign} />)

        expect(screen.queryByText('delete')).not.toBeInTheDocument()
        expect(screen.queryByText('file_copy')).not.toBeInTheDocument()

        screen.getByText('edit').click()

        expect(onClickEdit).toHaveBeenCalled()
    })

    it('renders delete button with light modal when over campaigns limit', () => {
        render(<CampaignToolsCell {...props} isOverCampaignsLimit={true} />)

        screen.getByLabelText('Delete campaign').click()

        expect(screen.getByText('Learn About Convert')).toBeInTheDocument()
    })

    it('renders delete button without light modal when over campaigns limit, but dismissed', () => {
        useLocalStorageSpy.mockReturnValue([true])

        render(<CampaignToolsCell {...props} isOverCampaignsLimit={true} />)

        screen.getByLabelText('Delete campaign').click()

        expect(
            screen.queryByText('Learn About Convert')
        ).not.toBeInTheDocument()
        expect(screen.getByText('Confirm')).toBeInTheDocument()
    })
})
