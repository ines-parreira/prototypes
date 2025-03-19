import { getIconFromType } from 'state/integrations/helpers'

import { useStoreIntegrationByShopName } from '../../hooks/useStoreIntegrationByShopName'

import css from './StoreName.less'

export type StoreNameType = {
    name: string | null
}
const StoreName = ({ name }: StoreNameType) => {
    const storeIntegration = useStoreIntegrationByShopName(name ?? '')

    if (!name || !storeIntegration) {
        return <div className={css.noStore}>No store connected</div>
    }

    return (
        <div className={css.name}>
            <img
                height={16}
                width={16}
                src={getIconFromType(storeIntegration.type)}
                alt="logo"
            />
            <span className={css.storeNameLabel}>{name}</span>
        </div>
    )
}

export default StoreName
