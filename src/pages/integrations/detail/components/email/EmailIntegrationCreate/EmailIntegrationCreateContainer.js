import {connect} from 'react-redux'
import EmailIntegrationCreate from './EmailIntegrationCreate'
import {notify} from '../../../../../../state/notifications/actions'

const mapStateToProps = state => ({
    domain: state.currentAccount.get('domain'),
})

export default connect(mapStateToProps, {notify})(EmailIntegrationCreate)
