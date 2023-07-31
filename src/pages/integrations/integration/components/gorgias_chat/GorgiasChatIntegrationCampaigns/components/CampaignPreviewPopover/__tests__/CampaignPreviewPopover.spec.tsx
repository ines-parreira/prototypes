import React from 'react'
import {screen, fireEvent, render, waitFor} from '@testing-library/react'

import {createTrigger} from '../../../utils/createTrigger'
import {CampaignTriggerKey} from '../../../types/enums/CampaignTriggerKey.enum'
import {DeviceTypeOperators} from '../../../types/enums/DeviceTypeOperators.enum'
import {SingleCampaignInViewOperators} from '../../../types/enums/SingleCampaignInViewOperators.enum'

import {CampaignPreviewPopover} from '../CampaignPreviewPopover'

const message =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc in arcu nisl. Donec ligula lacus, mattis nec purus vel, imperdiet varius ex. Praesent in malesuada purus. Morbi sollicitudin risus urna, non scelerisque eros maximus at. Proin accumsan, velit sit amet pellentesque bibendum, est tortor dictum odio, vitae pulvinar quam dolor at tortor.'
const triggers = [
    createTrigger(CampaignTriggerKey.AmountSpent),
    createTrigger(CampaignTriggerKey.CartValue),
    createTrigger(CampaignTriggerKey.CartValue),
    createTrigger(CampaignTriggerKey.CurrentProductTags),
    createTrigger(CampaignTriggerKey.BusinessHours),
]
describe('<CampaignPreviewPopover />', () => {
    it('renders the campaign message', async () => {
        render(
            <CampaignPreviewPopover message={message} triggers={triggers}>
                <div>Campaign name preview</div>
            </CampaignPreviewPopover>
        )

        fireEvent.mouseOver(screen.getByText('Campaign name preview'))

        await waitFor(() => {
            expect(screen.getByText(message)).toBeInTheDocument()
        })
    })

    it('renders the campaign triggers name, uniquely ', async () => {
        render(
            <CampaignPreviewPopover message={message} triggers={triggers}>
                <div>Campaign name preview</div>
            </CampaignPreviewPopover>
        )

        fireEvent.mouseOver(screen.getByText('Campaign name preview'))

        await waitFor(() => {
            expect(screen.getByText('Total spent')).toBeInTheDocument()
            expect(screen.getByText('Amount added to cart')).toBeInTheDocument()
            expect(
                screen.getByText('Currently visited product')
            ).toBeInTheDocument()
            expect(screen.getByText('Business hours')).toBeInTheDocument()
        })
    })

    it('does not show the triggers that are under preferences or device type', async () => {
        const triggers = [
            createTrigger(CampaignTriggerKey.BusinessHours),
            {
                key: CampaignTriggerKey.DeviceType,
                value: 'desktop',
                operator: DeviceTypeOperators.Desktop,
            },
            {
                key: CampaignTriggerKey.SingleInView,
                value: 'true',
                operator: SingleCampaignInViewOperators.Equal,
            },
        ]
        render(
            <CampaignPreviewPopover message={message} triggers={triggers}>
                <div>Campaign name preview</div>
            </CampaignPreviewPopover>
        )

        fireEvent.mouseOver(screen.getByText('Campaign name preview'))

        await waitFor(() => {
            expect(screen.getByText('Business hours')).toBeInTheDocument()
        })
    })
})
