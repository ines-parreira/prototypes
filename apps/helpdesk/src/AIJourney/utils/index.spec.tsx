import { JourneyTypeEnum } from '@gorgias/convert-client'

import { getSetupStepPath } from './index'

describe('getSetupStepPath', () => {
    it('should generate path without journeyId when not provided', () => {
        const result = getSetupStepPath({
            shopName: 'test-shop',
            journeyType: JourneyTypeEnum.CartAbandoned,
            stepName: 'setup',
        })

        expect(result).toBe('/app/ai-journey/test-shop/cart-abandoned/setup')
    })

    it('should generate path with journeyId when provided', () => {
        const result = getSetupStepPath({
            shopName: 'test-shop',
            journeyType: JourneyTypeEnum.CartAbandoned,
            stepName: 'setup',
            journeyId: 'journey-123',
        })

        expect(result).toBe(
            '/app/ai-journey/test-shop/cart-abandoned/setup/journey-123',
        )
    })
})
