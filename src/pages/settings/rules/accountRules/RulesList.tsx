import React, {useMemo} from 'react'
import {Table} from 'reactstrap'
import classnames from 'classnames'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import ReactSortable from '../../../common/components/dragging/ReactSortable'
import {
    Rule,
    RuleLimitStatus,
    RulePriority,
} from '../../../../state/rules/types'
import {reorderRules} from '../../../../models/rule/resources'
import {NotificationStatus} from '../../../../state/notifications/types'
import {notify} from '../../../../state/notifications/actions'
import {rulesReordered} from '../../../../state/entities/rules/actions'

import RuleRow from './components/RuleRow'
import UpsellComponent from './components/RuleGettingStarted'

import css from './RulesList.less'

type Props = {
    rules: Rule[]
    limitStatus: RuleLimitStatus
    handleGoToLibrary: () => void
}

export function RulesList({rules, limitStatus, handleGoToLibrary}: Props) {
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
                    <thead
                        className={classnames(
                            'text-faded',
                            'border-0',
                            css.tableHeader
                        )}
                    >
                        <tr>
                            <td></td>
                            <td>rule</td>
                            <td></td>
                            <td>last updated</td>
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
                            />
                        ))}
                    </ReactSortable>
                </Table>
            )}
            {hasOnlyDefaultRules && (
                <UpsellComponent goToLibrary={handleGoToLibrary} />
            )}
        </div>
    )
}

export default RulesList
