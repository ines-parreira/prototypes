import {connect} from 'react-redux'
import {removeNotification as hide} from 'reapop'

import BannerNotifications from './components/BannerNotifications'

export default connect(null, {hide})(BannerNotifications)
