// @flow
import React from 'react'
import {fromJS, List} from 'immutable'
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
import RuleRow from './RuleRow/RuleRow'
import ReactSortable from '../../../../common/components/dragging/ReactSortable'
import {getAST, getCode} from '../../../../../utils'


type Props = {
    rules: List<*>,
    actions: Object,

    // Router
    location: Object,
}

type State = {
    showForm: boolean,
    openedRules: [],
    hasScrolled: boolean
}

export default class RulesView extends React.Component<Props, State> {
    static defaultProps = {
        rules: fromJS([]),
    }

    state = {
        showForm: false,
        openedRules: [],
        hasScrolled: false
    }

    componentWillMount() {
        const {location} = this.props
        const ruleId = location.query.ruleId

        if (ruleId) {
            this._toggleRuleOpening(parseInt(ruleId))
        }

        this.props.actions.rules.fetchRules()
    }

    componentWillReceiveProps(nextProps: Props) {
        const {location} = this.props
        const {hasScrolled} = this.state
        const ruleId = location.query.ruleId

        if (ruleId && !nextProps.rules.isEmpty() && !hasScrolled) {
            this.setState({hasScrolled: true}, () => {
                const elt = document.getElementById(ruleId)

                if (elt) {
                    elt.scrollIntoView()
                }
            })
        }
    }

    _showForm = () => {
        this.setState({showForm: true})
    }

    _hideForm = () => {
        this.setState({showForm: false})
    }

    _handleSubmit = (values: Object) => {
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
                this._toggleRuleOpening(rule.id)
            })
    }

    _toggleRuleOpening = (id: number) => {
        this.setState({
            openedRules: _xor(this.state.openedRules, [id])
        })
    }

    _updateOrder = (orders: Object) => {
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
                            Rules provide a way to automatically perform actions on tickets, like tagging, assigning{' '}
                            or even responding.
                        </p>

                        <p>
                            Learn more about how to setup rules{' '}
                            <a
                                href="https://docs.gorgias.io/tickets/rules"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                in our docs
                            </a>.
                        </p>

                        <p>
                            Rules are going to be executed in the order they are sorted by below.
                        </p>
                    </div>
                </Container>

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
                                        rules.map((rule) => {
                                            const id = rule.get('id')

                                            return (
                                                <RuleRow
                                                    actions={actions}
                                                    key={id}
                                                    rule={rule}
                                                    toggleOpening={this._toggleRuleOpening}
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
            </div>
        )
    }
}
