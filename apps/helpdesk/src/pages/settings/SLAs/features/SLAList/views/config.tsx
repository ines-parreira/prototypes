import type { ComponentProps, ComponentType } from 'react'
import React from 'react'

import classNames from 'classnames'

import type HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import { isExtraLargeScreen } from 'pages/common/utils/mobile'
import ChannelListCell from 'pages/settings/SLAs/features/SLAList/views/ChannelListCell'
import ConditionsCell from 'pages/settings/SLAs/features/SLAList/views/ConditionsCell'
import DatetimeCell from 'pages/settings/SLAs/features/SLAList/views/DatetimeCell'
import RowNumberCell from 'pages/settings/SLAs/features/SLAList/views/RowNumberCell'
import ToggleCell from 'pages/settings/SLAs/features/SLAList/views/ToggleCell'

import { TableColumn } from '../types'

import css from './SLAListView.less'

export const columnConfig: ComponentProps<typeof HeaderCellProperty>[] = [
    { title: '#' },
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
    { title: 'Conditions' },
]

export const columnOrder = [
    TableColumn.RowNumber,
    TableColumn.PolicyName,
    TableColumn.UpdatedDatetime,
    TableColumn.Channels,
    TableColumn.Conditions,
]

export const getColumnWidth = (column: TableColumn) => {
    switch (column) {
        case TableColumn.PolicyName:
            return undefined
        case TableColumn.UpdatedDatetime:
            return isExtraLargeScreen() ? 200 : 400
        case TableColumn.Channels:
            return isExtraLargeScreen() ? 200 : 400
        case TableColumn.Conditions:
            return isExtraLargeScreen() ? 200 : 400
    }
}

export const getTableCell = (cell: TableColumn): ComponentType<any> | '' => {
    switch (cell) {
        case TableColumn.RowNumber:
            return RowNumberCell
        case TableColumn.PolicyName:
            return ToggleCell
        case TableColumn.UpdatedDatetime:
            return DatetimeCell
        case TableColumn.Channels:
            return ChannelListCell
        case TableColumn.Conditions:
            return ConditionsCell
        default:
            return ''
    }
}
