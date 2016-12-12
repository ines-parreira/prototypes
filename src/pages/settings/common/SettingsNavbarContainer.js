import {connect} from 'react-redux'
import SettingsNavbar from './components/SettingsNavbar'

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser
    }
}

export default connect(mapStateToProps)(SettingsNavbar)
