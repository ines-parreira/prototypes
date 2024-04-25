import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'

import {ValidationError} from '../validationError'
import {validateCurrentUrl} from '../currentUrlValidator'

describe('validationErrors', () => {
    describe('validateCurrentUrl', () => {
        it.each([
            ['', CampaignTriggerOperator.Eq, 'Value is required'],
            [
                'utm_source=Klaviyo&utm_medium=email&utm_campaign=Thanks%20for%20subscribing%',
                CampaignTriggerOperator.Eq,
                'The URL appears to be malformed. Please review and re-enter.',
            ],
            [
                'my-awesome-url',
                CampaignTriggerOperator.Eq,
                'The URL you provided is incorrect. Please enter a relative or absolute URL.',
            ],
            [
                'htt://my-awesome-url',
                CampaignTriggerOperator.Eq,
                'The URL you provided is incorrect. Please enter a relative or absolute URL.',
            ],
        ])('should raise an exception', (path, operator, message) => {
            expect(() => validateCurrentUrl(path, operator)).toThrow(
                ValidationError
            )
            expect(() => validateCurrentUrl(path, operator)).toThrow(message)
        })

        it.each([
            ['/some-relative-url', CampaignTriggerOperator.Eq],
            ['some-relative-url', CampaignTriggerOperator.Contains],
        ])('should not raise an exception', (path, operator) => {
            expect(() => validateCurrentUrl(path, operator)).not.toThrow(
                ValidationError
            )
        })
    })
})
