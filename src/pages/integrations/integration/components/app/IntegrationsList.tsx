import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import TableBody from 'pages/common/components/table/TableBody'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import { getIntegrationsByAppId } from 'state/integrations/selectors'

import IntegrationRow from './IntegrationRow'

export type Props = {
    appId: string
    connectUrl: string
}

export default function IntegrationsList({ appId, connectUrl }: Props) {
    const integrations = useAppSelector(getIntegrationsByAppId(appId))
    return (
        <TableWrapper>
            <TableBody>
                {integrations.map((integration) => {
                    return (
                        <IntegrationRow
                            key={integration.id}
                            integration={integration}
                            connectUrl={connectUrl}
                        />
                    )
                })}
            </TableBody>
        </TableWrapper>
    )
}
