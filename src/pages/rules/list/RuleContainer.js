import {connect} from 'react-redux'

import {bindActionCreators} from 'redux'

import RulesView from './components/RulesView'

import * as RuleActions from '../../../state/rules/actions'

const mapStateToProps = (state) => ({
    rules: state.rules,
})

const mapDispatchToProps = (dispatch) => ({
    actions: {
        rules: bindActionCreators(RuleActions, dispatch),
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(RulesView)
