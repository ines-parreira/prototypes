import type { IconName } from '@gorgias/axiom'

import { assertNever } from '../../../../../utils/assertNever'
import type {
    ActionExecutedActionName,
    ActionExecutedSourceFamily,
} from './types'

function getSourceFamilyFromIntegrationType(
    integrationType: string | undefined,
): ActionExecutedSourceFamily | null {
    switch (integrationType?.toLowerCase()) {
        case 'shopify':
            return 'shopify'
        case 'bigcommerce':
            return 'bigcommerce'
        case 'recharge':
            return 'recharge'
        case 'http':
            return 'custom-http'
        default:
            return null
    }
}

function getSourceFamilyFromActionName(
    actionName: ActionExecutedActionName,
): ActionExecutedSourceFamily {
    if (actionName.startsWith('shopify')) {
        return 'shopify'
    }

    if (actionName.startsWith('bigcommerce')) {
        return 'bigcommerce'
    }

    if (actionName.startsWith('recharge')) {
        return 'recharge'
    }

    return 'custom-http'
}

export function getActionExecutedSourceFamily({
    actionName,
    integrationType,
}: {
    actionName: ActionExecutedActionName
    integrationType: string | undefined
}): ActionExecutedSourceFamily {
    return (
        getSourceFamilyFromIntegrationType(integrationType) ??
        getSourceFamilyFromActionName(actionName)
    )
}

export function getActionExecutedSourceIconName(
    sourceFamily: ActionExecutedSourceFamily,
): IconName {
    switch (sourceFamily) {
        case 'shopify':
            return 'app-shopify'
        case 'bigcommerce':
            return 'app-bicommerce'
        case 'recharge':
            return 'shopping-bag'
        case 'custom-http':
            return 'webhook'
        default:
            return assertNever(sourceFamily)
    }
}
