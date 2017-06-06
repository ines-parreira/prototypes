import {connect} from 'react-redux'
import CreditCard from './components/CreditCard'
import {updateCreditCard} from '../../../../state/billing/actions'
import {UPDATE_CREDIT_CARD_FORM} from '../../../../state/billing/constants'
import {formValueSelector} from 'redux-form'

function mapStateToProps(state) {
    const selector = formValueSelector(UPDATE_CREDIT_CARD_FORM)
    return {
        number: selector(state, 'number'),
        name: selector(state, 'name'),
        expDate: selector(state, 'expDate'),
        cvc: selector(state, 'cvc')
    }
}

export default connect(mapStateToProps, {
    updateCreditCard
})(CreditCard)
