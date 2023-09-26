import React from 'react'

import {getIconFromType} from 'state/integrations/helpers'
import {IntegrationType} from 'models/integration/constants'

import css from './StoreName.less'

export type StoreNameType = {
    name: string | null
}
const StoreName = ({name}: StoreNameType) => {
    if (!name) {
        return <div className={css.noStore}>No store connected</div>
    }

    return (
        <div className={css.name}>
            <img
                height={16}
                width={16}
                // we only support Shopify shops for now
                src={getIconFromType(IntegrationType.Shopify)}
                alt="logo"
            />
            <span className={css.storeNameLabel}>{name}</span>
        </div>
    )
}

export default StoreName
