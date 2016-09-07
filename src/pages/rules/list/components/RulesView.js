import React from 'react'

import Modal from '../../../common/components/Modal'
import PageHeader from '../../../common/components/PageHeader'

import RuleForm from './RuleForm'
import RuleTable from './RuleTable'

class RulesView extends React.Component {

    constructor() {
        super()
        this.state = { showForm: false }
    }

    componentWillMount() {
        this.props.actions.rules.fetchRules()
        this.props.actions.schemas.fetch()
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
        const {rules, schemas, actions} = this.props

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
                <RuleTable rules={rules} schemas={schemas} actions={actions} />
                <Modal isShow={this.state.showForm} header="Create New Rule">
                    <RuleForm onSubmit={this._handleSubmit} onCancel={this._hideForm} />
                </Modal>
            </div>
        )
    }

}

RulesView.propTypes = {
    actions: React.PropTypes.object,
    rules: React.PropTypes.object,
    schemas: React.PropTypes.object,
}

export default RulesView
