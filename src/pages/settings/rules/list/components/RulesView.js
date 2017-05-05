import React, {PropTypes} from 'react'
import {Button} from 'reactstrap'

import Modal from '../../../../common/components/Modal'
import PageHeader from '../../../../common/components/PageHeader'

import RuleForm from './RuleForm'
import RuleTable from './RuleTable'
import {getAST, getCode} from '../../../../../utils'

export default class RulesView extends React.Component {
    state = {
        showForm: false,
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
        // add some default values for the rule
        values.code = 'if (eq(event.type, \'ticket-message-created\')) {}'
        values.code_ast = getAST(values.code)
        values.code = getCode(values.code_ast)
        return this.props.actions.rules.create(values)
            .then(() => {
                this._hideForm()
            })
    }

    render() {
        const {actions, rules} = this.props

        return (
            <div>
                <PageHeader title="Rules">
                    <Button
                        color="primary"
                        className="pull-right"
                        onClick={this._showForm}
                    >
                        Create new rule
                    </Button>
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
                {
                    rules && !rules.isEmpty() && (
                        <div className="rule-category">
                            <RuleTable
                                actions={actions}
                                rules={rules}
                            />
                        </div>
                    )
                }

                <Modal
                    header="Create new rule"
                    isOpen={this.state.showForm}
                    onClose={this._hideForm}
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
