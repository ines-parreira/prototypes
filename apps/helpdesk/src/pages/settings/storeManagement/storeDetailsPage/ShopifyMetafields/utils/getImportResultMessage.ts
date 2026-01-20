import pluralize from 'pluralize'

import type { ImportMetafieldsResult } from '../ImportMetafieldFlow/hooks/useImportMetafields'

type NotificationType = 'success' | 'error'

type ImportResultMessage = {
    message: string
    type: NotificationType
}

export function getImportResultMessage(
    result: ImportMetafieldsResult,
    totalCount: number,
): ImportResultMessage {
    if (result.failed.length === 0) {
        return {
            message: `Success! ${result.successful.length} ${pluralize('metafield', result.successful.length)} added`,
            type: 'success',
        }
    }

    if (result.successful.length === 0) {
        return {
            message: 'Failed to import metafields. Please try again.',
            type: 'error',
        }
    }

    const failedNames = result.failed.map((f) => f.name).join(', ')
    return {
        message: `${result.successful.length} of ${totalCount} metafields added. Failed: ${failedNames}`,
        type: 'error',
    }
}
