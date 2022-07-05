import React, {useMemo, useState} from 'react'
import {Table} from 'reactstrap'

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
import UpsellComponent from './components/RuleGettingStarted'

type Props = {
    rules: Rule[]
    limitStatus: RuleLimitStatus
    handleGoToLibrary: () => void
    shouldDisplayError?: boolean
}

export function RulesList({
    rules,
    limitStatus,
    handleGoToLibrary,
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
                    message: 'Unable to deactivate rule',
                })
            )
        }
    }

    const handleUpgrade = () => {
        void handleActivate(managedRuleUpgradeID!)
        setManagedRuleUpgradeID(undefined)
    }

    const hasOnlyDefaultRules = useMemo(
        () =>
            !rules.some(
                (rule) =>
                    rule.name !== '[Auto Tag] Primary Categories' &&
                    rule.name !== '[Auto Tag] Social'
            ),
        [rules]
    )

    return (
        <div className="rule-category">
            {!!rules.length && (
                <Table hover>
                    <thead className="border-0">
                        <tr>
                            <td></td>
                            <td>rule</td>
                            <td></td>
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
                        }}
                        onChange={handleReordering}
                    >
                        {rules.map((rule) => (
                            <RuleRow
                                key={rule.id}
                                rule={rule}
                                canDuplicate={
                                    limitStatus !== RuleLimitStatus.Reached
                                }
                                handleUpgrade={setManagedRuleUpgradeID}
                                onActivate={handleActivate}
                                shouldDisplayError={shouldDisplayError}
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
            {hasOnlyDefaultRules && (
                <UpsellComponent goToLibrary={handleGoToLibrary} />
            )}
        </div>
    )
}

export default RulesList
