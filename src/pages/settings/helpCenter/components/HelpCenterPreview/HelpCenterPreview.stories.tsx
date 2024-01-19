import React from 'react'
import {Meta, StoryObj} from '@storybook/react'
import HelpCenterPreview from './HelpCenterPreview'
import logoUrl from './assets/preview-story-example.png'
import HelpCenterPreviewHomePage from './HelpCenterPreviewHomePage'

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
