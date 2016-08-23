import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import esprima from 'esprima'
import RuleForm from './components/RuleForm'
import RuleList from './components/RuleList'
import * as RuleActions from '../../state/rules/actions'
import * as SchemaActions from '../../state/schema/actions'

class RuleContainer extends React.Component {
    constructor() {
        super()
        this._handleSubmit = this._handleSubmit.bind(this)
    }

    componentWillMount() {
        this.props.actions.rule.fetchRules('/api/rules/')
        this.props.actions.schema.fetch()
    }

    _handleSubmit(e) {
        e.preventDefault()
        const type = this.refs.type.value.trim()
        const code = this.refs.code.value.trim()

        if (!type || !code) {
            return
        }

        const {actions} = this.props

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
        const {rules, schemas, actions} = this.props

        return (
            <div className="ui container Rules">
                <h3 className="ui header">List of rules</h3>
                <RuleList
                    rules={rules}
                    schemas={schemas}
                    actions={actions}
                />
                <h3 className="ui header">Add a new rule</h3>
                <RuleForm actions={actions} handleSubmit={this._handleSubmit} />
            </div>
        )
    }
}

RuleContainer.propTypes = {
    actions: PropTypes.object,
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
        actions: {
            rule: bindActionCreators(RuleActions, dispatch),
            schema: bindActionCreators(SchemaActions, dispatch)
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RuleContainer)
