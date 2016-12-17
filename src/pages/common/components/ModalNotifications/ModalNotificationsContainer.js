import {connect} from 'react-redux'
import ModalNotifications from './components/ModalNotifications'
import {hide} from 'react-notification-system-redux'

export default connect(null, {hide})(ModalNotifications)
