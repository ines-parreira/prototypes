import {connect} from 'react-redux'
import Account from './components/Account'
import {updateAccount} from '../../../state/currentAccount/actions'
import {fromJS} from 'immutable'

function mapPropsToState(state) {
    const account = state.currentAccount
    const emailsChannels = account
        .get('channels', fromJS([]))
        .filter((channel) => channel.get('type') === 'email' && channel.get('preferred') === true)
        .toJS()

    return {
        account,
        isSubmitting: account.getIn(['_internal', 'loading', 'updateAccount'], false),
        initialValues: {
            channels: emailsChannels
        }
    }
}

export default connect(mapPropsToState, {
    updateAccount
})(Account)
