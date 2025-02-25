import isURL from 'validator/lib/isURL'

import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'

import {ValidatorType} from './types'
import {ValidationError} from './validationError'

export const validateCurrentUrl: ValidatorType = (value, operator) => {
    if (!value) {
        throw new ValidationError('Value is required')
    }

    if (value.includes(' ')) {
        throw new ValidationError('URL should not contain any spaces.')
    }

    try {
        decodeURI(value)
    } catch {
        throw new ValidationError(
            'The URL appears to be malformed. Please review and re-enter.'
        )
    }

    const operators = [CampaignTriggerOperator.Eq, CampaignTriggerOperator.Neq]
    if (operators.includes(operator) && !isURL(value)) {
        if (value.startsWith('/')) {
            return
        }

        throw new ValidationError(
            'The URL you provided is incorrect. Please enter a relative or absolute URL.'
        )
    }
}
