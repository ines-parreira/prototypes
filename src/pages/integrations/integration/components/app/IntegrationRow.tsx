import React from 'react'
import {fromJS} from 'immutable'
import {Tooltip} from '@gorgias/ui-kit'
import {
    EcommerceIntegrationMeta,
    Integration,
    isAppIntegration,
} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentDomain} from 'state/currentAccount/selectors'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/integrations/integration/components/app/IntegrationRow.less'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import {deleteIntegration} from 'state/integrations/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {getIntegrationsLoading} from 'state/integrations/selectors'
import IconButton from 'pages/common/components/button/IconButton'
import {getReconnectUrl} from './helpers'

type Props = {
    integration: Integration
    connectUrl: string
}

export default function IntegrationRow({integration, connectUrl}: Props) {
    const domain = useAppSelector(getCurrentDomain)
    const isDisabled = integration.deactivated_datetime
    const reconnectUrl = getReconnectUrl(connectUrl, domain, integration)
    const dispatch = useAppDispatch()
    const loading = useAppSelector(getIntegrationsLoading)
    const isDeleting =
        typeof loading?.delete === 'number' &&
        loading?.delete === integration.id

    return (
        <TableBodyRow key={integration.id}>
            <BodyCell className={css.row}>
                <strong>{integration.name}</strong>
                <span className="text-secondary">
                    {isAppIntegration(integration)
                        ? integration.meta?.address
                        : (integration.meta as EcommerceIntegrationMeta)
                              ?.store_uuid}
                </span>
            </BodyCell>
            <BodyCell className={css.row} justifyContent={'right'}>
                <>
                    {isDisabled && (
                        <>
                            <span className="mr-4">
                                <i className="material-icons text-danger mr-1">
                                    cancel
                                </i>
                                Disconnected
                            </span>
                            <IconButton
                                id={`reconnect-${integration.id}`}
                                intent="secondary"
                                fillStyle="ghost"
                                className="mr-2"
                                onClick={() =>
                                    (window.location.href = reconnectUrl)
                                }
                            >
                                cached
                            </IconButton>
                            <Tooltip
                                placement="top"
                                target={`reconnect-${integration.id}`}
                            >
                                Reconnect
                            </Tooltip>
                        </>
                    )}
                    <ConfirmationPopover
                        id={`delete-${integration.id}`}
                        buttonProps={{intent: 'destructive'}}
                        cancelButtonProps={{intent: 'secondary'}}
                        content="Are you sure you want to delete this account? All associated views and rules will be disabled."
                        title={<b>Delete account?</b>}
                        onConfirm={() =>
                            dispatch(deleteIntegration(fromJS(integration)))
                        }
                        confirmLabel="Delete"
                        showCancelButton
                    >
                        {({uid, onDisplayConfirmation}) => (
                            <>
                                <IconButton
                                    id={uid}
                                    onClick={onDisplayConfirmation}
                                    fillStyle="ghost"
                                    isLoading={isDeleting}
                                    intent="secondary"
                                >
                                    {isDeleting ? '' : 'delete'}
                                </IconButton>
                                <Tooltip placement="top" target={uid}>
                                    Delete
                                </Tooltip>
                            </>
                        )}
                    </ConfirmationPopover>
                </>
            </BodyCell>
        </TableBodyRow>
    )
}
