import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { HELPDESK_CANCELLATION_SCENARIO } from '../../scenarios'
import Feature from '../../UI/Feature'
import ProductFeaturesFOMO from '../ProductFeaturesFOMO'

jest.mock('../../UI/Feature', () =>
    jest.fn(() => <div data-testid="feature"></div>),
)
const MockFeature = assumeMock(Feature)

describe('ProductFeaturesFOMO', () => {
    it('renders with given Helpdesk features and period end', () => {
        const { getAllByTestId, getByText, container } = render(
            <ProductFeaturesFOMO
                periodEnd="February 14, 2024"
                features={HELPDESK_CANCELLATION_SCENARIO.features}
            />,
        )

        expect(container).toHaveTextContent(
            "Please be aware that by opting out of Helpdesk's auto-renewal, you're also discontinuing it " +
                "for any other products you're currently using. You'll continue to have full access " +
                'to all your active products until the end of your billing cycle on February 14, 2024. ' +
                "Here's what you'll lose after that date:",
        )
        const periodEndText = getByText('February 14, 2024')
        expect(periodEndText).toHaveClass('body-semibold')

        const featureElements = getAllByTestId('feature')
        expect(featureElements).toHaveLength(
            HELPDESK_CANCELLATION_SCENARIO.features.length,
        )
        HELPDESK_CANCELLATION_SCENARIO.features.forEach((feature, index) => {
            expect(MockFeature).toHaveBeenNthCalledWith(index + 1, feature, {})
        })
    })

    it('renders features with icon property', () => {
        const featuresWithIcon = [
            {
                title: 'Feature 1',
                description: 'Description 1',
                icon: 'star',
            },
            {
                title: 'Feature 2',
                description: 'Description 2',
                icon: 'heart',
            },
        ]

        const { getAllByTestId } = render(
            <ProductFeaturesFOMO
                periodEnd="February 14, 2024"
                features={featuresWithIcon}
            />,
        )

        const featureElements = getAllByTestId('feature')
        expect(featureElements).toHaveLength(featuresWithIcon.length)

        featuresWithIcon.forEach((feature) => {
            expect(MockFeature).toHaveBeenCalledWith(
                {
                    title: feature.title,
                    description: feature.description,
                    icon: feature.icon,
                },
                {},
            )
        })
    })

    it('renders features with iconUrl property', () => {
        const featuresWithIconUrl = [
            {
                title: 'Feature 1',
                description: 'Description 1',
                iconUrl: 'https://example.com/icon1.png',
            },
            {
                title: 'Feature 2',
                description: 'Description 2',
                iconUrl: 'https://example.com/icon2.png',
            },
        ]

        const { getAllByTestId } = render(
            <ProductFeaturesFOMO
                periodEnd="February 14, 2024"
                features={featuresWithIconUrl}
            />,
        )

        const featureElements = getAllByTestId('feature')
        expect(featureElements).toHaveLength(featuresWithIconUrl.length)

        featuresWithIconUrl.forEach((feature) => {
            expect(MockFeature).toHaveBeenCalledWith(
                {
                    title: feature.title,
                    description: feature.description,
                    iconUrl: feature.iconUrl,
                },
                {},
            )
        })
    })

    it('renders mixed features with both icon and iconUrl properties', () => {
        const mixedFeatures = [
            {
                title: 'Feature with icon',
                description: 'Description 1',
                icon: 'star',
            },
            {
                title: 'Feature with iconUrl',
                description: 'Description 2',
                iconUrl: 'https://example.com/icon.png',
            },
        ]

        const { getAllByTestId } = render(
            <ProductFeaturesFOMO
                periodEnd="February 14, 2024"
                features={mixedFeatures}
            />,
        )

        const featureElements = getAllByTestId('feature')
        expect(featureElements).toHaveLength(mixedFeatures.length)

        expect(MockFeature).toHaveBeenNthCalledWith(
            1,
            {
                title: 'Feature with icon',
                description: 'Description 1',
                icon: 'star',
            },
            {},
        )

        expect(MockFeature).toHaveBeenNthCalledWith(
            2,
            {
                title: 'Feature with iconUrl',
                description: 'Description 2',
                iconUrl: 'https://example.com/icon.png',
            },
            {},
        )
    })

    it('renders empty list when no features are provided', () => {
        const { queryAllByTestId } = render(
            <ProductFeaturesFOMO periodEnd="February 14, 2024" features={[]} />,
        )

        const featureElements = queryAllByTestId('feature')
        expect(featureElements).toHaveLength(0)
    })
})
