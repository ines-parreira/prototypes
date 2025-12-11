import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { ProductType } from 'models/billing/types'

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
                productType={ProductType.Helpdesk}
                productDisplayName="Helpdesk"
            />,
        )

        expect(container.textContent).toContain(
            'If you cancel now, your Helpdesk plan and all other active product plans',
        )
        expect(container.textContent).toContain(
            'renew after your current billing cycle ends on',
        )
        expect(container.textContent).toContain(
            'keep full access to your account',
        )
        expect(container.textContent).toContain('After that date')
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
                productType={ProductType.Helpdesk}
                productDisplayName="Helpdesk"
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
                productType={ProductType.Helpdesk}
                productDisplayName="Helpdesk"
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
                productType={ProductType.Helpdesk}
                productDisplayName="Helpdesk"
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
            <ProductFeaturesFOMO
                periodEnd="February 14, 2024"
                productType={ProductType.Helpdesk}
                productDisplayName="Helpdesk"
                features={[]}
            />,
        )

        const featureElements = queryAllByTestId('feature')
        expect(featureElements).toHaveLength(0)
    })

    describe.each([
        { productType: ProductType.Voice, productName: 'Voice' },
        { productType: ProductType.SMS, productName: 'SMS' },
        { productType: ProductType.Convert, productName: 'Convert' },
        { productType: ProductType.Automation, productName: 'AI Agent' },
    ])('$productName warning text', ({ productType, productName }) => {
        it('renders non-Helpdesk warning message with product name', () => {
            const { container, getByText } = render(
                <ProductFeaturesFOMO
                    periodEnd="February 14, 2024"
                    features={[]}
                    productType={productType}
                    productDisplayName={productName}
                />,
            )

            expect(container.textContent).toContain(
                `If you cancel now, your ${productName} plan`,
            )
            expect(container.textContent).toContain(
                'renew after your current billing cycle ends on',
            )
            expect(container.textContent).toContain(
                `keep full access to all ${productName} features`,
            )
            expect(container.textContent).toContain('After that date')
            const periodEndText = getByText('February 14, 2024')
            expect(periodEndText).toHaveClass('body-semibold')
        })
    })
})
