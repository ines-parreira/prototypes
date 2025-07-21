import { IntegrationType } from 'models/integration/constants'
import { getIconFromType, isIntegrationType } from 'state/integrations/helpers'

import css from './StoreDisplayName.less'

type Props = {
    name: string
    type: IntegrationType | string
}

export default function StoreDisplayName({ name, type }: Props) {
    return (
        <div className={css.container}>
            {isIntegrationType(type) && (
                <img
                    src={getIconFromType(type)}
                    alt={name}
                    className={css.typeIcon}
                />
            )}
            <div className={css.name}>{name}</div>
        </div>
    )
}
