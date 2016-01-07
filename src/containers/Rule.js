import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import esprima from 'esprima'

import RuleForm from '../components/rule/RuleForm'
import RuleList from '../components/rule/RuleList'
import * as RuleActions from '../actions/rule'
import * as SchemaActions from '../actions/schema'

class RuleContainer extends React.Component {
    constructor() {
        super()
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentWillMount() {
        this.props.actions.fetchRules('/api/rules/')
        this.props.schemaActions.fetch()
    }

    handleSubmit(e) {
        e.preventDefault()
        const type = this.refs.type.value.trim()
        const code = this.refs.code.value.trim()

        if (!type || !code) {
            return
        }


        const { actions } = this.props

        try {
            const syntax = esprima.parse(code)
            actions.submitRule('/api/rules/', {type: type, code: code, code_ast: JSON.stringify(syntax, null, 4)})
        } catch (err) {
            actions.errorMsg(err.message)
            this.refs.type.value = ''
            this.refs.code.value = ''
            return
        }

        this.refs.type.value = ''
        this.refs.code.value = ''
    }

    render() {
        const {rules, schemas, actions } = this.props

        return (
            <div className="ui container Rules">
                <h3 className="ui header">List of rules</h3>
                <RuleList
                    rules={rules}
                    schemas={schemas}
                    actions={actions} />

                <h3 className="ui header">Add a new rule</h3>
                <RuleForm actions={actions} handleSubmit={this.handleSubmit}/>
            </div>
        )
    }
}

RuleContainer.propTypes = {
    actions: PropTypes.object,
    schemaActions: PropTypes.object,
    rules: PropTypes.object,
    schemas: PropTypes.object
}

function mapStateToProps(state) {
    return {
        rules: state.rules,
        schemas: state.schemas
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(RuleActions, dispatch),
        schemaActions: bindActionCreators(SchemaActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RuleContainer)
