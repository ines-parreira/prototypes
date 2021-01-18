import React, {ComponentType} from 'react'
import {fromJS, Map} from 'immutable'
import moment from 'moment'
import classnames from 'classnames'
import _xor from 'lodash/xor'
import {Alert, Button, Container, Table} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {parse} from 'query-string'

import Modal from '../../../../common/components/Modal.js'
import PageHeader from '../../../../common/components/PageHeader'

import ReactSortable from '../../../../common/components/dragging/ReactSortable.js'
import {getAST, getCode} from '../../../../../utils'
import Video from '../../../../common/components/Video/index.js'

import {RuleDraft, RuleLimitStatus} from '../../../../../state/rules/types'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {RootState} from '../../../../../state/types'
import {
    getSortedRules,
    getRulesLimitStatus,
} from '../../../../../state/rules/selectors'
import * as ruleActions from '../../../../../state/rules/actions'
import {notify} from '../../../../../state/notifications/actions'

import RuleRow from './RuleRow/RuleRow'
import RuleForm from './RuleForm.js'
import css from './RulesView.less'

type State = {
    showForm: boolean
    openedRules: number[]
    hasScrolled: boolean
}

type Props = RouteComponentProps & ConnectedProps<typeof connector>

export class RulesView extends React.Component<Props, State> {
    static defaultProps: Partial<Props> = {
        rules: fromJS([]),
    }

    state = {
        showForm: false,
        openedRules: [] as number[],
        hasScrolled: false,
    }

    componentWillMount() {
        const {location} = this.props
        const ruleId = parse(location.search).ruleId as string

        if (ruleId) {
            this._toggleRuleOpening(parseInt(ruleId))
        }

        void this.props.fetchRules()
    }

    componentWillReceiveProps(nextProps: Props) {
        const {location} = this.props
        const {hasScrolled} = this.state
        const ruleId = parse(location.search).ruleId as string

        if (ruleId && !nextProps.rules.isEmpty() && !hasScrolled) {
            this.setState({hasScrolled: true}, () => {
                const elt: HTMLElement | null = document.getElementById(ruleId)

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

    _handleSubmit = (values: Partial<RuleDraft>) => {
        // add some default values for the rule
        if (this.props.limitStatus !== RuleLimitStatus.Reached) {
            values.event_types = 'ticket-created'
            values.code = ''
            values.code_ast = getAST(values.code)
            values.code = getCode(values.code_ast)
            values.deactivated_datetime = moment().format()
            return this.props.create(values).then((res) => {
                const {rule} = res as ReturnType<typeof ruleActions.addRuleEnd>
                this._hideForm()
                // when new rule is created, open it immediately
                this._toggleRuleOpening(rule.id)
            })
        }
        void this.props.notify({
            message:
                'Your account has reached the rule limit. To add more rules, please delete any inactive rules.',
            status: NotificationStatus.Error,
        })
        return Promise.reject()
    }

    _toggleRuleOpening = (id: number) => {
        this.setState({
            openedRules: _xor(this.state.openedRules, [id]),
        })
    }

    _updateOrder = (orders: string[]) => {
        const priorities = orders.map((id, index) => {
            return {
                id: parseInt(id),
                priority: orders.length - index,
            }
        })

        void this.props.updateOrder(priorities)
    }

    render() {
        const {rules, limitStatus} = this.props

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

                <Container
                    fluid
                    className={classnames('page-container', css.description)}
                >
                    <div className="mb-3">
                        <p>
                            Rules provide a way to automatically perform actions
                            on tickets, like tagging, assigning or even
                            responding.
                        </p>

                        <p>
                            Learn more about how to setup rules{' '}
                            <a
                                href="https://docs.gorgias.com/rules-auto/rules"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                in our docs
                            </a>
                            .
                        </p>

                        <p>
                            Rules are going to be executed in the order they are
                            sorted by below.
                        </p>
                        {limitStatus === RuleLimitStatus.Reaching && (
                            <Alert color="warning">
                                <span
                                    className={classnames(
                                        'd-flex',
                                        'align-items-center',
                                        css.statusInfo
                                    )}
                                >
                                    <i className="material-icons mr-2">info</i>
                                    <span>
                                        You are using
                                        <b> {rules.size} rules of 70 </b>
                                        allowed on Gorgias. To add more rules,
                                        please delete any inactive rules.
                                    </span>
                                </span>
                            </Alert>
                        )}
                        {limitStatus === RuleLimitStatus.Reached && (
                            <Alert color="danger">
                                <span
                                    className={classnames(
                                        'd-flex',
                                        'align-items-center',
                                        css.statusInfo
                                    )}
                                >
                                    <i className="material-icons mr-2">error</i>
                                    <b>
                                        Your account has reached the rule limit.
                                    </b>
                                    To add more rules, please delete any
                                    inactive rules.
                                </span>
                            </Alert>
                        )}
                    </div>
                    <Video videoId="0fIboyInGDg" legend="Working with rules" />
                </Container>

                {!rules.isEmpty() && (
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
                                {rules
                                    .map((rule) => {
                                        const id: number = (rule as Map<
                                            any,
                                            any
                                        >).get('id')

                                        return (
                                            <RuleRow
                                                key={id}
                                                rule={rule}
                                                toggleOpening={
                                                    this._toggleRuleOpening
                                                }
                                                isOpen={this.state.openedRules.includes(
                                                    id
                                                )}
                                                canDuplicate={
                                                    limitStatus !==
                                                    RuleLimitStatus.Reached
                                                }
                                            />
                                        )
                                    })
                                    .toList()}
                            </ReactSortable>
                        </Table>
                    </div>
                )}

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

const connector = connect(
    (state: RootState) => {
        const rules = getSortedRules(state)
        return {
            rules,
            limitStatus: getRulesLimitStatus(state),
        }
    },
    {
        create: ruleActions.create,
        fetchRules: ruleActions.fetchRules,
        updateOrder: ruleActions.updateOrder,
        notify: notify,
    }
)

export default withRouter(connector(RulesView as ComponentType<Props>))
