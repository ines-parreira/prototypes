import React, {useMemo, useState} from 'react'
import {Link, useLocation, useParams} from 'react-router-dom'
import classNames from 'classnames'
import {Tooltip} from '@gorgias/ui-kit'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import history from 'pages/history'
import ToggleInput from 'pages/common/forms/ToggleInput'

import useDimensions from 'hooks/useDimensions'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'
import {formatDatetime} from 'utils'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import webhooksIcon from 'assets/img/icons/webhooks.svg'
import useGetActionAppIntegration from '../hooks/useGetActionAppIntegration'
import useGetAppImageUrl from '../hooks/useGetAppImageUrl'
import useDeleteAction from '../hooks/useDeleteAction'
import useUpsertAction from '../hooks/useUpsertAction'

import {StoreWorkflowsConfiguration} from '../types'
import AppIntegrationDisabledModal from './AppIntegrationDisabledModal'
import DeleteActionConfirmation from './DeleteActionConfirmation'

import css from './ActionsRow.less'

type Props = {
    action: StoreWorkflowsConfiguration
}

export default function ActionsRow({action}: Props) {
    const location = useLocation()
    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()

    const getActionNameTypeBodyCellElementId = `action-name-type-body-cell-${action.id}`
    const getActionNameBodyCellElementId = `action-name-body-cell-${action.id}`

    const [isDisabledAppModalOpen, setIsDisabledAppModalOpen] = useState(false)

    const disabledNativeAppWarningIconId = `disable-native-app-warning-icon-${action.id}`

    const [actionTypeCellRef, actionTypeCellRefDimension] = useDimensions()
    const [actionTypeTextRef, actionTypeTextRefDimension] = useDimensions()
    const [actionNameCellRef, actionNameCellRefDimension] = useDimensions()
    const [actionNameTextRef, actionNameTextRefDimension] = useDimensions()

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

    const actionDisplayName = useMemo(() => {
        if (isCustomAction) {
            return 'Custom'
        }
        return templateConfiguration?.name ?? ''
    }, [isCustomAction, templateConfiguration?.name])

    const actionApp = action.apps?.[0]

    const isNativeAppIntegration = !!actionApp && actionApp.type !== 'app'

    const actionAppIntegration = useGetActionAppIntegration({
        appType: actionApp?.type,
        shopName,
    })

    const appImageUrl = useGetAppImageUrl(actionApp)

    const isNativeAppIntegrationDisabled =
        isNativeAppIntegration && !actionAppIntegration

    const isActionTypeTextOverflow = useMemo(() => {
        if (!actionTypeCellRefDimension || !actionTypeTextRefDimension) {
            return false
        }
        const imageOffset = 40
        if (
            actionTypeCellRefDimension.width <
            actionTypeTextRefDimension.width + imageOffset
        ) {
            return true
        }
        return false
    }, [actionTypeCellRefDimension, actionTypeTextRefDimension])

    const isActionNameTextOverflow = useMemo(() => {
        if (!actionNameCellRefDimension || !actionNameTextRefDimension) {
            return false
        }
        const toogleIconOffset = 84 + (isNativeAppIntegrationDisabled ? 32 : 0)
        if (
            actionNameCellRefDimension.width <
            actionNameTextRefDimension.width + toogleIconOffset
        ) {
            return true
        }
        return false
    }, [
        actionNameCellRefDimension,
        actionNameTextRefDimension,
        isNativeAppIntegrationDisabled,
    ])

    return (
        <TableBodyRow
            className={css.container}
            onClick={() => {
                if (isNativeAppIntegrationDisabled) {
                    if (isDisabledAppModalOpen) return
                    setIsDisabledAppModalOpen(true)
                    return
                }
                history.push(`${location.pathname}/edit/${action.id}`)
            }}
        >
            {actionApp && (
                <AppIntegrationDisabledModal
                    templateDescription={action.description}
                    templateName={action.name}
                    actionAppConfiguration={actionApp}
                    isOpen={isDisabledAppModalOpen}
                    setOpen={setIsDisabledAppModalOpen}
                />
            )}
            <BodyCell
                ref={actionNameCellRef}
                onClick={(event) => {
                    if (isActionUpdating) event.stopPropagation()
                }}
                innerClassName={css.innerActionCell}
                className={classNames(css.ellipsis, css.nameCell)}
            >
                <div className={css.actionNameTogleGroup}>
                    <ToggleInput
                        className={css.toggleInput}
                        isLoading={isActionUpdating}
                        isDisabled={isNativeAppIntegrationDisabled}
                        onClick={handleToggleAction}
                        isToggled={
                            !isNativeAppIntegrationDisabled &&
                            llmConversationEntryPoint?.deactivated_datetime ===
                                null
                        }
                    />
                    {isNativeAppIntegrationDisabled && (
                        <>
                            <i
                                id={disabledNativeAppWarningIconId}
                                className={classNames(
                                    'material-icons-round',
                                    css.warningIcon
                                )}
                            >
                                warning
                            </i>
                            <Tooltip
                                placement="top-end"
                                target={disabledNativeAppWarningIconId}
                                autohide={false}
                            >
                                The integration associated with this Action has
                                been disconnected. Reconfigure this integration
                                in{' '}
                                <Link
                                    to="/app/settings/integrations"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    the App Store.
                                </Link>
                            </Tooltip>
                        </>
                    )}
                </div>
                <span
                    id={getActionNameBodyCellElementId}
                    className={css.actionNameText}
                    ref={actionNameTextRef}
                >
                    {action.name}
                </span>
                {isActionNameTextOverflow && (
                    <Tooltip
                        placement="top-end"
                        target={getActionNameBodyCellElementId}
                    >
                        {action.name}
                    </Tooltip>
                )}
            </BodyCell>
            <BodyCell
                id={getActionNameTypeBodyCellElementId}
                innerClassName={css.innerActionCell}
                className={css.ellipsis}
                size="small"
                justifyContent="left"
                ref={actionTypeCellRef}
            >
                {isCustomAction ? (
                    <img src={webhooksIcon} alt={'webhooks'} />
                ) : (
                    <>
                        {appImageUrl ? (
                            <img
                                className={css.appImageFiller}
                                src={appImageUrl}
                                alt={action?.apps?.[0].type}
                            />
                        ) : (
                            <div className={css.appImageFiller}></div>
                        )}
                    </>
                )}
                <span className={css.actionTypeText} ref={actionTypeTextRef}>
                    {actionDisplayName}
                </span>
                {isActionTypeTextOverflow && (
                    <Tooltip
                        placement="top-end"
                        target={getActionNameTypeBodyCellElementId}
                    >
                        {actionDisplayName}
                    </Tooltip>
                )}
            </BodyCell>
            <BodyCell size="smallest" justifyContent="right">
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
