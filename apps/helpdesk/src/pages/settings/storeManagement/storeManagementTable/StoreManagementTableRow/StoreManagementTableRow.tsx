import React from 'react'

import classnames from 'classnames'
import { useHistory } from 'react-router-dom'

import type { IntegrationType } from 'models/integration/constants'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import { getIconFromType } from 'state/integrations/helpers'

import getStoreDomain from '../../helpers/getStoreDomain'
import type { StoreWithAssignedChannels } from '../../types'
import ChannelListCell from './ChannelListCell'

import css from './StoreManagementTableRow.less'

export interface StoreManagementTableRowProps {
    store: StoreWithAssignedChannels
}

export default function StoreManagementTableRow({
    store,
}: StoreManagementTableRowProps) {
    const history = useHistory()

    const handleRowClick = () => {
        history.push(`/app/settings/store-management/${store.store.id}`)
    }

    return (
        <TableBodyRow className={css.container} onClick={handleRowClick}>
            <BodyCell>
                <span className={css.storeName}>
                    <img
                        height={16}
                        width={16}
                        src={getIconFromType(
                            store.store.type as IntegrationType,
                        )}
                        alt="logo"
                    />
                    <span>{store.store.name}</span>
                </span>
            </BodyCell>
            <BodyCell>
                <span className={css.storeUrl}>
                    {getStoreDomain(store.store)}
                </span>
            </BodyCell>
            <BodyCell>
                <ChannelListCell
                    channels={store.assignedChannels}
                    storeId={store.store.id}
                />
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
