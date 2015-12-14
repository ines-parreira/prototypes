import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import esprima from 'esprima'

import RuleForm from '../components/rule/RuleForm'
import RuleList from '../components/rule/RuleList'
import * as RuleActions from '../actions/rule'

class RuleContainer extends React.Component {
    constructor() {
        super()
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount() {
        this.props.actions.fetchRules('/api/rules')
    }

    handleSubmit(e) {
        e.preventDefault()
        const type = this.refs.type.value.trim()
        const code = this.refs.code.value.trim()

        if (!type || !code) {
            return
        }


        const { rules, actions } = this.props

        try {
            let syntax = esprima.parse(code)
        } catch (err) {
            actions.errorMsg(err.message)
            this.refs.type.value = ''
            this.refs.code.value = ''
            return
        }

        actions.submitRule('/api/rules/', {type: type, code: code, code_ast: JSON.stringify(syntax, null, 4)})

        this.refs.type.value = ''
        this.refs.code.value = ''
    }

    render() {
        const {rules, actions } = this.props

        return (
            <div className="ui container Rules">
                <h3 className="ui header">List of rules</h3>
                <RuleList rules={rules} actions={actions}/>

                <h3 className="ui header">Add a new rule</h3>
                <RuleForm actions={actions} handleSubmit={this.handleSubmit} />
            </div>
        )
    }
}

RuleContainer.propTypes = {
    actions: PropTypes.object,
    rules: PropTypes.object
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

export default connect(mapStateToProps, mapDispatchToProps)(RuleContainer)
