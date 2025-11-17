import React from 'react'

import { render } from '@testing-library/react'

import type { CampaignTrigger } from 'pages/convert/campaigns/types/CampaignTrigger'
import { CampaignTriggerDeviceTypeValueEnum } from 'pages/convert/campaigns/types/enums/CampaignTriggerDeviceTypeValue.enum'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import { createTrigger } from 'pages/convert/campaigns/utils/createTrigger'

import Triggers from '../Triggers'

describe('<Triggers>', () => {
    it('renders', () => {
        const triggerCurrentUrl = createTrigger(CampaignTriggerType.CurrentUrl)
        const triggerBusinessHours = createTrigger(
            CampaignTriggerType.BusinessHours,
        )
        const triggerDeviceType = createTrigger(CampaignTriggerType.DeviceType)
        triggerDeviceType.value = CampaignTriggerDeviceTypeValueEnum.Desktop

        const triggers: CampaignTrigger[] = [
            triggerCurrentUrl,
            triggerBusinessHours,
            triggerDeviceType,
        ]

        const { getByText } = render(
            <Triggers triggers={triggers} campaignMeta={{}} />,
        )
        expect(getByText('Business hours')).toBeTruthy()
        expect(getByText('Desktop only')).toBeTruthy()
    })
})
