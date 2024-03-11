import {Button} from 'reactstrap'
import React from 'react'
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
import {getReconnectUrl} from './helpers'

type Props = {
    integration: Integration
    connectUrl: string
}

export default function IntegrationRow({integration, connectUrl}: Props) {
    const domain = useAppSelector(getCurrentDomain)
    const isDisabled = integration.deactivated_datetime
    const reconnectUrl = getReconnectUrl(connectUrl, domain, integration)
    return (
        <TableBodyRow key={integration.id}>
            <BodyCell className={css.row}>
                <strong>{integration.name}</strong>
                <span>
                    {isAppIntegration(integration)
                        ? integration.meta?.address
                        : (integration.meta as EcommerceIntegrationMeta)
                              ?.store_uuid}
                </span>
            </BodyCell>
            <BodyCell className={css.row} justifyContent={'right'}>
                {isDisabled && (
                    <a href={reconnectUrl} className={css.actionLink}>
                        <Button type="button">Reconnect</Button>
                    </a>
                )}
            </BodyCell>
        </TableBodyRow>
    )
}
