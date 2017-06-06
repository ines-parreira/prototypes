import TicketSubmitButtons from './TicketSubmitButtons'
import {connect} from 'react-redux'
import * as currentAccountSelectors from '../../../../../state/currentAccount/selectors'

function mapStateToProps(state) {
    return {
        canSendMessage: currentAccountSelectors.isAccountActive(state)
    }
}

export default connect(mapStateToProps)(TicketSubmitButtons)
