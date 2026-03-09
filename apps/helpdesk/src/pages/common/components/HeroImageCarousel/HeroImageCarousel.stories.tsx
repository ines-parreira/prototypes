import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { assetsUrl } from 'utils'

import HeroImageCarousel from './HeroImageCarousel'

const storyConfig: Meta = {
    title: 'Layout/HeroImageCarousel',
    component: HeroImageCarousel,
    parameters: {
        docs: {
            description: {
                component:
                    'Presentational component for displaying Hero Image carousel.',
            },
        },
    },
    argTypes: {},
    decorators: [],
}

const Template: StoryObj<typeof HeroImageCarousel> = {
    render: function Template(props) {
        return <HeroImageCarousel {...props} />
    },
}

const defaultProps: ComponentProps<typeof HeroImageCarousel> = {
    slides: [
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_flows.png',
            ),
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_article_recommendation.png',
            ),
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_order_management.png',
            ),
        },
    ],
}

const withHeadingAndDescriptionProps: ComponentProps<typeof HeroImageCarousel> =
    {
        slides: [
            {
                imageUrl: assetsUrl(
                    '/img/paywalls/screens/automate_paywall_flows.png',
                ),
                description:
                    'Build personalized, automated interactions with Flows and Quick Responses.',
                header: 'I am the Heading 1',
            },
            {
                imageUrl: assetsUrl(
                    '/img/paywalls/screens/automate_paywall_article_recommendation.png',
                ),
                description: 'Recommend Help Center articles with AI.',
                header: 'I am the Heading 2',
            },
            {
                imageUrl: assetsUrl(
                    '/img/paywalls/screens/automate_paywall_order_management.png',
                ),
                description:
                    'Let customers manage and track orders on your Chat, Help Center, and Contact Form.',
                header: 'I am the Heading 3',
            },
        ],
    }

const withHeadingProps: ComponentProps<typeof HeroImageCarousel> = {
    slides: [
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_flows.png',
            ),
            header: 'I am the Heading 1',
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_article_recommendation.png',
            ),
            header: 'I am the Heading 2',
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_order_management.png',
            ),
            header: 'I am the Heading 3',
        },
    ],
}

const withDescriptionProps: ComponentProps<typeof HeroImageCarousel> = {
    slides: [
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_flows.png',
            ),
            description:
                'Build personalized, automated interactions with Flows and Quick Responses.',
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_article_recommendation.png',
            ),
            description: 'Recommend Help Center articles with AI.',
        },
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_order_management.png',
            ),
            description:
                'Let customers manage and track orders on your Chat, Help Center, and Contact Form.',
        },
    ],
}

const singleSlideWithButton: ComponentProps<typeof HeroImageCarousel> = {
    slides: [
        {
            imageUrl: assetsUrl(
                '/img/paywalls/screens/automate_paywall_flows.png',
            ),
            description:
                'Build personalized, automated interactions with Flows and Quick Responses.',
            header: 'I am the Heading',
        },
    ],
    singleSlideButtonTitle: 'I am the button',
}
export const Default = {
    ...Template,
    args: defaultProps,
}

export const WithHeadingAndDescriptionProps = {
    ...Template,
    args: withHeadingAndDescriptionProps,
}

export const WithHeadingProps = {
    ...Template,
    args: withHeadingProps,
}

export const WithDescriptionProps = {
    ...Template,
    args: withDescriptionProps,
}

export const SingleSlideWithButton = {
    ...Template,
    args: singleSlideWithButton,
}

export default storyConfig
