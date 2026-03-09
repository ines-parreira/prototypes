import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { HelpCenterLayout } from '../../types/layout.enum'
import logoUrl from './assets/preview-story-example.png'
import HelpCenterPreview from './HelpCenterPreview'
import HelpCenterPreviewAutomation from './HelpCenterPreviewAutomation'
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

export const AutomationPreview: Story = {
    args: {
        children: (
            <HelpCenterPreviewAutomation
                primaryColor="#E03997"
                flows={[
                    { name: 'Submit a product idea', id: '1' },
                    {
                        name: 'Get replacement parts with long name included in this string',
                        id: '2',
                    },
                ]}
                orderManagement={[
                    'trackOrderPolicy',
                    'cancelOrderPolicy',
                    'reportIssuePolicy',
                    'returnOrderPolicy',
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

export const HomePageDefaultPreview: Story = {
    args: {
        children: (
            <HelpCenterPreviewHomePage
                layout={HelpCenterLayout.DEFAULT}
                primaryColor="#E03997"
            />
        ),
    },
}

export const HomePageOnePagerPreview: Story = {
    args: {
        children: (
            <HelpCenterPreviewHomePage
                layout={HelpCenterLayout.ONEPAGER}
                primaryColor="#E03997"
            />
        ),
    },
}
