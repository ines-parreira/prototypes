import React from 'react'

import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {
    OnPolicyPriorityChangeFn,
    OnTogglePolicyFn,
    UISLAPolicy,
} from 'pages/settings/SLAs/features/SLAList/types'

import PageHeader from '../../PageHeader/PageHeader'
import { columnConfig } from './config'
import Header from './Header'
import TableRow from './TableRow'
import useSortablePolicies from './useSortablePolicies'

import css from './SLAListView.less'

type SLAListViewProps = {
    data: UISLAPolicy[]
    onTogglePolicy: OnTogglePolicyFn
    onPolicyPriorityChange: OnPolicyPriorityChangeFn
    isSubmitting: boolean
}
export default function SLAListView({
    data,
    onTogglePolicy,
    onPolicyPriorityChange,
    isSubmitting,
}: SLAListViewProps) {
    const { policies, handleMovePolicy, handleDropPolicy } =
        useSortablePolicies(data, onPolicyPriorityChange)

    return (
        <div className={css.pageContainer}>
            <PageHeader />
            <Header />
            <TableWrapper>
                <TableHead>
                    {columnConfig.map((config, index) => (
                        <HeaderCellProperty
                            key={index}
                            {...config}
                            className={css.headerCell}
                            titleClassName={css.headerCellTitle}
                            wrapContent
                        />
                    ))}
                </TableHead>
                <TableBody>
                    {policies.map((policy, index) => (
                        <TableRow
                            policy={policy}
                            key={policy.uuid}
                            onToggle={onTogglePolicy}
                            dragItem={{
                                id: policy.uuid,
                                position: index,
                                type: 'sla-policy-row',
                            }}
                            onMovePolicy={handleMovePolicy}
                            onDropPolicy={handleDropPolicy}
                            isSubmitting={isSubmitting}
                        />
                    ))}
                </TableBody>
            </TableWrapper>
        </div>
    )
}
