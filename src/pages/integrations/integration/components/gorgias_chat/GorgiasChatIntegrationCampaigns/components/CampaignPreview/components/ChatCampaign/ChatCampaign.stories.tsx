import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import {ChatCampaign} from './ChatCampaign'

const storyConfig: Meta = {
    title: 'Data Display/Chat Campaigns/Campaign',
    component: ChatCampaign,
    args: {
        html: `Hello, first-time visitor! 👋 <br><br> Thank you for shopping with us, we'd like to offer you free shipping 🚢, please use the code: <strong>FREE_SHIPPING</strong>`,
        translatedTexts: {
            campaignClickToReply: 'Click to reply',
            poweredBy: 'Powered by',
        },
    },
}

const Template: Story<ComponentProps<typeof ChatCampaign>> = (props) => (
    <ChatCampaign {...props} />
)

export const RandomAgent = Template.bind({})

export const SpecificAgent = Template.bind({})
SpecificAgent.args = {
    authorName: 'John Doe',
    authorAvatarUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2_Ku6shBAMjN4XlJnYYR4uCD-is3Gw4wRAg&usqp=CAU',
}

export default storyConfig
