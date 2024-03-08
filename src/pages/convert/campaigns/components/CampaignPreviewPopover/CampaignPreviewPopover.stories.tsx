import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import {createTrigger} from '../../utils/createTrigger'
import {CampaignTriggerType} from '../../types/enums/CampaignTriggerType.enum'

import {CampaignPreviewPopover} from './CampaignPreviewPopover'

const storyConfig: Meta = {
    title: 'Data Display/Chat Campaigns/Preview Popover',
    component: CampaignPreviewPopover,
    argTypes: {
        message: {
            control: {
                type: 'text',
                description: 'Message to display in the popover',
                defaultValue:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc in arcu nisl. Donec ligula lacus, mattis nec purus vel, imperdiet varius ex. Praesent in malesuada purus. Morbi sollicitudin risus urna, non scelerisque eros maximus at. Proin accumsan, velit sit amet pellentesque bibendum, est tortor dictum odio, vitae pulvinar quam dolor at tortor.',
            },
        },
        triggers: {
            control: {
                type: 'object',
                description: 'List of triggers to display in the popover',
                defaultValue: [
                    createTrigger(CampaignTriggerType.AmountSpent),
                    createTrigger(CampaignTriggerType.CartValue),
                    createTrigger(CampaignTriggerType.CartValue),
                    createTrigger(CampaignTriggerType.CartProductTags),
                    createTrigger(CampaignTriggerType.BusinessHours),
                ],
            },
        },
    },
}

const Template: Story<ComponentProps<typeof CampaignPreviewPopover>> = (
    props
) => (
    <div style={{marginTop: 280}}>
        <CampaignPreviewPopover {...props}>
            <span>Campaign name preview</span>
        </CampaignPreviewPopover>
    </div>
)

export const Default = Template.bind({})
Default.args = {
    message:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc in arcu nisl. Donec ligula lacus, mattis nec purus vel, imperdiet varius ex. Praesent in malesuada purus. Morbi sollicitudin risus urna, non scelerisque eros maximus at. Proin accumsan, velit sit amet pellentesque bibendum, est tortor dictum odio, vitae pulvinar quam dolor at tortor.',
    triggers: [
        createTrigger(CampaignTriggerType.AmountSpent),
        createTrigger(CampaignTriggerType.CartValue),
        createTrigger(CampaignTriggerType.CartValue),
        createTrigger(CampaignTriggerType.CartProductTags),
        createTrigger(CampaignTriggerType.BusinessHours),
    ],
}

export default storyConfig
