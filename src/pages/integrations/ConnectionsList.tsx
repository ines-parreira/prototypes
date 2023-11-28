import React from 'react'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationsByAppId} from 'state/integrations/selectors'

import css from './ConnectionsList.less'

export type Props = {
    appId: string
}

export default function ConnectionsList({appId}: Props) {
    const connections = useAppSelector(getIntegrationsByAppId(appId))
    return (
        <TableWrapper>
            <TableBody>
                {connections.map((row) => {
                    const {id, name, meta} = row
                    return (
                        <TableBodyRow key={id}>
                            <BodyCell className={css.row}>
                                <strong>{name}</strong>
                                <span>{meta?.address}</span>
                            </BodyCell>
                        </TableBodyRow>
                    )
                })}
            </TableBody>
        </TableWrapper>
    )
}
