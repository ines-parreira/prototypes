import {fireEvent, render} from '@testing-library/react'
import React from 'react'
import {ProductRecommendationScenario} from 'pages/convert/campaigns/types/CampaignAttachment'
import {AttachmentEnum} from 'common/types'
import {assumeMock} from 'utils/testing'
import {useCampaignDetailsContext} from 'pages/convert/campaigns/hooks/useCampaignDetailsContext'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import ProductRecommendationScenarioPicker from '../ProductRecommendationScenarioPicker'

jest.mock('pages/convert/campaigns/hooks/useCampaignDetailsContext')
const useCampaignDetailsContextMock = assumeMock(useCampaignDetailsContext)

describe('ProductRecommendationScenarioPicker', () => {
    beforeEach(() => {
        useCampaignDetailsContextMock.mockReturnValue({
            triggers: [],
            addTrigger: jest.fn(),
        } as any)
    })

    it('should render the component', () => {
        const {getByText} = render(
            <ProductRecommendationScenarioPicker onClick={jest.fn()} />
        )

        expect(getByText('Similar Products You Have Seen')).toBeInTheDocument()
    })

    it('should call onClick with the correct attachment', () => {
        const onClick = jest.fn()
        const {getByText} = render(
            <ProductRecommendationScenarioPicker onClick={onClick} />
        )

        const seenScenario = getByText('Similar Products You Have Seen')
        fireEvent.click(seenScenario)

        expect(onClick).toHaveBeenCalledWith({
            content_type: AttachmentEnum.ProductRecommendation,
            name: 'Similar Products You Have Seen',
            extra: {
                id: expect.any(String),
                scenario: ProductRecommendationScenario.SimilarSeen,
                description:
                    'Recommends based on visitors’ product pages browsed',
            },
        })
    })

    it('should open modal for scenario that requires it', () => {
        const {getByText} = render(
            <ProductRecommendationScenarioPicker onClick={jest.fn()} />
        )

        const scenario = getByText('Alternatives for Out of Stock Products')
        fireEvent.click(scenario)

        expect(
            getByText('Recommend Alternatives for Out of Stock Products')
        ).toBeInTheDocument()
    })

    it('should add trigger for scenario that offers it', () => {
        const addTriggerMock = jest.fn()
        useCampaignDetailsContextMock.mockReturnValue({
            triggers: [],
            addTrigger: addTriggerMock,
        } as any)

        const {getByText} = render(
            <ProductRecommendationScenarioPicker onClick={jest.fn()} />
        )

        const scenario = getByText('Alternatives for Out of Stock Products')
        fireEvent.click(scenario)

        fireEvent.click(getByText('Add Condition Automatically'))

        expect(addTriggerMock).toHaveBeenCalledWith(
            CampaignTriggerType.OutOfStockProductPages,
            {
                id: expect.any(String),
                type: CampaignTriggerType.OutOfStockProductPages,
                operator: CampaignTriggerOperator.Eq,
                value: 'true',
            }
        )
    })

    it('should not add trigger if the same already exists', () => {
        const onClick = jest.fn()
        const addTriggerMock = jest.fn()
        useCampaignDetailsContextMock.mockReturnValue({
            triggers: {
                '01J52XNFF4VCC92BEGT1CWZ4SZ': {
                    id: '01J52XNFF4VCC92BEGT1CWZ4SZ',
                    type: CampaignTriggerType.OutOfStockProductPages,
                    operator: CampaignTriggerOperator.Eq,
                    value: 'true',
                },
            },
            addTrigger: addTriggerMock,
        } as any)

        const {getByText} = render(
            <ProductRecommendationScenarioPicker onClick={onClick} />
        )

        const scenario = getByText('Alternatives for Out of Stock Products')
        fireEvent.click(scenario)

        expect(addTriggerMock).not.toHaveBeenCalled()
        expect(onClick).toHaveBeenCalledWith({
            content_type: AttachmentEnum.ProductRecommendation,
            name: 'Alternatives for Out of Stock Products',
            extra: {
                id: expect.any(String),
                scenario: ProductRecommendationScenario.OutOfStockAlternatives,
                description:
                    'Recommends alternatives for out of stock products',
            },
        })
    })
})
