import React, { ComponentProps } from 'react'

import classNames from 'classnames'

import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import { isExtraLargeScreen } from 'pages/common/utils/mobile'
import ChannelListCell from 'pages/settings/SLAs/features/SLAList/views/ChannelListCell'
import DatetimeCell from 'pages/settings/SLAs/features/SLAList/views/DatetimeCell'
import ToggleCell from 'pages/settings/SLAs/features/SLAList/views/ToggleCell'

import { TableColumn } from '../types'

import css from './SLAListView.less'

export const columnConfig: ComponentProps<typeof HeaderCellProperty>[] = [
    {
        title: 'SLAs trigger in the order below',
        children: (
            <i className={classNames('material-icons', css.orderIcon)}>
                arrow_downward
            </i>
        ),
    },
    { title: 'Last updated' },
    { title: 'Channels' },
]

export const columnOrder = [
    TableColumn.PolicyName,
    TableColumn.UpdatedDatetime,
    TableColumn.Channels,
]

export const getColumnWidth = (column: TableColumn) => {
    switch (column) {
        case TableColumn.PolicyName:
            return undefined
        case TableColumn.UpdatedDatetime:
            return isExtraLargeScreen() ? 200 : 400
        case TableColumn.Channels:
            return isExtraLargeScreen() ? 200 : 400
    }
}

export const getTableCell = (cell: TableColumn) => {
    switch (cell) {
        case TableColumn.PolicyName:
            return ToggleCell
        case TableColumn.UpdatedDatetime:
            return DatetimeCell
        case TableColumn.Channels:
            return ChannelListCell
        default:
            return ''
    }
}
