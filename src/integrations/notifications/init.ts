import { registerNotification } from 'common/notifications'

import DomainVerificationNotification from './components/DomainVerificationNotification'
import type { EmailDomainPayload } from './types'

registerNotification<EmailDomainPayload>({
    type: 'email-domain.verified',
    component: DomainVerificationNotification,
    workflow: 'email-domain.verified',
})
