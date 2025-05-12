import React from 'react'

import classnames from 'classnames'
import { useHistory } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import { getIconFromType } from 'state/integrations/helpers'

import { Store } from '../../types'
import ChannelListCell from './ChannelListCell'

import css from './StoreManagementTableRow.less'

export interface StoreManagementTableRowProps {
    store: Store
}

export default function StoreManagementTableRow({
    store,
}: StoreManagementTableRowProps) {
    const history = useHistory()

    const handleRowClick = () => {
        history.push(`/app/settings/store-management/${store.id}`)
    }

    return (
        <TableBodyRow className={css.container} onClick={handleRowClick}>
            <BodyCell>
                <span className={css.storeName}>
                    <img
                        height={16}
                        width={16}
                        src={getIconFromType(store.type as IntegrationType)}
                        alt="logo"
                    />
                    <span>{store.name}</span>
                </span>
            </BodyCell>
            <BodyCell>
                <span className={css.storeUrl}> {store.url}</span>
            </BodyCell>
            <BodyCell>
                <ChannelListCell channels={store.channels} storeId={store.id} />
            </BodyCell>
            <BodyCell>
                <i
                    className={classnames(
                        'material-icons',
                        'icon-go-to-store',
                        css.goToIcon,
                    )}
                >
                    chevron_right
                </i>
            </BodyCell>
        </TableBodyRow>
    )
}
