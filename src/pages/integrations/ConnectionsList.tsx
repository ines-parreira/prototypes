import React from 'react'

import {Button} from 'reactstrap'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationsByAppId} from 'state/integrations/selectors'

import {
    AppIntegrationMeta,
    EcommerceIntegrationMeta,
    isAppIntegration,
} from 'models/integration/types'
import {getCurrentDomain} from 'state/currentAccount/selectors'
import css from './ConnectionsList.less'
import {getReconnectUrl} from './helpers'

export type Props = {
    appId: string
    connectUrl: string
}

export default function ConnectionsList({appId, connectUrl}: Props) {
    const connections = useAppSelector(getIntegrationsByAppId(appId))
    const domain = useAppSelector(getCurrentDomain)
    return (
        <TableWrapper>
            <TableBody>
                {connections.map((row) => {
                    const {id, name, meta} = row
                    const isDisabled = row.deactivated_datetime
                    const reconnectUrl = getReconnectUrl(
                        connectUrl,
                        domain,
                        row
                    )
                    return (
                        <TableBodyRow key={id}>
                            <BodyCell className={css.row}>
                                <strong>{name}</strong>
                                <span>
                                    {isAppIntegration(row)
                                        ? (meta as AppIntegrationMeta)?.address
                                        : (meta as EcommerceIntegrationMeta)
                                              ?.store_uuid}
                                </span>
                            </BodyCell>
                            <BodyCell
                                className={css.row}
                                justifyContent={'right'}
                            >
                                {isDisabled && (
                                    <a
                                        href={reconnectUrl}
                                        className={css.actionLink}
                                    >
                                        <Button type="button">Reconnect</Button>
                                    </a>
                                )}
                            </BodyCell>
                        </TableBodyRow>
                    )
                })}
            </TableBody>
        </TableWrapper>
    )
}
