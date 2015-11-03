import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import RuleForm from '../../components/rule/RuleForm'
import RuleList from '../../components/rule/RuleList'
import * as RuleActions from '../../actions/rule'

class RuleBox extends React.Component {
    componentDidMount() {
        const { rules, actions } = this.props
        actions.fetchRules("/api/rules")
    }

    render() {
        const {rules, actions } = this.props

        return (
            <div className="ui container Rules">
                <RuleList data={rules}/>

                <h3 className="ui header">Adding a new rule</h3>
                <RuleForm actions={actions}/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        rules: state.rules
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(RuleActions, dispatch)
    }
}

export
default

connect(mapStateToProps,
    mapDispatchToProps)

(
    RuleBox
)
