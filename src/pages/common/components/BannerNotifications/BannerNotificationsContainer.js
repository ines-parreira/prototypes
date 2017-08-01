import {connect} from 'react-redux'
import BannerNotifications from './components/BannerNotifications'
import {removeNotification as hide} from 'reapop'

export default connect(null, {hide})(BannerNotifications)
