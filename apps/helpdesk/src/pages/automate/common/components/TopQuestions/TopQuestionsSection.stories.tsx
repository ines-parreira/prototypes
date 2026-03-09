import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'
import { action } from 'storybook/actions'

import { IntegrationType } from 'models/integration/constants'

import {
    TopQuestionsSectionAllReviewed as TopQuestionsSectionAllReviewedComponent,
    TopQuestionsSection as TopQuestionsSectionComponent,
    TopQuestionsSectionConnectStoreToEmail as TopQuestionsSectionConnectEmailComponent,
    TopQuestionsSectionLoading as TopQuestionsSectionLoadingComponent,
    TopQuestionsSectionNoRecommendations as TopQuestionsSectionNoRecommendationsComponent,
} from './TopQuestionsSection'

const meta: Meta<typeof TopQuestionsSectionComponent> = {
    component: TopQuestionsSectionComponent,
    title: 'Automate/TopQuestions/TopQuestionsSection',
    args: {
        topQuestions: [
            {
                title: 'How can I ensure my apartment number is included on the shipping label?',
                ticketsCount: 439,
                templateKey: 'templateKey1',
            },
            {
                title: 'Are new customers eligible for any discounts?',
                ticketsCount: 392,
                templateKey: 'templateKey2',
            },
            {
                title: "What should I do if my package is marked as delivered but I haven't received it?",
                ticketsCount: 201,
                templateKey: 'templateKey3',
            },
            {
                title: 'Can I cancel my order after placing it?',
                ticketsCount: 99,
                templateKey: 'templateKey4',
            },
            {
                title: 'Yet another question, it should not be displayed because it is the 5th',
                ticketsCount: 50,
                templateKey: 'templateKey5',
            },
        ],
        helpCenterId: 1,
        storeIntegrationId: 1,
    },
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof TopQuestionsSectionComponent>

const Renderer = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
        <div style={{ width: '1154px' }}>{children}</div>
    </MemoryRouter>
)

export const TopQuestionsSection: Story = {
    render: (args) => (
        <Renderer>
            <TopQuestionsSectionComponent
                {...args}
                onDismiss={() => Promise.resolve()}
                onCreateArticle={() => Promise.resolve()}
            />
        </Renderer>
    ),
}

export const TopQuestionsSectionLessThan4: Story = {
    render: (args) => (
        <Renderer>
            <TopQuestionsSectionComponent
                {...args}
                topQuestions={args.topQuestions.slice(0, 2)}
                onDismiss={() => Promise.resolve()}
                onCreateArticle={() => Promise.resolve()}
            />
        </Renderer>
    ),
}

export const TopQuestionsSectionWide: Story = {
    render: (args) => (
        <MemoryRouter>
            <div style={{ width: '1600px' }}>
                <TopQuestionsSectionComponent
                    {...args}
                    onDismiss={() => Promise.resolve()}
                    onCreateArticle={() => Promise.resolve()}
                />
            </div>
        </MemoryRouter>
    ),
}

export const TopQuestionsSectionWideLessThan4: Story = {
    render: (args) => (
        <MemoryRouter>
            <div style={{ width: '1600px' }}>
                <TopQuestionsSectionComponent
                    {...args}
                    topQuestions={args.topQuestions.slice(0, 2)}
                    onDismiss={() => Promise.resolve()}
                    onCreateArticle={() => Promise.resolve()}
                />
            </div>
        </MemoryRouter>
    ),
}

export const TopQuestionsSectionNew: Story = {
    render: (args) => (
        <Renderer>
            <TopQuestionsSectionComponent
                {...args}
                newQuestionsCount={12}
                onDismiss={() => Promise.resolve()}
                onCreateArticle={() => Promise.resolve()}
            />
        </Renderer>
    ),
}

export const TopQuestionsSectionAllReviewed: Story = {
    render: (args) => (
        <Renderer>
            <TopQuestionsSectionAllReviewedComponent {...args} />
        </Renderer>
    ),
}

export const TopQuestionsSectionNoRecommendations: Story = {
    render: (args) => (
        <Renderer>
            <TopQuestionsSectionNoRecommendationsComponent {...args} />
        </Renderer>
    ),
}

export const TopQuestionsSectionConnectStoreToEmail: Story = {
    render: (args) => (
        <Renderer>
            <TopQuestionsSectionConnectEmailComponent {...args} />
        </Renderer>
    ),
}

export const TopQuestionsSectionLoading: StoryObj<
    typeof TopQuestionsSectionLoadingComponent
> = {
    render: () => (
        <Renderer>
            <TopQuestionsSectionLoadingComponent />
        </Renderer>
    ),
}

export const TopQuestionsSectionWithShopFilter: Story = {
    render: (args) => (
        <Renderer>
            <TopQuestionsSectionComponent
                {...args}
                onDismiss={() => Promise.resolve()}
                onCreateArticle={() => Promise.resolve()}
            />
        </Renderer>
    ),
    args: {
        storeFilter: {
            options: [
                {
                    shopName: 'Brown Sugar Babe',
                    shopType: IntegrationType.Shopify,
                    integrationId: 1,
                },
                {
                    shopName: 'Brown Sugar Babe (CA)',
                    shopType: IntegrationType.Shopify,
                    integrationId: 2,
                },
                {
                    shopName: 'Brown Sugar Babe (Int)',
                    shopType: IntegrationType.Magento2,
                    integrationId: 3,
                },
                {
                    shopName: 'Store 4',
                    shopType: IntegrationType.Magento2,
                    integrationId: 4,
                },
                {
                    shopName: 'Store 5',
                    shopType: IntegrationType.BigCommerce,
                    integrationId: 5,
                },
            ],
            setSelectedStoreIntegrationId: action(
                'setSelectedShopIntegrationId',
            ),
        },
    },
}

export const TopQuestionsSectionWithHelpCenterFilter: Story = {
    render: (args) => (
        <Renderer>
            <TopQuestionsSectionComponent
                {...args}
                onDismiss={() => Promise.resolve()}
                onCreateArticle={() => Promise.resolve()}
            />
        </Renderer>
    ),
    args: {
        helpCenterFilter: {
            options: [
                {
                    name: 'BSB Help Center',
                    helpCenterId: 1,
                },
                {
                    name: 'Support Internal Help Center',
                    helpCenterId: 2,
                },
            ],
            setSelectedHelpCenterId: action('setSelectedHelpCenterId'),
        },
    },
}

export const TopQuestionsSectionWithAllFilters: Story = {
    render: (args) => (
        <Renderer>
            <TopQuestionsSectionComponent
                {...args}
                onDismiss={() => Promise.resolve()}
                onCreateArticle={() => Promise.resolve()}
            />
        </Renderer>
    ),
    args: {
        storeFilter: TopQuestionsSectionWithShopFilter.args?.storeFilter,
        helpCenterFilter:
            TopQuestionsSectionWithHelpCenterFilter.args?.helpCenterFilter,
    },
}
