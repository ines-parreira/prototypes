import React, {PropTypes} from 'react'

import Modal from '../../../common/components/Modal'
import PageHeader from '../../../common/components/PageHeader'

import RuleForm from './RuleForm'
import RuleTable from './RuleTable'
import {getAST, getCode} from '../../../../utils'

export default class RulesView extends React.Component {
    constructor() {
        super()
        this.state = {showForm: false}
    }

    componentWillMount() {
        this.props.actions.rules.fetchRules()
    }

    _showForm = () => {
        this.setState({showForm: true})
    }

    _hideForm = () => {
        this.setState({showForm: false})
    }

    _handleSubmit = (values) => {
        this._hideForm()
        // add some default values for the rule
        values.code = 'if (eq(event.type, \'ticket-message-created\')) {}'
        values.code_ast = getAST(values.code)
        values.code = getCode(values.code_ast)
        return this.props.actions.rules.create(values)
    }

    render() {
        const {actions, rules} = this.props

        const activeRules = rules.filter(r => !r.get('deactivated_datetime'))
        const inactiveRules = rules.filter(r => r.get('deactivated_datetime'))

        return (
            <div className="view">
                <PageHeader title="Rules">
                    <button
                        className="ui right floated positive button"
                        onClick={this._showForm}
                    >
                        Create new rule
                    </button>
                </PageHeader>
                <div>
                    <p>
                        Rules provide a way to control the behavior of Gorgias during certain events or perform periodic
                        tasks.
                    </p>
                    <p>
                        For example you can automatically add a 'refund' tag on a ticket if the subject contains
                        the text 'refund' or send a satisfaction survey after the ticket was closed for more than 48h.
                    </p>
                </div>
                {activeRules && !activeRules.isEmpty() && (
                    <div className="rule-category">
                        <h4>Active Rules</h4>
                        <RuleTable
                            actions={actions}
                            rules={activeRules}
                        />

                    </div>
                )}
                {inactiveRules && !inactiveRules.isEmpty() && (
                    <div className="rule-category">
                        <h4>Inactive Rules</h4>
                        <RuleTable
                            actions={actions}
                            rules={inactiveRules}
                        />
                    </div>
                )}

                <Modal
                    header="Create New Rule"
                    isOpen={this.state.showForm}
                    onRequestClose={this._hideForm}
                >
                    <RuleForm
                        onSubmit={this._handleSubmit}
                        onCancel={this._hideForm}
                    />
                </Modal>
            </div>
        )
    }
}

RulesView.propTypes = {
    actions: PropTypes.object,
    rules: PropTypes.object,
}
