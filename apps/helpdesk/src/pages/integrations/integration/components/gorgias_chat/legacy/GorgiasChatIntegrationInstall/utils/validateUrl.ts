import { GorgiasChatInstallationVisibilityConditionOperator } from 'models/integration/types'

const urlRegex =
    /^((https?):\/\/(-\.)?)?([^\s/?\.#]+\.)([^\s/?\.#]+\.?)+(\/?[^\s#]*)?$/

const urlOrPathRegex = /^(((https?):\/\/)?([^\s\/\.#]+\.?)+)?(\/[^\s\.]*)?$/

export type UrlValidationResult = 'valid' | 'invalid' | 'unsupported'

/**
 * Validates an url to either be a valid hostname, hostname and pathname or pathname only.
 * The validation does not accept hash or query parameters.
 * @returns {boolean} True if the url is valid for the given operator, false otherwise
 */
const validateUrl = (
    url: string,
    operator: GorgiasChatInstallationVisibilityConditionOperator,
): UrlValidationResult => {
    if (url.includes('#')) {
        return 'unsupported'
    }

    let isValid: boolean

    switch (operator) {
        case GorgiasChatInstallationVisibilityConditionOperator.Equal:
        case GorgiasChatInstallationVisibilityConditionOperator.NotEqual:
            isValid = urlRegex.test(url)
            break
        case GorgiasChatInstallationVisibilityConditionOperator.Contain:
        case GorgiasChatInstallationVisibilityConditionOperator.NotContain:
            isValid = urlOrPathRegex.test(url)
    }

    return isValid ? 'valid' : 'invalid'
}

export default validateUrl
