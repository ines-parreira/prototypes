import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import RuleForm from '../rule/RuleForm'
import RuleList from '../rule/RuleList'
import ErrorMessage from '../ErrorMessage'
import * as RuleActions from '../../actions/rule'

class RuleBox extends React.Component {
    componentDidMount() {
        $('.ui.dropdown').dropdown()
        const { rules, actions } = this.props
        actions.fetchRules("/api/rules")
        console.log('init dropdown')
    }

    componentDidUpdate() {
        $('.ui.dropdown').dropdown('refresh')
    }

    render() {
        const {rules, error, actions } = this.props

        return (
            <div className="ui container Rules">
                <ErrorMessage error={error}/>

                <h3 className="ui header">List of rules</h3>
                <RuleList data={rules}/>

                <h3 className="ui header">Adding a new rule</h3>
                <RuleForm actions={actions}/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        rules: state.rules,
        error: state.error
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(RuleActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RuleBox)
