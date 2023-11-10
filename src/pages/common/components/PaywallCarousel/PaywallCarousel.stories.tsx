import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import {assetsUrl} from 'utils'
import PaywallCarousel from './PaywallCarousel'

const storyConfig: Meta = {
    title: 'Layout/PaywallCarousel',
    component: PaywallCarousel,
    parameters: {
        docs: {
            description: {
                component:
                    'Presentational component for displaying paywall carousel.',
            },
        },
    },
    argTypes: {},
    decorators: [],
}

const Template: Story<ComponentProps<typeof PaywallCarousel>> = (props) => (
    <PaywallCarousel {...props} />
)

const defaultProps: ComponentProps<typeof PaywallCarousel> = {
    slides: [
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_flows.png'
            ),
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_article_recommendation.png'
            ),
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_order_management.png'
            ),
        },
    ],
}

const withHeadingAndDescriptionProps: ComponentProps<typeof PaywallCarousel> = {
    slides: [
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_flows.png'
            ),
            description:
                'Build personalized, automated interactions with Flows and Quick Responses.',
            header: 'I am the Heading 1',
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_article_recommendation.png'
            ),
            description: 'Recommend Help Center articles with AI.',
            header: 'I am the Heading 2',
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_order_management.png'
            ),
            description:
                'Let customers manage and track orders on your Chat, Help Center, and Contact Form.',
            header: 'I am the Heading 3',
        },
    ],
}

const withHeadingProps: ComponentProps<typeof PaywallCarousel> = {
    slides: [
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_flows.png'
            ),
            header: 'I am the Heading 1',
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_article_recommendation.png'
            ),
            header: 'I am the Heading 2',
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_order_management.png'
            ),
            header: 'I am the Heading 3',
        },
    ],
}

const withDescriptionProps: ComponentProps<typeof PaywallCarousel> = {
    slides: [
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_flows.png'
            ),
            description:
                'Build personalized, automated interactions with Flows and Quick Responses.',
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_article_recommendation.png'
            ),
            description: 'Recommend Help Center articles with AI.',
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_order_management.png'
            ),
            description:
                'Let customers manage and track orders on your Chat, Help Center, and Contact Form.',
        },
    ],
}

const singleSlideWithButton: ComponentProps<typeof PaywallCarousel> = {
    slides: [
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_flows.png'
            ),
            description:
                'Build personalized, automated interactions with Flows and Quick Responses.',
            header: 'I am the Heading',
        },
    ],
    singleSlideButtonTitle: 'I am the button',
}
export const Default = Template.bind({})
Default.args = defaultProps

export const WithHeadingAndDescriptionProps = Template.bind({})
WithHeadingAndDescriptionProps.args = withHeadingAndDescriptionProps

export const WithHeadingProps = Template.bind({})
WithHeadingProps.args = withHeadingProps

export const WithDescriptionProps = Template.bind({})
WithDescriptionProps.args = withDescriptionProps

export const SingleSlideWithButton = Template.bind({})
SingleSlideWithButton.args = singleSlideWithButton

export default storyConfig
