import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import RuleForm from '../rule/RuleForm'
import RuleList from '../rule/RuleList'
import ErrorMessage from '../ErrorMessage'
import * as RuleActions from '../../actions/rule'

class RuleContainer extends React.Component {
    componentDidMount() {
        const { rules, actions } = this.props
        actions.fetchRules("/api/rules")
    }

    componentDidUpdate() {
        //$('.ui.dropdown').dropdown({
        //    onChange: (value) => {
        //        console.log('onchange')
        //        console.log(value)
        //    }
        //})
    }

    render() {
        const {rules, error, actions } = this.props

        return (
            <div className="ui container Rules">
                <ErrorMessage error={error}/>

                <h3 className="ui header">List of rules</h3>
                <RuleList data={rules} actions={actions}/>

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

export default connect(mapStateToProps, mapDispatchToProps)(RuleContainer)
