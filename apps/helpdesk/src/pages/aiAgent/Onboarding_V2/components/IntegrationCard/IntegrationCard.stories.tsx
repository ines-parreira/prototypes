import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Tag } from '@gorgias/axiom'

import gmailLogo from 'assets/img/integrations/gmail.svg'

import { IntegrationCard } from './IntegrationCard'

const storyConfig: Meta<typeof IntegrationCard> = {
    title: 'AI Agent/Onboarding_V2/IntegrationCard',
    component: IntegrationCard,
}

type Story = StoryObj<typeof IntegrationCard>

/** Default onboarding */
export const Default: Story = {
    args: {
        icon: <img src={gmailLogo} alt="Gmail" />,
        status: <Tag color="green">Connected</Tag>,
        buttonLabel: 'Connect Gmail',
        description:
            'Log into your Gmail or Google Workspace  account to allow Gorgias access to emails.',
        title: 'Connect Gmail account',
        onClick: () => {},
    },
}

export default storyConfig
