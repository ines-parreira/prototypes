import React, {useEffect, useState} from 'react'
import {Table} from 'reactstrap'
import classnames from 'classnames'

import AutomationSubscriptionModal from 'pages/settings/billing/automation/AutomationSubscriptionModal'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import ReactSortable from '../../../common/components/dragging/ReactSortable'
import {
    Rule,
    RuleLimitStatus,
    RulePriority,
} from '../../../../state/rules/types'
import {activateRule, reorderRules} from '../../../../models/rule/resources'
import {NotificationStatus} from '../../../../state/notifications/types'
import {notify} from '../../../../state/notifications/actions'
import {
    rulesReordered,
    ruleUpdated,
} from '../../../../state/entities/rules/actions'

import RuleRow from './components/RuleRow'

import css from './RulesList.less'

type Props = {
    rules: Rule[]
    limitStatus: RuleLimitStatus
    shouldDisplayError?: boolean
    searchTerm?: string
}

export function RulesList({
    rules,
    limitStatus,
    searchTerm = '',
    shouldDisplayError = false,
}: Props) {
    const dispatch = useAppDispatch()
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
            await reorderRules(priorities)
            void dispatch(rulesReordered(priorities))
        } catch (error) {
            void dispatch(
                notify({
                    message: 'Failed to reorder rules',
                    status: NotificationStatus.Error,
                })
            )
            rulesReordered(oldPriorities)
        }
    }

    const [managedRuleUpgradeID, setManagedRuleUpgradeID] = useState<
        number | undefined
    >()

    const [filteredRules, setFilteredRules] = useState(rules)
    const filterRules = (ruleList: Rule[], searchTerm: string) =>
        ruleList.filter((rule) =>
            rule.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

    useEffect(() => {
        setFilteredRules(filterRules(rules, searchTerm))
    }, [rules, searchTerm])

    const handleActivate = async (id: number) => {
        try {
            const res = await activateRule(id)
            void dispatch(ruleUpdated(res))
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Rule activated successfully',
                })
            )
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Unable to activate rule',
                })
            )
        }
    }

    const handleUpgrade = () => {
        void handleActivate(managedRuleUpgradeID!)
        setManagedRuleUpgradeID(undefined)
    }

    return (
        <div className="rule-category">
            {!!rules.length && (
                <Table hover className="mb-0">
                    <thead className="border-0">
                        <tr>
                            <td>
                                <i
                                    className={classnames(
                                        'material-icons',
                                        css.arrowIcon
                                    )}
                                >
                                    arrow_downward
                                </i>
                            </td>
                            <td colSpan={2}>
                                rules trigger in the order below
                            </td>
                            <td className="text-nowrap">last updated</td>
                            <td></td>
                        </tr>
                    </thead>
                    <ReactSortable
                        tag="tbody"
                        options={{
                            sort: true,
                            draggable: '.draggable',
                            handle: '.drag-handle',
                            animation: 150,
                            disabled: !!searchTerm,
                        }}
                        onChange={handleReordering}
                    >
                        {filteredRules.map((rule) => (
                            <RuleRow
                                key={rule.id}
                                rule={rule}
                                canDuplicate={
                                    limitStatus !== RuleLimitStatus.Reached
                                }
                                handleUpgrade={setManagedRuleUpgradeID}
                                onActivate={handleActivate}
                                shouldDisplayError={shouldDisplayError}
                                isSearching={!!searchTerm}
                            />
                        ))}
                    </ReactSortable>
                </Table>
            )}
            <AutomationSubscriptionModal
                onClose={() => setManagedRuleUpgradeID(undefined)}
                confirmLabel="Upgrade and reactivate"
                onSubscribe={handleUpgrade}
                isOpen={!!managedRuleUpgradeID}
            />
        </div>
    )
}

export default RulesList
