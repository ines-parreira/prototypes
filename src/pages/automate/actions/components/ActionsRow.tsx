import React, {useMemo} from 'react'
import {useLocation, useParams} from 'react-router-dom'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import Tooltip from 'pages/common/components/Tooltip'
import history from 'pages/history'
import ToggleInput from 'pages/common/forms/ToggleInput'

import useDimensions from 'hooks/useDimensions'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'
import {formatDatetime} from 'utils'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import webhooksIcon from 'assets/img/icons/webhooks.svg'
import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
import useDeleteAction from '../hooks/useDeleteAction'
import useUpsertAction from '../hooks/useUpsertAction'

import {StoreWorkflowsConfiguration} from '../types'
import DeleteActionConfirmation from './DeleteActionConfirmation'

import css from './ActionsRow.less'

type Props = {
    action: StoreWorkflowsConfiguration
}

const getBodyCellElementId = (actionId: string) =>
    `action-body-cell-${actionId}`

export default function WorkflowRow({action}: Props) {
    const location = useLocation()
    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()

    const [actionCellRef, actionCellRefDimension] = useDimensions()
    const [actionNameRef, actionNameRefDimension] = useDimensions()

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

    const {data: templateConfigurations} = useGetWorkflowConfigurationTemplates(
        ['llm-prompt']
    )

    const isCustomAction = !action.template_internal_id

    const templateConfiguration = useMemo(
        () =>
            templateConfigurations?.find(
                (template) =>
                    template.internal_id === action.template_internal_id
            ),
        [action.template_internal_id, templateConfigurations]
    )

    const llmConversationEntryPoint = useMemo(
        () =>
            action.entrypoints.find(
                (entrypoint) => entrypoint.kind === 'llm-conversation'
            ),
        [action.entrypoints]
    )

    const isActionNameOverflow = useMemo(() => {
        if (!actionCellRefDimension || !actionNameRefDimension) {
            return false
        }
        const imageOffset = 40
        if (
            actionCellRefDimension.width <
            actionNameRefDimension.width + imageOffset
        ) {
            return true
        }
        return false
    }, [actionCellRefDimension, actionNameRefDimension])

    const actionDisplayName = useMemo(() => {
        if (isCustomAction) {
            return 'Custom'
        }
        return templateConfiguration?.name ?? ''
    }, [isCustomAction, templateConfiguration?.name])

    const appImageUrl = useGetAppImageUrl(action?.apps?.[0])

    return (
        <TableBodyRow
            className={css.container}
            onClick={() => {
                history.push(`${location.pathname}/edit/${action.id}`)
            }}
        >
            <BodyCell className={css.name}>{action.name}</BodyCell>
            <BodyCell
                id={getBodyCellElementId(action.id)}
                innerClassName={css.innerActionCell}
                className={css.actionCell}
                size="small"
                justifyContent="left"
                ref={actionCellRef}
            >
                {isCustomAction ? (
                    <img src={webhooksIcon} alt={'webhooks'} />
                ) : (
                    <>
                        {appImageUrl ? (
                            <img
                                src={appImageUrl}
                                alt={action?.apps?.[0].type}
                            />
                        ) : (
                            <div className={css.appImageFiller}></div>
                        )}
                    </>
                )}
                <span ref={actionNameRef}>{actionDisplayName}</span>
                {isActionNameOverflow && (
                    <Tooltip
                        placement="top-end"
                        target={getBodyCellElementId(action.id)}
                    >
                        {actionDisplayName}
                    </Tooltip>
                )}
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
