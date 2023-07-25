import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {ChatCampaign} from '../../../types/Campaign'

import {CampaignsTable} from '../CampaignsTable'

const data = Array.from({length: 19}, (_, i) => ({
    id: i,
    name: `campaign ${i}`,
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
})
