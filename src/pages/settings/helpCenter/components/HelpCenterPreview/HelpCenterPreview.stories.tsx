import React from 'react'
import {Meta, StoryObj} from '@storybook/react'
import HelpCenterPreview from './HelpCenterPreview'
import logoUrl from './assets/preview-story-example.png'
import HelpCenterPreviewHomePage from './HelpCenterPreviewHomePage'
import HelpCenterPreviewAutomation from './HelpCenterPreviewAutomation'

const meta: Meta<typeof HelpCenterPreview> = {
    title: 'Help Center/HelpCenterPreview',
    component: HelpCenterPreview,
    argTypes: {
        logoUrl: {
            table: {
                disable: true,
            },
        },
    },
}
export default meta

type Story = StoryObj<typeof HelpCenterPreview>

export const Basic: Story = {
    args: {
        logoUrl: undefined,
    },
}

export const AutomationPreview: Story = {
    args: {
        children: (
            <HelpCenterPreviewAutomation
                primaryColor="#E03997"
                flows={[
                    'Submit a product idea',
                    'Get replacement parts with long name included in this string',
                ]}
                orderManagement={[
                    'track_order_policy',
                    'cancel_order_policy',
                    'report_issue_policy',
                    'return_order_policy',
                ]}
            />
        ),
    },
}

export const WithLogo: Story = {
    args: {
        logoUrl: logoUrl,
    },
}

export const HomePagePreview: Story = {
    args: {
        children: <HelpCenterPreviewHomePage primaryColor="#E03997" />,
    },
}
