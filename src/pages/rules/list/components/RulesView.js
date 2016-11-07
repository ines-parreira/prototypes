import React, {PropTypes} from 'react'

import Modal from '../../../common/components/Modal'
import PageHeader from '../../../common/components/PageHeader'

import RuleForm from './RuleForm'
import RuleTable from './RuleTable'

class RulesView extends React.Component {
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
        this.props.actions.rules.create(values)
    }

    render() {
        const {actions, currentUser, rules, schemas} = this.props

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
                <RuleTable
                    actions={actions}
                    currentUser={currentUser}
                    rules={rules}
                    schemas={schemas}
                />
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
    currentUser: PropTypes.object,
    rules: PropTypes.object,
    schemas: PropTypes.object,
}

export default RulesView
