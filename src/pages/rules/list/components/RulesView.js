import React, {PropTypes} from 'react'

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
                <RuleTable actions={actions} currentUser={currentUser} rules={rules} schemas={schemas} />
                <Modal isShow={this.state.showForm} header="Create New Rule">
                    <RuleForm onSubmit={this._handleSubmit} onCancel={this._hideForm} />
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
