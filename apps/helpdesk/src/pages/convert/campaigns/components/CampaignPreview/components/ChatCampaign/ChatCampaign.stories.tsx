import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { ChatCampaign } from './ChatCampaign'

const storyConfig: Meta = {
    title: 'Convert/Chat Campaigns/Campaign',
    component: ChatCampaign,
    args: {
        html: `Hello, first-time visitor! 👋 <br><br> Thank you for shopping with us, we'd like to offer you free shipping 🚢, please use the code: <strong>FREE_SHIPPING</strong>`,
        translatedTexts: {
            campaignClickToReply: 'Click to reply',
            poweredBy: 'Powered by',
        },
    },
}

type Story = StoryObj<typeof ChatCampaign>

const Template: Story = {
    render: (props) => <ChatCampaign {...props} />,
}

export const RandomAgent = {
    ...Template,
    args: {
        html: `Hello, first-time visitor! 👋 <br><br> Thank you for shopping with us, we'd like to offer you free shipping 🚢, please use the code: <strong>FREE_SHIPPING</strong>`,
    },
}

export const SpecificAgent = {
    ...Template,
    args: {
        authorName: 'John Doe',
        authorAvatarUrl:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2_Ku6shBAMjN4XlJnYYR4uCD-is3Gw4wRAg&usqp=CAU',
    },
}

export default storyConfig
