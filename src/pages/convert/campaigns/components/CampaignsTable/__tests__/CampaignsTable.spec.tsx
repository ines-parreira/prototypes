import React from 'react'
import {fromJS} from 'immutable'
import {screen, fireEvent, render, waitFor} from '@testing-library/react'

import useSearch from 'hooks/useSearch'

import {ACTIVE_CAMPAIGNS_LIMIT} from 'pages/convert/campaigns/constants/lightCampaigns'
import * as useLocalStorage from 'hooks/useLocalStorage'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {createTrigger} from '../../../utils/createTrigger'

import {Campaign} from '../../../types/Campaign'
import {CampaignTriggerType} from '../../../types/enums/CampaignTriggerType.enum'

import {CampaignsTable} from '../CampaignsTable'

jest.mock('hooks/useSearch')
const useLocalStorageSpy = jest.spyOn(useLocalStorage, 'default') as jest.Mock

const CAMPAIGNS_COUNT = 19
const ACTIVE_CAMPAIGNS_COUNT = ACTIVE_CAMPAIGNS_LIMIT + 1

const data = Array.from({length: CAMPAIGNS_COUNT}, (_, i) => ({
    id: i,
    name: `campaign ${i}`,
    language: 'en-US',
    triggers: [createTrigger(CampaignTriggerType.BusinessHours)],
    message_text: `campaign message ${i}`,
    message_html: `campaign message ${i}`,
    status:
        i < ACTIVE_CAMPAIGNS_COUNT // to be over the limit
            ? CampaignStatus.Active
            : CampaignStatus.Inactive,
})) as unknown[] as Campaign[]

const integration = fromJS({
    id: '1',
    meta: {
        languages: [{language: 'en-US', primary: true}],
        shop_type: 'shopify',
    },
})

const useIsConvertSubscriberSpy = jest.spyOn(
    isConvertSubscriberHook,
    'useIsConvertSubscriber'
)

describe('<CampaignsTable />', () => {
    const onClickDelete = jest.fn()
    const onClickDuplicate = jest.fn()
    const onToggleCampaign = jest.fn()
    const onChangePage = jest.fn()
    const props = {
        data: data,
        page: 1,
        perPage: 10,
        integration: integration,
        isUpdatingCampaign: false,
        isDeletingCampaign: false,
        onClickDelete: onClickDelete,
        onClickDuplicate: onClickDuplicate,
        onToggleCampaign: onToggleCampaign,
        onChangePage: onChangePage,
    }

    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: {
                search: '',
            },
        })
        ;(useSearch as jest.Mock).mockImplementation(() => ({}))
        useIsConvertSubscriberSpy.mockImplementation(() => true)
        useLocalStorageSpy.mockReturnValue([])
    })

    it('renders the `perPage` items', () => {
        const {container} = render(<CampaignsTable {...props} />)

        const rows = container.querySelectorAll('tr')

        expect(rows.length).toEqual(11) // 10 campaign rows + header row
    })

    it('renders the `perPage` items with offset', () => {
        const {container, rerender} = render(<CampaignsTable {...props} />)

        const firstPage = container.querySelectorAll('tr')
        expect(firstPage.length).toEqual(11) // 10 campaign rows + header row

        rerender(<CampaignsTable {...props} page={2} />)

        const secondPage = container.querySelectorAll('tr')
        expect(secondPage.length).toEqual(10) // 9 campaign rows + header row
    })

    it('shows the preview tooltip', async () => {
        render(<CampaignsTable {...props} data={[data[0]]} />)

        fireEvent.mouseOver(screen.getByText('campaign 0'))

        await waitFor(() => {
            expect(screen.getByText(data[0].message_text)).toBeInTheDocument()
            expect(screen.getByText('Business hours')).toBeInTheDocument()
        })
    })

    it('does not show the pagination if there is only one page', () => {
        render(<CampaignsTable {...props} perPage={25} />)

        expect(() => screen.getByLabelText(/next/)).toThrow()
        expect(() => screen.getByLabelText(/previous/)).toThrow()
    })

    it('resets the page when the data changes', () => {
        const {rerender} = render(
            <CampaignsTable {...props} page={3} perPage={5} />
        )

        expect(screen.getByLabelText('page-3')).toHaveAttribute(
            'aria-current',
            'true'
        )

        rerender(
            <CampaignsTable {...props} data={data.slice(0, 15)} perPage={5} />
        )

        expect(screen.getByLabelText('page-1')).toHaveAttribute(
            'aria-current',
            'true'
        )
    })

    it('blocks toggle activation when over the limit', () => {
        useIsConvertSubscriberSpy.mockImplementation(() => false)

        const {container} = render(
            <CampaignsTable {...props} perPage={CAMPAIGNS_COUNT} />
        )

        const disabledToggles = container.querySelectorAll(
            'label[class*="isDisabled"]'
        )

        expect(disabledToggles.length).toEqual(
            CAMPAIGNS_COUNT - ACTIVE_CAMPAIGNS_COUNT
        )
    })

    it('displays light campaign modal when toggling active campaign', () => {
        useIsConvertSubscriberSpy.mockImplementation(() => false)

        const {container, getByText} = render(
            <CampaignsTable {...props} perPage={CAMPAIGNS_COUNT} />
        )

        const toggles = Array.from(
            container.querySelectorAll('label[class*="label"]')
        ).filter(
            (el) =>
                !Array.from(el.classList).some((cn) =>
                    cn.includes('isDisabled')
                )
        )

        expect(toggles.length).toEqual(ACTIVE_CAMPAIGNS_COUNT)

        const inputId = toggles[0].getAttribute('for') || ''

        const activeCampaignToggle = document.getElementById(inputId)
        expect(activeCampaignToggle).not.toBeNull()
        activeCampaignToggle && fireEvent.click(activeCampaignToggle)

        expect(getByText('Learn About Convert')).toBeInTheDocument()
    })
})
