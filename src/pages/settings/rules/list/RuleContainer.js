import {connect} from 'react-redux'
import {withRouter} from 'react-router'

import {bindActionCreators} from 'redux'

import * as RuleActions from '../../../../state/rules/actions'
import {getRules} from '../../../../state/rules/selectors'

import RulesView from './components/RulesView'

const mapStateToProps = (state) => {
    return {
        rules: getRules(state)
            .sortBy((rule) => rule.get('name')) // sort by name rules with same priority
            .sortBy((rule) => -rule.get('priority')) // sort by priority (highest first)
            .filter((rule) => rule.get('type') !== 'system'), // hide system rules,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: {
            rules: bindActionCreators(RuleActions, dispatch),
        },
    }
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(RulesView)
)
