/* reapop notifications theme
 */

import reapopThemeWybo from 'reapop-theme-wybo'
import _merge from 'lodash/merge'

import css from './Notifications.less'

export default _merge({}, reapopThemeWybo, {
    notificationsContainer: {
        className: {
            main: `${reapopThemeWybo.notificationsContainer.className.main} ${css.container}`
        }
    },
    notification: {
        className: {
            main: `${reapopThemeWybo.notification.className.main} ${css.notification}`,
            status: (_status) => {
                const status = `notification--${_status}`
                return `${reapopThemeWybo.notification.className[status]} ${css[status]}`
            },
            icon: 'material-icons ' + css['notification-icon'],
        }
    }
})

