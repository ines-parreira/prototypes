import {connect} from 'react-redux'

import {bindActionCreators} from 'redux'

import RulesView from './components/RulesView'

import * as RuleActions from '../../../../state/rules/actions'
import {getRules} from '../../../../state/rules/selectors'

const mapStateToProps = (state) => {
    return {
        rules: getRules(state)
            .sortBy((rule) => rule.get('title')) // sort by title rules with same priority
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

export default connect(mapStateToProps, mapDispatchToProps)(RulesView)
