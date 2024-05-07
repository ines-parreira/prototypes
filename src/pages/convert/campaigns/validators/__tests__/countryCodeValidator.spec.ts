import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'

import {ValidationError} from '../validationError'
import {countryCodeValidator} from '../countryCodeValidator'

describe('countryCodeValidator', () => {
    it('should raise an exception', () => {
        expect(() =>
            countryCodeValidator('', CampaignTriggerOperator.Eq)
        ).toThrow(ValidationError)
        expect(() =>
            countryCodeValidator('', CampaignTriggerOperator.Eq)
        ).toThrow('Value is required')
    })

    it('should not raise an exception', () => {
        expect(() =>
            countryCodeValidator('US', CampaignTriggerOperator.Eq)
        ).not.toThrow(ValidationError)
    })
})
