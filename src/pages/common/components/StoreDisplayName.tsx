import { IntegrationType } from 'models/integration/constants'
import { getIconFromType } from 'state/integrations/helpers'

import css from './StoreDisplayName.less'

type Props = {
    name: string
    type: IntegrationType
}

export default function StoreDisplayName({ name, type }: Props) {
    return (
        <div className={css.container}>
            <img
                src={getIconFromType(type)}
                alt={name}
                className={css.typeIcon}
            />
            <div className={css.name}>{name}</div>
        </div>
    )
}
