import React, {useMemo} from 'react'
import {useLocation, useParams} from 'react-router-dom'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import history from 'pages/history'
import ToggleInput from 'pages/common/forms/ToggleInput'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'
import {formatDatetime} from 'utils'
import useDeleteAction from '../hooks/useDeleteAction'
import useUpsertAction from '../hooks/useUpsertAction'
import ActionTypeIcon from '../components/ActionTypeIcon'

import {StoreWorkflowsConfiguration} from '../types'
import DeleteActionConfirmation from './DeleteActionConfirmation'

import css from './ActionsRow.less'

type Props = {
    action: StoreWorkflowsConfiguration
}

export default function WorkflowRow({action}: Props) {
    const location = useLocation()
    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()

    const {mutate: deleteAction, isLoading: isDeletingAction} = useDeleteAction(
        action.name,
        shopName,
        shopType
    )

    const {mutate: updateAction, isLoading: isActionUpdating} = useUpsertAction(
        'update',
        shopName,
        shopType
    )

    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate
    )

    function handleToggleAction(_nextValue: boolean, event: React.MouseEvent) {
        event.stopPropagation()
        const updatedAction = {
            ...action,
            entrypoints: action.entrypoints.map((entrypoint) =>
                entrypoint.kind === 'llm-conversation'
                    ? {
                          ...entrypoint,
                          deactivated_datetime: entrypoint.deactivated_datetime
                              ? null
                              : new Date().toISOString(),
                      }
                    : entrypoint
            ),
        }

        if (shopType !== 'shopify') {
            throw new Error('Unsupported shop type')
        }

        updateAction([
            {
                internal_id: updatedAction.internal_id,
                store_name: shopName,
                store_type: shopType,
            },
            updatedAction,
        ])
    }

    const llmConversationEntryPoint = useMemo(
        () =>
            action.entrypoints.find(
                (entrypoint) => entrypoint.kind === 'llm-conversation'
            ),
        [action.entrypoints]
    )

    return (
        <TableBodyRow
            className={css.container}
            onClick={() => {
                history.push(`${location.pathname}/edit/${action.id}`)
            }}
        >
            <BodyCell className={css.name}>{action.name}</BodyCell>
            <BodyCell size="small" justifyContent="left">
                <ActionTypeIcon type="custom" />
            </BodyCell>
            <BodyCell
                onClick={(event) => {
                    if (isActionUpdating) event.stopPropagation()
                }}
                justifyContent="left"
                size="smallest"
            >
                <ToggleInput
                    isLoading={isActionUpdating}
                    onClick={handleToggleAction}
                    isToggled={
                        llmConversationEntryPoint?.deactivated_datetime === null
                    }
                />
            </BodyCell>
            <BodyCell size="smallest" justifyContent="left">
                {action.updated_datetime &&
                    formatDatetime(action.updated_datetime, datetimeFormat)}
            </BodyCell>
            <BodyCell
                size="smallest"
                onClick={(event) => {
                    event.stopPropagation()
                }}
            >
                <DeleteActionConfirmation
                    onDelete={() => {
                        void deleteAction([{internal_id: action.internal_id}])
                    }}
                    isUpdatePending={isDeletingAction}
                />
            </BodyCell>
        </TableBodyRow>
    )
}
