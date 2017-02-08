import {connect} from 'react-redux'
import EmailIntegrationUpdate from './EmailIntegrationUpdate'

const mapStateToProps = state => ({
    domain: state.currentAccount.get('domain'),
})

export default connect(mapStateToProps)(EmailIntegrationUpdate)
