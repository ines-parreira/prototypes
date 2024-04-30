import React from 'react'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import {UISLAPolicy} from 'pages/settings/SLAs/features/SLAList/types'

import PageHeader from '../../PageHeader/PageHeader'

import {columnConfig} from './config'
import Header from './Header'
import TableRow from './TableRow'
import css from './SLAListView.less'

export default function SLAListView({data}: {data: UISLAPolicy[]}) {
    return (
        <div className={css.pageContainer}>
            <PageHeader />
            <Header />
            <TableWrapper>
                <TableHead>
                    {columnConfig.map((config, index) => (
                        <HeaderCellProperty
                            {...config}
                            className={css.headerCell}
                            titleClassName={css.headerCellTitle}
                            key={index}
                            wrapContent
                        />
                    ))}
                </TableHead>
                <TableBody>
                    {data.map((policy) => (
                        <TableRow policy={policy} key={policy.uuid} />
                    ))}
                </TableBody>
            </TableWrapper>
        </div>
    )
}
