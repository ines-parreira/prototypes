import CHAT_AUTO_RESPONDER_TEXTS_IMPORT from '../../../../../integrations/common/texts/chat_auto_responder_texts.json'

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
export const CHAT_AUTO_RESPONDER_REPLY_DEFAULT =
    CHAT_AUTO_RESPONDER_REPLY_SHORTLY
export const CHAT_AUTO_RESPONDER_ENABLED_DEFAULT = false
export const CHAT_AUTO_RESPONDER_REPLY_OPTIONS = [
    CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
    CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
] as const

export const isAutoresponderReply = (
    option: any
): option is typeof CHAT_AUTO_RESPONDER_REPLY_OPTIONS[number] => {
    return CHAT_AUTO_RESPONDER_REPLY_OPTIONS.includes(option)
}

// Casting for typing json imports
const CHAT_AUTO_RESPONDER_TEXTS: Record<
    string,
    Record<string, string>
> = CHAT_AUTO_RESPONDER_TEXTS_IMPORT

export {CHAT_AUTO_RESPONDER_TEXTS}

const getIntegrationVariables = (variableStoreName: string) => {
    let variables: Array<ValueOf<typeof allIntegrations[number]>> = []

    allIntegrations.forEach((integration) => {
        const selectedVariables =
            integration[
                variableStoreName as keyof typeof allIntegrations[number]
            ]
        if (selectedVariables) {
            variables = variables.concat(selectedVariables)
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

const getIntegrationTypesWithVariables = () => {
    const integrationTypesWithVariables: Array<string> = []

    allIntegrations.forEach((integration: Record<string, unknown>) => {
        const variableStore = (integration.MACRO_VARIABLES ||
            integration.MACRO_HIDDEN_VARIABLES ||
            integration.MACRO_PREVIOUS_VARIABLES) as
            | Record<string, string>
            | undefined

        if (variableStore) {
            integrationTypesWithVariables.push(variableStore.type)
        }
    })

    return integrationTypesWithVariables
}

export const INTEGRATION_TYPE_WITH_VARIABLES =
    getIntegrationTypesWithVariables()

export const getAutoResponderReplyOptions = (language: string | null) => {
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
