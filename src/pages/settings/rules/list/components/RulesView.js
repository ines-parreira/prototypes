import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import moment from 'moment'
import _xor from 'lodash/xor'
import {
    Button,
    Container,
    Table
} from 'reactstrap'

import Modal from '../../../../common/components/Modal'
import PageHeader from '../../../../common/components/PageHeader'

import RuleForm from './RuleForm'
import RuleRow from './RuleRow'
import ReactSortable from '../../../../common/components/dragging/ReactSortable'
import {getAST, getCode} from '../../../../../utils'

export default class RulesView extends React.Component {
    state = {
        showForm: false,
        openedRules: [],
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
        values.event_types = 'ticket-created'
        values.code = ''
        values.code_ast = getAST(values.code)
        values.code = getCode(values.code_ast)
        values.deactivated_datetime = moment().format()
        return this.props.actions.rules.create(values)
            .then(({rule}) => {
                this._hideForm()

                // when new rule is created, open it immediately
                if (rule) {
                    this._toggleRuleOpening(rule.id)
                }
            })
    }

    _toggleRuleOpening = (id) => {
        this.setState({
            openedRules: _xor(this.state.openedRules, [id])
        })
    }

    _updateOrder = (orders) => {
        const priorities = orders.map((id, index) => {
            return {
                id: parseInt(id),
                priority: orders.length - index,
            }
        })

        this.props.actions.rules.updateOrder(priorities)
    }

    render() {
        const {actions, rules} = this.props

        return (
            <div className="full-width">
                <PageHeader title="Rules">
                    <Button
                        type="submit"
                        color="success"
                        className="float-right"
                        onClick={this._showForm}
                    >
                        Create new rule
                    </Button>
                </PageHeader>

                <Container fluid className="page-container">
                    <div className="mb-3">
                        <p>
                            Rules provide a way to control the behavior of Gorgias during certain events or perform periodic
                            tasks.
                        </p>
                        <p>
                            For example you can automatically add a 'refund' tag on a ticket if the subject contains
                            the text 'refund' or send a satisfaction survey after the ticket was closed for more than 48h.
                        </p>
                        <p>
                            Rules are going to be executed in the order they are sorted by below.
                        </p>
                    </div>

                    {
                        !rules.isEmpty() && (
                            <div className="rule-category">
                                <Table hover>
                                    <ReactSortable
                                        tag="tbody"
                                        options={{
                                            sort: true,
                                            draggable: '.draggable',
                                            handle: '.drag-handle',
                                            animation: 150,
                                        }}
                                        onChange={this._updateOrder}
                                    >
                                        {
                                            rules.map((rule, i) => {
                                                const id = rule.get('id')

                                                return (
                                                    <RuleRow
                                                        actions={actions}
                                                        key={i}
                                                        rule={rule}
                                                        toggleOpening={() => this._toggleRuleOpening(id)}
                                                        isOpen={this.state.openedRules.includes(id)}
                                                    />
                                                )
                                            }).toList()
                                        }
                                    </ReactSortable>
                                </Table>
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
                </Container>
            </div>
        )
    }
}

RulesView.propTypes = {
    actions: PropTypes.object,
    rules: PropTypes.object,
}

RulesView.defaultProps = {
    rules: fromJS([]),
}
