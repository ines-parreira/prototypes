import {connect} from 'react-redux'
import BannerNotifications from './components/BannerNotifications'
import {hide} from 'react-notification-system-redux'

export default connect(null, {hide})(BannerNotifications)
