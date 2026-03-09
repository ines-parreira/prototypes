import type { IconName } from '@gorgias/axiom'

import { assertNever } from '../../../../../utils/assertNever'
import type { PhoneEventType } from './types'

export function getPhoneEventIconName(type: PhoneEventType): IconName {
    switch (type) {
        case 'phone-call-conversation-started':
            return 'comm-phone-incoming'
        case 'phone-call-forwarded-to-external-number':
        case 'phone-call-forwarded-to-gorgias-number':
        case 'phone-call-forwarded':
            return 'arrow-routing'
        case 'message-played':
            return 'comm-ivr'
        default:
            return assertNever(type)
    }
}
