import React from 'react'

import {Meta, StoryObj} from '@storybook/react'
import {action} from '@storybook/addon-actions'

import {MemoryRouter} from 'react-router-dom'
import {IntegrationType} from 'models/integration/constants'
import {
    TopQuestionsSection as TopQuestionsSectionComponent,
    TopQuestionsSectionLoading as TopQuestionsSectionLoadingComponent,
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
    },
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof TopQuestionsSectionComponent>

export const TopQuestionsSection: Story = {
    render: (args) => (
        <MemoryRouter>
            <div style={{width: '1154px'}}>
                <TopQuestionsSectionComponent
                    {...args}
                    onDismiss={action('onDismiss')}
                    onCreateArticle={action('onCreateArticle')}
                />
            </div>
        </MemoryRouter>
    ),
}

export const TopQuestionsSectionLessThan4: Story = {
    render: (args) => (
        <MemoryRouter>
            <div style={{width: '1154px'}}>
                <TopQuestionsSectionComponent
                    {...args}
                    topQuestions={args.topQuestions.slice(0, 2)}
                    onDismiss={action('onDismiss')}
                    onCreateArticle={action('onCreateArticle')}
                />
            </div>
        </MemoryRouter>
    ),
}

export const TopQuestionsSectionWide: Story = {
    render: (args) => (
        <MemoryRouter>
            <div style={{width: '1600px'}}>
                <TopQuestionsSectionComponent
                    {...args}
                    onDismiss={action('onDismiss')}
                    onCreateArticle={action('onCreateArticle')}
                />
            </div>
        </MemoryRouter>
    ),
}

export const TopQuestionsSectionWideLessThan4: Story = {
    render: (args) => (
        <MemoryRouter>
            <div style={{width: '1600px'}}>
                <TopQuestionsSectionComponent
                    {...args}
                    topQuestions={args.topQuestions.slice(0, 2)}
                    onDismiss={action('onDismiss')}
                    onCreateArticle={action('onCreateArticle')}
                />
            </div>
        </MemoryRouter>
    ),
}

export const TopQuestionsSectionNew: Story = {
    render: (args) => (
        <MemoryRouter>
            <div style={{width: '1154px'}}>
                <TopQuestionsSectionComponent
                    {...args}
                    newQuestionsCount={12}
                    onDismiss={action('onDismiss')}
                    onCreateArticle={action('onCreateArticle')}
                />
            </div>
        </MemoryRouter>
    ),
}
export const TopQuestionsSectionEmpty: Story = {
    render: (args) => (
        <MemoryRouter>
            <div style={{width: '1154px'}}>
                <TopQuestionsSectionComponent
                    {...args}
                    topQuestions={[]}
                    onDismiss={action('onDismiss')}
                    onCreateArticle={action('onCreateArticle')}
                />
            </div>
        </MemoryRouter>
    ),
}

export const TopQuestionsSectionLoading: StoryObj<
    typeof TopQuestionsSectionLoadingComponent
> = {
    render: () => (
        <MemoryRouter>
            <div style={{width: '1154px'}}>
                <TopQuestionsSectionLoadingComponent />
            </div>
        </MemoryRouter>
    ),
}

export const TopQuestionsSectionWithShopFilter: Story = {
    render: (args) => (
        <MemoryRouter>
            <div style={{width: '1154px'}}>
                <TopQuestionsSectionComponent
                    {...args}
                    onDismiss={action('onDismiss')}
                    onCreateArticle={action('onCreateArticle')}
                />
            </div>
        </MemoryRouter>
    ),
    args: {
        shopFilter: {
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
            setSelectedShopIntegrationId: action(
                'setSelectedShopIntegrationId'
            ),
        },
        shopIntegrationId: 1,
    },
}

export const TopQuestionsSectionWithHelpCenterFilter: Story = {
    render: (args) => (
        <MemoryRouter>
            <div style={{width: '1154px'}}>
                <TopQuestionsSectionComponent
                    {...args}
                    onDismiss={action('onDismiss')}
                    onCreateArticle={action('onCreateArticle')}
                />
            </div>
        </MemoryRouter>
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
        helpCenterId: 1,
    },
}

export const TopQuestionsSectionWithAllFilters: Story = {
    render: (args) => (
        <MemoryRouter>
            <div style={{width: '1154px'}}>
                <TopQuestionsSectionComponent
                    {...args}
                    onDismiss={action('onDismiss')}
                    onCreateArticle={action('onCreateArticle')}
                />
            </div>
        </MemoryRouter>
    ),
    args: {
        shopFilter: TopQuestionsSectionWithShopFilter.args?.shopFilter,
        shopIntegrationId: 1,
        helpCenterFilter:
            TopQuestionsSectionWithHelpCenterFilter.args?.helpCenterFilter,
        helpCenterId: 1,
    },
}
