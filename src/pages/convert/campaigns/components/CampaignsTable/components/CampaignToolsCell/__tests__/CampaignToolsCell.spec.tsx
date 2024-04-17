import React from 'react'
import {screen, render} from '@testing-library/react'

import {fromJS} from 'immutable'
import * as useAreConvertLightCampaignsEnabled from 'pages/convert/common/hooks/useAreConvertLightCampaignsEnabled'
import * as useLocalStorage from 'hooks/useLocalStorage'
import {Campaign} from '../../../../../types/Campaign'

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
        jest.spyOn(
            useAreConvertLightCampaignsEnabled,
            'useAreConvertLightCampaignsEnabled'
        ).mockImplementation(() => true)
        useLocalStorageSpy.mockReturnValue([])
    })

    it('renders a delete and duplicate button, but not edit button', () => {
        const {getByText, queryByText} = render(
            <CampaignToolsCell {...props} />
        )

        getByText('delete')
        getByText('file_copy')
        expect(queryByText('edit')).not.toBeInTheDocument()
    })

    it('renders a delete and edit button instead of duplicate button', () => {
        const {getByText, queryByText} = render(
            <CampaignToolsCell {...props} createDisabled={true} />
        )

        getByText('delete')
        getByText('edit')
        expect(queryByText('file_copy')).not.toBeInTheDocument()
    })

    it('calls onClickDelete when delete button is clicked', () => {
        const {getByTestId} = render(<CampaignToolsCell {...props} />)

        getByTestId('delete-icon-button').click()

        screen.getByText('Confirm').click()

        expect(onClickDelete).toHaveBeenCalledWith(campaign)
    })

    it('calls onClickDuplicate when duplicate button is clicked', () => {
        const {getByTestId} = render(<CampaignToolsCell {...props} />)

        getByTestId('duplicate-icon-button').click()

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

        const {getByText, queryByText} = render(
            <CampaignToolsCell {...props} campaign={lightCampaign} />
        )

        expect(queryByText('delete')).not.toBeInTheDocument()
        expect(queryByText('file_copy')).not.toBeInTheDocument()

        getByText('edit').click()

        expect(onClickEdit).toHaveBeenCalled()
    })

    it('renders delete button with light modal when over campaigns limit', () => {
        const {getByTestId, getByText} = render(
            <CampaignToolsCell {...props} isOverCampaignsLimit={true} />
        )

        getByTestId('delete-icon-button').click()

        expect(getByText('Learn About Convert')).toBeInTheDocument()
    })

    it('renders delete button without light modal when over campaigns limit, but dismissed', () => {
        useLocalStorageSpy.mockReturnValue([true])

        const {getByTestId, queryByText, getByText} = render(
            <CampaignToolsCell {...props} isOverCampaignsLimit={true} />
        )

        getByTestId('delete-icon-button').click()

        expect(queryByText('Learn About Convert')).not.toBeInTheDocument()
        expect(getByText('Confirm')).toBeInTheDocument()
    })
})
