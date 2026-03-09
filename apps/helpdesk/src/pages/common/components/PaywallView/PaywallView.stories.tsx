import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { LegacyButton as Button } from '@gorgias/axiom'

import { assetsUrl } from 'utils'

import HeroImageCarousel from '../HeroImageCarousel/HeroImageCarousel'
import PaywallView from './PaywallView'
import PaywallViewActionButtons from './PaywallViewActionButtons'
import PaywallViewChecklist from './PaywallViewChecklist'
import PaywallViewChecklistItem from './PaywallViewChecklistItem'
import PaywallViewHeader from './PaywallViewHeader'
import PaywallViewLeftContainer from './PaywallViewLeftContainer'
import PaywallViewRightContainer from './PaywallViewRightContainer'

const meta: Meta = {
    title: 'Layout/PaywallView',
    component: PaywallView,
    parameters: {
        docs: {
            description: {
                component: 'Presentational component for displaying paywalls.',
            },
        },
    },
    argTypes: {
        children: {
            description: 'Content to display in the paywall view.',
        },
    },
    decorators: [
        (storyFn, context) => {
            return (
                <MemoryRouter>
                    <div
                        style={{
                            zIndex: 0,
                            position: 'relative',
                            overflow: 'hidden',
                            height:
                                context.viewMode === 'story' ? '100vh' : '70vh',
                        }}
                    >
                        {storyFn()}
                    </div>
                </MemoryRouter>
            )
        },
    ],
}

export default meta

type Story = StoryObj<typeof PaywallView>

export const Default: Story = {
    render: (args) => <PaywallView {...args} />,
    args: {
        children: (
            <>
                <PaywallViewLeftContainer>
                    <PaywallViewHeader
                        logo={assetsUrl('/img/self-service/automate-logo.svg')}
                        title="Automate 60%+ of your support with AI and grow your brand"
                    />
                    <PaywallViewChecklist>
                        <PaywallViewChecklistItem>
                            Resolve up to 50% of requests with AI and
                            automation.
                        </PaywallViewChecklistItem>
                        <PaywallViewChecklistItem>
                            Save agent time for more personalized customer care.
                        </PaywallViewChecklistItem>
                    </PaywallViewChecklist>
                    <PaywallViewActionButtons>
                        <Button>Select plan to get started</Button>
                        <Button intent="secondary">Learn more</Button>
                    </PaywallViewActionButtons>
                </PaywallViewLeftContainer>
                <PaywallViewRightContainer>
                    <HeroImageCarousel
                        slides={[
                            {
                                imageUrl: assetsUrl(
                                    '/img/paywalls/screens/automate_paywall_statistics.png',
                                ),
                                description:
                                    'Track performance and improve your automations with dedicated statistics.',
                            },
                            {
                                imageUrl: assetsUrl(
                                    '/img/paywalls/screens/automate_paywall_flows.png',
                                ),
                                description:
                                    'Build personalized, automated interactions with Flows.',
                            },
                        ]}
                    />
                </PaywallViewRightContainer>
            </>
        ),
    },
}
