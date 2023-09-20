import React from 'react'
import {fromJS} from 'immutable'
import {screen, fireEvent, render, waitFor} from '@testing-library/react'

import useSearch from 'hooks/useSearch'

import {createTrigger} from '../../../utils/createTrigger'

import {ChatCampaign} from '../../../types/Campaign'
import {CampaignTriggerKey} from '../../../types/enums/CampaignTriggerKey.enum'

import {CampaignsTable} from '../CampaignsTable'

jest.mock('hooks/useSearch')

const data = Array.from({length: 19}, (_, i) => ({
    id: i,
    name: `campaign ${i}`,
    language: 'en-US',
    triggers: [createTrigger(CampaignTriggerKey.BusinessHours)],
    message: {
        text: `campaign message ${i}`,
        html: `campaign message ${i}`,
    },
})) as unknown[] as ChatCampaign[]

const integration = fromJS({
    id: '1',
    meta: {
        languages: [{language: 'en-US', primary: true}],
    },
})
describe('<CampaignsTable />', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: {
                search: '',
            },
        })
        ;(useSearch as jest.Mock).mockImplementation(() => ({}))
    })

    it('renders the `perPage` items', () => {
        const onClickDelete = jest.fn()
        const onClickDuplicate = jest.fn()
        const onToggleCampaign = jest.fn()
        const onChangePage = jest.fn()

        const {container} = render(
            <CampaignsTable
                data={data}
                page={1}
                perPage={10}
                integration={integration}
                onClickDelete={onClickDelete}
                onClickDuplicate={onClickDuplicate}
                onToggleCampaign={onToggleCampaign}
                onChangePage={onChangePage}
            />
        )

        const rows = container.querySelectorAll('tr')

        expect(rows.length).toEqual(11) // 10 campaign rows + header row
    })

    it('renders the `perPage` items with offset', () => {
        const onClickDelete = jest.fn()
        const onClickDuplicate = jest.fn()
        const onToggleCampaign = jest.fn()
        const onChangePage = jest.fn()

        const {container, rerender} = render(
            <CampaignsTable
                data={data}
                page={1}
                perPage={10}
                integration={integration}
                onClickDelete={onClickDelete}
                onClickDuplicate={onClickDuplicate}
                onToggleCampaign={onToggleCampaign}
                onChangePage={onChangePage}
            />
        )

        const firstPage = container.querySelectorAll('tr')
        expect(firstPage.length).toEqual(11) // 10 campaign rows + header row

        rerender(
            <CampaignsTable
                data={data}
                page={2}
                perPage={10}
                integration={integration}
                onClickDelete={onClickDelete}
                onClickDuplicate={onClickDuplicate}
                onToggleCampaign={onToggleCampaign}
                onChangePage={onChangePage}
            />
        )

        const secondPage = container.querySelectorAll('tr')
        expect(secondPage.length).toEqual(10) // 9 campaign rows + header row
    })

    it('shows the preview tooltip', async () => {
        const onClickDelete = jest.fn()
        const onClickDuplicate = jest.fn()
        const onToggleCampaign = jest.fn()
        const onChangePage = jest.fn()

        render(
            <CampaignsTable
                data={[data[0]]}
                page={1}
                perPage={10}
                integration={integration}
                onClickDelete={onClickDelete}
                onClickDuplicate={onClickDuplicate}
                onToggleCampaign={onToggleCampaign}
                onChangePage={onChangePage}
            />
        )

        fireEvent.mouseOver(screen.getByText('campaign 0'))

        await waitFor(() => {
            expect(screen.getByText(data[0].message.text)).toBeInTheDocument()
            expect(screen.getByText('Business hours')).toBeInTheDocument()
        })
    })

    it('does not show the pagination if there is only one page', () => {
        const onClickDelete = jest.fn()
        const onClickDuplicate = jest.fn()
        const onToggleCampaign = jest.fn()
        const onChangePage = jest.fn()

        render(
            <CampaignsTable
                data={data}
                perPage={25}
                integration={integration}
                onClickDelete={onClickDelete}
                onClickDuplicate={onClickDuplicate}
                onToggleCampaign={onToggleCampaign}
                onChangePage={onChangePage}
            />
        )

        expect(() => screen.getByLabelText(/next/)).toThrow()
        expect(() => screen.getByLabelText(/previous/)).toThrow()
    })

    it('resets the page when the data changes', () => {
        const onClickDelete = jest.fn()
        const onClickDuplicate = jest.fn()
        const onToggleCampaign = jest.fn()
        const onChangePage = jest.fn()

        const {rerender} = render(
            <CampaignsTable
                data={data}
                page={3}
                perPage={5}
                integration={integration}
                onClickDelete={onClickDelete}
                onClickDuplicate={onClickDuplicate}
                onToggleCampaign={onToggleCampaign}
                onChangePage={onChangePage}
            />
        )

        expect(screen.getByLabelText('page-3')).toHaveAttribute(
            'aria-current',
            'true'
        )

        rerender(
            <CampaignsTable
                data={data.slice(0, 15)}
                perPage={5}
                integration={integration}
                onClickDelete={onClickDelete}
                onClickDuplicate={onClickDuplicate}
                onToggleCampaign={onToggleCampaign}
                onChangePage={onChangePage}
            />
        )

        expect(screen.getByLabelText('page-1')).toHaveAttribute(
            'aria-current',
            'true'
        )
    })
})
