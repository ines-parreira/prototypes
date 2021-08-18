import React, {useMemo, useState, useEffect, useCallback} from 'react'
import classnames from 'classnames'
import _xor from 'lodash/xor'
import {Alert, Button, Container, Table} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {parse} from 'query-string'

import Modal from '../../../../common/components/Modal'
import PageHeader from '../../../../common/components/PageHeader'

import ReactSortable from '../../../../common/components/dragging/ReactSortable'
import Video from '../../../../common/components/Video/Video'

import {RuleLimitStatus, RulePriority} from '../../../../../state/rules/types'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {RootState} from '../../../../../state/types'
import {
    rulesFetched,
    rulesReordered,
} from '../../../../../state/entities/rules/actions'
import {
    getRulesLimitStatus,
    getSortedRules,
} from '../../../../../state/entities/rules/selectors'
import {fetchRules, reorderRules} from '../../../../../models/rule/resources'
import {notify} from '../../../../../state/notifications/actions'

import RuleRow from './RuleRow/RuleRow'
import RuleForm from './RuleForm'

import css from './RulesView.less'

type Props = {location: {search: string}} & ConnectedProps<typeof connector>

export function RulesViewContainer({
    limitStatus,
    rulesFetched,
    rulesReordered,
    notify,
    rules,
    location,
}: Props) {
    const [showForm, setShowForm] = useState(false)
    const [openedRules, setOpenedRules] = useState<number[]>([])
    const [hasScrolled, setHasScrolled] = useState(false)
    const ruleId = useMemo(() => parse(location.search).ruleId as string, [
        location,
    ])

    const handleFetch = async () => {
        try {
            const res = await fetchRules()
            rulesFetched(res.data)
        } catch (error) {
            void notify({
                message: 'Failed to fetch rules',
                status: NotificationStatus.Error,
            })
        }
    }

    const handleReordering = async (orders: string[]) => {
        const priorities = orders.map(
            (id, index) =>
                ({
                    id: parseInt(id),
                    priority: orders.length - index,
                } as RulePriority)
        )
        const oldPriorities = rules.map(
            (rule) =>
                ({
                    id: rule.id,
                    priority: rule.priority,
                } as RulePriority)
        )
        try {
            rulesReordered(priorities)
            await reorderRules(priorities)
        } catch (error) {
            rulesReordered(oldPriorities)
            void notify({
                message: 'Failed to reorder rules',
                status: NotificationStatus.Error,
            })
        }
    }

    const handleSubmit = (id: number) => {
        setShowForm(false)
        toggleRuleOpening(id)
    }

    const toggleRuleOpening = useCallback(
        (ids: number | number[]) => {
            if (typeof ids === 'number') {
                setOpenedRules(_xor(openedRules, [ids]))
            } else {
                setOpenedRules(_xor(openedRules, ids))
            }
        },
        [openedRules]
    )

    useEffect(() => {
        void handleFetch()
        if (ruleId) {
            toggleRuleOpening(parseInt(ruleId))
        }
    }, [])

    useEffect(() => {
        if (ruleId && rules.length && !hasScrolled) {
            const elt: HTMLElement | null = document.getElementById(ruleId)
            if (elt) {
                elt.scrollIntoView()
                setHasScrolled(true)
            }
        }
    }, [rules, ruleId, hasScrolled])

    return (
        <div className="full-width">
            <PageHeader title="Rules">
                <Button
                    type="submit"
                    color="success"
                    className="float-right"
                    onClick={() => setShowForm(true)}
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
                        Rules provide a way to automatically perform actions on
                        tickets, like tagging, assigning or even responding.
                    </p>

                    <p>
                        Learn more about how to setup rules{' '}
                        <a
                            href="https://docs.gorgias.com/rules"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            in our docs
                        </a>
                        .
                    </p>

                    <p>
                        Rules are executed depending on triggering events and in
                        the order they are listed on this page.{' '}
                        <a
                            href="https://docs.gorgias.com/rules/rules-faq"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Learn more about rules execution
                        </a>
                        .
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
                                    <b> {rules.length} rules of 70 </b>
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
                                <b>Your account has reached the rule limit.</b>
                                To add more rules, please delete any inactive
                                rules.
                            </span>
                        </Alert>
                    )}
                </div>
                <Video videoId="0fIboyInGDg" legend="Working with rules" />
            </Container>

            {rules.length && (
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
                            onChange={handleReordering}
                        >
                            {rules.map((rule) => (
                                <RuleRow
                                    key={rule.id}
                                    rule={rule}
                                    toggleOpening={toggleRuleOpening}
                                    isOpen={openedRules.includes(rule.id)}
                                    canDuplicate={
                                        limitStatus !== RuleLimitStatus.Reached
                                    }
                                />
                            ))}
                        </ReactSortable>
                    </Table>
                </div>
            )}

            <Modal
                header="Create new rule"
                isOpen={showForm}
                onClose={() => setShowForm(false)}
            >
                <RuleForm
                    onSubmit={handleSubmit}
                    onCancel={() => setShowForm(false)}
                />
            </Modal>
        </div>
    )
}

const connector = connect(
    (state: RootState) => {
        return {
            rules: getSortedRules(state),
            limitStatus: getRulesLimitStatus(state),
        }
    },
    {
        rulesFetched,
        rulesReordered,
        notify,
    }
)

export default withRouter(connector(RulesViewContainer))
