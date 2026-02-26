import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { ProductType } from 'models/billing/types'

import {
    HELPDESK_CANCELLATION_SCENARIO,
    SMS_CANCELLATION_SCENARIO,
    VOICE_CANCELLATION_SCENARIO,
} from '../../scenarios'
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
        expect(getByText('February 14, 2024')).toBeInTheDocument()

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

    it('renders with given Voice features and period end', () => {
        const { getAllByTestId, getByText, container } = render(
            <ProductFeaturesFOMO
                periodEnd="February 14, 2024"
                features={VOICE_CANCELLATION_SCENARIO.features}
                productType={ProductType.Voice}
                productDisplayName="Voice"
            />,
        )

        expect(container.textContent).toContain(
            'Cancelling your Voice plan will permanently delete your current integration settings and call flows.',
        )
        expect(container.textContent).toContain(
            'Your phone numbers will remain active and available.',
        )
        expect(container.textContent).toContain(
            'Your plan will not renew after your current billing cycle ends on',
        )
        expect(container.textContent).toContain(
            'keep full access to all Voice features',
        )
        expect(container.textContent).toContain('After that date')
        expect(getByText('February 14, 2024')).toBeInTheDocument()

        const featureElements = getAllByTestId('feature')
        expect(featureElements).toHaveLength(
            VOICE_CANCELLATION_SCENARIO.features.length,
        )
        VOICE_CANCELLATION_SCENARIO.features.forEach((feature, index) => {
            expect(MockFeature).toHaveBeenNthCalledWith(index + 1, feature, {})
        })
    })

    it('renders with given SMS features and period end', () => {
        const { getAllByTestId, getByText, container } = render(
            <ProductFeaturesFOMO
                periodEnd="February 14, 2024"
                features={SMS_CANCELLATION_SCENARIO.features}
                productType={ProductType.SMS}
                productDisplayName="SMS"
            />,
        )

        expect(container.textContent).toContain(
            'Cancelling your SMS plan will permanently delete your current integration settings.',
        )
        expect(container.textContent).toContain(
            'Your phone numbers will remain active and available.',
        )
        expect(container.textContent).toContain(
            'Your plan will not renew after your current billing cycle ends on',
        )
        expect(container.textContent).toContain(
            'keep full access to all SMS features',
        )
        expect(container.textContent).toContain('After that date')
        expect(getByText('February 14, 2024')).toBeInTheDocument()

        const featureElements = getAllByTestId('feature')
        expect(featureElements).toHaveLength(
            SMS_CANCELLATION_SCENARIO.features.length,
        )
        SMS_CANCELLATION_SCENARIO.features.forEach((feature, index) => {
            expect(MockFeature).toHaveBeenNthCalledWith(index + 1, feature, {})
        })
    })

    describe.each([
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
            expect(getByText('February 14, 2024')).toBeInTheDocument()
        })
    })
})
