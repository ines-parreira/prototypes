import {Tooltip} from '@gorgias/merchant-ui-kit'
import React, {MouseEvent, useCallback, useMemo, useState} from 'react'
import {Link, useHistory, useParams} from 'react-router-dom'

import webhooksIcon from 'assets/img/icons/webhooks.svg'
import {DateAndTimeFormatting} from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {useGetWorkflowConfigurationTemplates} from 'models/workflows/queries'
import useDeleteAction from 'pages/aiAgent/actions/hooks/useDeleteAction'
import useUpsertAction from 'pages/aiAgent/actions/hooks/useUpsertAction'
import {useStoreAppsContext} from 'pages/aiAgent/actions/providers/StoreAppsContext'
import {StoreWorkflowsConfiguration} from 'pages/aiAgent/actions/types'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import AppIcon from 'pages/automate/actionsPlatform/components/AppIcon'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import useGetAppFromTemplateApp from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {formatDatetime} from 'utils'

import css from './ActionsRow.less'
import DeleteActionConfirmation from './DeleteActionConfirmation'

type Props = {
    action: StoreWorkflowsConfiguration
}

export default function ActionsRow({action}: Props) {
    const {shopName, shopType} = useParams<{
        shopType: 'shopify'
        shopName: string
    }>()

    const {data: templateSteps = []} = useGetWorkflowConfigurationTemplates({
        triggers: ['reusable-llm-prompt'],
    })

    const {routes} = useAiAgentNavigation({shopName})

    const history = useHistory()

    const {mutate: deleteAction, isLoading: isDeleteActionLoading} =
        useDeleteAction(action.name, shopName, shopType)

    const {mutate: updateAction, isLoading: isEditActionLoading} =
        useUpsertAction('update', shopName, shopType)

    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate
    )

    const handleToggleAction = useCallback(
        (nextValue: boolean, event: MouseEvent<HTMLLabelElement>) => {
            event.stopPropagation()

            updateAction([
                {
                    internal_id: action.internal_id,
                    store_name: shopName,
                    store_type: shopType,
                },
                {
                    ...action,
                    entrypoints: action.entrypoints.map((entrypoint) =>
                        entrypoint.kind === 'llm-conversation'
                            ? {
                                  ...entrypoint,
                                  deactivated_datetime: nextValue
                                      ? null
                                      : new Date().toISOString(),
                              }
                            : entrypoint
                    ),
                },
            ])
        },
        [action, shopName, shopType, updateAction]
    )

    const {apps} = useApps()
    const getAppFromTemplateApp = useGetAppFromTemplateApp({apps})

    const {recharge: rechargeIntegration} = useStoreAppsContext()

    const [nameRef, setNameRef] = useState<HTMLSpanElement | null>(null)

    const appIcons = useMemo(() => {
        const iconsMap: Record<string, React.ReactElement> = {}
        for (const step of action.steps) {
            if (step.kind === 'reusable-llm-prompt-call') {
                const templateStep = templateSteps.find(
                    (templateStep) =>
                        templateStep.id === step.settings.configuration_id
                )
                if (templateStep) {
                    for (const templateApp of templateStep.apps) {
                        const app = getAppFromTemplateApp(templateApp)
                        const key =
                            templateApp.type === 'app'
                                ? templateApp.app_id
                                : templateApp.type
                        iconsMap[key] = (
                            <AppIcon
                                key={key}
                                name={app?.name}
                                icon={app?.icon}
                            />
                        )
                    }
                }
                step.settings.configuration_id
            } else if (step.kind === 'http-request') {
                iconsMap[step.kind] = (
                    <img
                        src={webhooksIcon}
                        alt="HTTP request"
                        title="HTTP request"
                    />
                )
            }
        }

        return Object.values(iconsMap)
    }, [action.steps, getAppFromTemplateApp, templateSteps])

    return (
        <TableBodyRow
            className={css.container}
            onClick={() => {
                if (!isDeleteActionLoading) {
                    history.push(routes.editAction(action.id))
                }
            }}
        >
            <BodyCell width={360} className={css.nameCell}>
                <div className={css.nameWrapper}>
                    <ToggleInput
                        isLoading={isEditActionLoading}
                        isDisabled={isDeleteActionLoading}
                        onClick={handleToggleAction}
                        isToggled={!action.entrypoints[0].deactivated_datetime}
                    />
                    {action.apps?.map((templateApp) => {
                        const app = getAppFromTemplateApp(templateApp)

                        if (app?.type === 'recharge' && !rechargeIntegration) {
                            return (
                                <IconTooltip
                                    key={app.id}
                                    tooltipProps={{
                                        placement: 'top-end',
                                        autohide: false,
                                    }}
                                    icon="error"
                                    className={css.icon}
                                >
                                    The Recharge integration associated with
                                    this Action has been disconnected.
                                    Reconfigure this integration in{' '}
                                    <Link
                                        to="/app/settings/integrations"
                                        onClick={(event) => {
                                            event.stopPropagation()
                                        }}
                                    >
                                        the App Store.
                                    </Link>
                                </IconTooltip>
                            )
                        }

                        return null
                    })}
                    <span className={css.name} ref={setNameRef}>
                        {action.name}
                    </span>
                    {nameRef && nameRef.scrollWidth > nameRef.offsetWidth && (
                        <Tooltip placement="top-end" target={nameRef}>
                            {action.name}
                        </Tooltip>
                    )}
                </div>
            </BodyCell>
            <BodyCell innerClassName={css.apps}>{appIcons}</BodyCell>
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
                    isDisabled={isDeleteActionLoading || isEditActionLoading}
                />
            </BodyCell>
        </TableBodyRow>
    )
}
