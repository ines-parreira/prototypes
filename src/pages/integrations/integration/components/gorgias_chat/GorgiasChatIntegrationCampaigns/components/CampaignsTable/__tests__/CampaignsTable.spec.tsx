import React from 'react'
import {fromJS} from 'immutable'
import {screen, fireEvent, render, waitFor} from '@testing-library/react'

import {createTrigger} from '../../../utils/createTrigger'

import {ChatCampaign} from '../../../types/Campaign'
import {CampaignTriggerKey} from '../../../types/enums/CampaignTriggerKey.enum'

import {CampaignsTable} from '../CampaignsTable'

const data = Array.from({length: 19}, (_, i) => ({
    id: i,
    name: `campaign ${i}`,
    triggers: [createTrigger(CampaignTriggerKey.BusinessHours)],
    message: {
        text: `campaign message ${i}`,
        html: `campaign message ${i}`,
    },
})) as unknown[] as ChatCampaign[]

const integration = fromJS({
    id: '1',
})
describe('<CampaignsTable />', () => {
    it('renders the `perPage` items', () => {
        const onClickDelete = jest.fn()
        const onClickDuplicate = jest.fn()
        const onToggleCampaign = jest.fn()

        const {container} = render(
            <CampaignsTable
                data={data}
                perPage={10}
                integration={integration}
                onClickDelete={onClickDelete}
                onClickDuplicate={onClickDuplicate}
                onToggleCampaign={onToggleCampaign}
            />
        )

        const rows = container.querySelectorAll('tr')

        expect(rows.length).toEqual(11) // 10 campaign rows + header row
    })

    it('renders the `perPage` items with offset', () => {
        const onClickDelete = jest.fn()
        const onClickDuplicate = jest.fn()
        const onToggleCampaign = jest.fn()

        const {container, getByText} = render(
            <CampaignsTable
                data={data}
                perPage={10}
                integration={integration}
                onClickDelete={onClickDelete}
                onClickDuplicate={onClickDuplicate}
                onToggleCampaign={onToggleCampaign}
            />
        )

        const firstPage = container.querySelectorAll('tr')
        expect(firstPage.length).toEqual(11) // 10 campaign rows + header row

        getByText('keyboard_arrow_right').click()

        const secondPage = container.querySelectorAll('tr')
        expect(secondPage.length).toEqual(10) // 9 campaign rows + header row
    })

    it('shows the preview tooltip if merchant is part of revenue beta', async () => {
        const onClickDelete = jest.fn()
        const onClickDuplicate = jest.fn()
        const onToggleCampaign = jest.fn()

        render(
            <CampaignsTable
                data={[data[0]]}
                perPage={10}
                integration={integration}
                onClickDelete={onClickDelete}
                onClickDuplicate={onClickDuplicate}
                onToggleCampaign={onToggleCampaign}
            />
        )

        fireEvent.mouseOver(screen.getByText('campaign 0'))

        await waitFor(() => {
            expect(screen.getByText(data[0].message.text)).toBeInTheDocument()
            expect(screen.getByText('Business hours')).toBeInTheDocument()
        })
    })
})
