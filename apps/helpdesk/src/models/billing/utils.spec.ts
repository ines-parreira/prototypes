import { ProductType } from './types'
import { getProductTrackingName } from './utils'

describe('getProductTrackingName', () => {
    it('should return "helpdesk" for ProductType.Helpdesk', () => {
        expect(getProductTrackingName(ProductType.Helpdesk)).toBe('helpdesk')
    })

    it('should return "ai_agent" for ProductType.Automation', () => {
        expect(getProductTrackingName(ProductType.Automation)).toBe('ai_agent')
    })

    it('should return "voice" for ProductType.Voice', () => {
        expect(getProductTrackingName(ProductType.Voice)).toBe('voice')
    })

    it('should return "sms" for ProductType.SMS', () => {
        expect(getProductTrackingName(ProductType.SMS)).toBe('sms')
    })

    it('should return "convert" for ProductType.Convert', () => {
        expect(getProductTrackingName(ProductType.Convert)).toBe('convert')
    })
})
