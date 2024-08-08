import {fireEvent, render} from '@testing-library/react'
import React from 'react'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {ProductRecommendationScenario} from 'pages/convert/campaigns/types/CampaignAttachment'
import ProductRecommendationModal from '../ProductRecommendationModal'

describe('<ProductRecommendationModal />', () => {
    const onSubmit = jest.fn()
    const onClose = jest.fn()
    const props = {
        scenario: ProductRecommendationScenario.OutOfStockAlternatives,
        isOpen: true,
        onSubmit: onSubmit,
        onClose: onClose,
    }

    it.each([
        [
            ProductRecommendationScenario.SimilarBought,
            'last purchases',
            'number of orders placed',
        ],
        [
            ProductRecommendationScenario.OutOfStockAlternatives,
            'out of stock products',
            'out of stock product pages',
        ],
    ])(
        'renders the modal for scenario',
        (scenario, expectedTitle, expectedContent) => {
            const {queryByText} = render(
                <ProductRecommendationModal {...{...props, scenario}} />
            )

            expect(
                queryByText(expectedTitle, {exact: false})
            ).toBeInTheDocument()
            expect(
                queryByText(expectedContent, {exact: false})
            ).toBeInTheDocument()
        }
    )

    it.each([
        [
            ProductRecommendationScenario.SimilarBought,
            CampaignTriggerType.OrdersCount,
            CampaignTriggerOperator.Gt,
            0,
        ],
        [
            ProductRecommendationScenario.OutOfStockAlternatives,
            CampaignTriggerType.OutOfStockProductPages,
            CampaignTriggerOperator.Eq,
            'true',
        ],
    ])(
        'calls `onSubmit` when the submit button is clicked',
        (scenario, triggerType, triggerOperator, triggerValue) => {
            const {getByRole} = render(
                <ProductRecommendationModal {...{...props, scenario}} />
            )

            const deactivateButton = getByRole('button', {
                name: 'Add Condition Automatically',
            })
            fireEvent.click(deactivateButton)

            expect(onSubmit).toHaveBeenCalledWith({
                id: expect.any(String),
                type: triggerType,
                operator: triggerOperator,
                value: triggerValue,
            })
        }
    )

    it('calls `onClose` when the close button is clicked', () => {
        const {getByText} = render(<ProductRecommendationModal {...props} />)

        fireEvent.click(getByText('Cancel'))

        expect(onClose).toHaveBeenCalled()
    })

    it('returns `null` for unsupported scenarion', () => {
        const {container} = render(
            <ProductRecommendationModal
                {...props}
                scenario={ProductRecommendationScenario.Newest}
            />
        )

        expect(container.firstChild).toBeNull()
    })
})
