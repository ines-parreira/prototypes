import TicketSubmitButtons from './TicketSubmitButtons'
import {connect} from 'react-redux'
import {hasReachedLimit} from '../../../../../utils'
import moment from 'moment'

function mapStateToProps({currentAccount, billing}) {
    const isAccountActive = currentAccount.get('deactivated_datetime') === null
    const hasCreditCard = currentAccount.getIn(['meta', 'hasCreditCard'])
    const plan = billing.get('plan')
    const tickets = billing.getIn(['currentUsage', 'data', 'tickets'], 0)
    const hasReachedMaxLimit = hasReachedLimit('max', tickets, plan, currentAccount.get('created_datetime', moment()))

    return {
        canSendMessage: isAccountActive && (hasCreditCard || !hasReachedMaxLimit)
    }
}

export default connect(mapStateToProps)(TicketSubmitButtons)
