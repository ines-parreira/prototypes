import { registerNotification } from 'common/notifications'

import ImportEmailFailedNotification from './components/ImportEmailFailedNotification'
import ImportEmailSuccessNotification from './components/ImportEmailSuccessNotification'

registerNotification({
    type: 'import.failed',
    component: ImportEmailFailedNotification,
    getDesktopNotification: () => ({
        title: 'Email import failed',
    }),
    workflow: 'import-failed',
    settings: {
        type: 'ticket-updates',
        label: 'Import email import failed',
    },
})

registerNotification({
    type: 'import.completed',
    component: ImportEmailSuccessNotification,
    workflow: 'import-completed',
    settings: {
        type: 'ticket-updates',
        label: 'Import email import success',
    },
})
