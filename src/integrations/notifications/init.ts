import {registerNotification} from 'common/notifications'

import DomainVerificationNotification from './components/DomainVerificationNotification'

registerNotification({
    type: 'email-domain.verified',
    component: DomainVerificationNotification,
    workflow: 'email-domain.verified',
})
