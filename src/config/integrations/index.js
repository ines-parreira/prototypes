// @flow
import * as facebook from './facebook'
import * as magento2 from './magento2'
import * as recharge from './recharge'
import * as shopify from './shopify'
import * as smile from './smile'
import * as smooch from './smooch'
import * as smoochInside from './smooch_inside'

const allIntegrations = [
    facebook,
    magento2,
    recharge,
    shopify,
    smile,
    smooch,
    smoochInside,
]

export const CHAT_AUTO_RESPONDER_REPLY_SHORTLY = 'reply-shortly'
export const CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES = 'reply-in-minutes'
export const CHAT_AUTO_RESPONDER_REPLY_IN_HOURS = 'reply-in-hours'
export const CHAT_AUTO_RESPONDER_REPLY_IN_DAY = 'reply-in-day'
export const CHAT_AUTO_RESPONDER_REPLY_DEFAULT = CHAT_AUTO_RESPONDER_REPLY_SHORTLY
export const CHAT_AUTO_RESPONDER_ENABLED_DEFAULT = false
export const CHAT_AUTO_RESPONDER_REPLY_OPTIONS = [
    CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
    CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
]

export const CHAT_AUTO_RESPONDER_TEXTS = require('../../../../../integrations/common/texts/chat_auto_responder_texts.json')

/**
 * Generate a list of variables separated by integration.
 * @param variableStoreName: the name of the constant defining the variables (can be `MACRO_VARIABLES`,
 *  `MACRO_HIDDEN_VARIABLES` or `MACRO_PREVIOUS_VARIABLES`)
 * @returns {Array<Object>} the list of variables separated by integration
 */
const getIntegrationVariables = (variableStoreName: string): Array<Object> => {
    let variables: Array<Object> = []

    allIntegrations.forEach((integration) => {
        if (integration[variableStoreName]) {
            variables = variables.concat(integration[variableStoreName])
        }
    })

    return variables
}

export const INTEGRATION_VARIABLES = getIntegrationVariables('MACRO_VARIABLES')

export const INTEGRATION_HIDDEN_VARIABLES = getIntegrationVariables(
    'MACRO_HIDDEN_VARIABLES'
)

export const INTEGRATION_PREVIOUS_VARIABLES = getIntegrationVariables(
    'MACRO_PREVIOUS_VARIABLES'
)

/**
 * Generate a list of all integrations which define at least one variable to be used in the macro.
 * @returns {Array<string>} the list of integration types which define at least one variable
 */
const getIntegrationTypesWithVariables = (): Array<string> => {
    const integrationTypesWithVariables: Array<string> = []

    allIntegrations.forEach((integration) => {
        const variableStore =
            integration.MACRO_VARIABLES ||
            //$FlowFixMe
            integration.MACRO_HIDDEN_VARIABLES ||
            //$FlowFixMe
            integration.MACRO_PREVIOUS_VARIABLES

        if (variableStore) {
            integrationTypesWithVariables.push(variableStore.type)
        }
    })

    return integrationTypesWithVariables
}

export const INTEGRATION_TYPE_WITH_VARIABLES = getIntegrationTypesWithVariables()

export const getAutoResponderReplyOptions = (
    language: ?string
): Array<Object> => {
    if (!language) {
        return []
    }

    return CHAT_AUTO_RESPONDER_REPLY_OPTIONS.map((option) => {
        return {
            value: option,
            label: `"${CHAT_AUTO_RESPONDER_TEXTS[language][option]}"`,
        }
    })
}
