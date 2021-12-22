import React from 'react'
import {Table} from 'reactstrap'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'

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

import RuleRow from './RuleRow'

import css from './RulesTable.less'

type OwnProps = {
    rules: Rule[]
    limitStatus: RuleLimitStatus
}

export function RulesTable({
    rules,
    limitStatus,
    notify,
    rulesReordered,
}: OwnProps & ConnectedProps<typeof connector>) {
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

    return (
        <div className="rule-category">
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
        </div>
    )
}

const connector = connect(null, {
    rulesReordered,
    notify,
})
export default connector(RulesTable)
