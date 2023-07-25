import React from 'react'
import {screen, render} from '@testing-library/react'

import {ChatCampaign} from '../../../../../types/Campaign'

import {CampaignToolsCell} from '../CampaignToolsCell'

describe('<CampaignToolsCell />', () => {
    it('renders a delete and duplicate button', () => {
        const onClickDelete = jest.fn()
        const onClickDuplicate = jest.fn()
        const campaign = {
            id: '1',
            name: 'test',
        } as ChatCampaign
        const {getByText} = render(
            <CampaignToolsCell
                campaign={campaign}
                onClickDelete={onClickDelete}
                onClickDuplicate={onClickDuplicate}
            />
        )

        getByText('delete')
        getByText('file_copy')
    })

    it('calls onClickDelete when delete button is clicked', () => {
        const onClickDelete = jest.fn()
        const onClickDuplicate = jest.fn()
        const campaign = {
            id: '1',
            name: 'test',
        } as ChatCampaign
        const {getByTestId} = render(
            <CampaignToolsCell
                campaign={campaign}
                onClickDelete={onClickDelete}
                onClickDuplicate={onClickDuplicate}
            />
        )

        getByTestId('delete-icon-button').click()

        screen.getByText('Confirm').click()

        expect(onClickDelete).toHaveBeenCalledWith(campaign)
    })

    it('calls onClickDuplicate when duplicate button is clicked', () => {
        const onClickDelete = jest.fn()
        const onClickDuplicate = jest.fn()
        const campaign = {
            id: '1',
            name: 'test',
        } as ChatCampaign
        const {getByTestId} = render(
            <CampaignToolsCell
                campaign={campaign}
                onClickDelete={onClickDelete}
                onClickDuplicate={onClickDuplicate}
            />
        )

        getByTestId('duplicate-icon-button').click()

        expect(onClickDuplicate).toHaveBeenCalledWith(
            expect.anything(),
            campaign
        )
    })
})
