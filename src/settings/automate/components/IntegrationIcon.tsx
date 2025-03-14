import React, { useMemo } from 'react'

import { IntegrationType } from 'models/integration/constants'
import { getIconFromType } from 'state/integrations/helpers'
import { assetsUrl } from 'utils'

type Props = {
    kind: IntegrationType
}

export function IntegrationIcon({ kind }: Props) {
    const src = useMemo(
        () =>
            kind === IntegrationType.BigCommerce
                ? assetsUrl('/img/integrations/bigcommerce-white.svg')
                : getIconFromType(kind),
        [kind],
    )

    return <img alt={`${kind} logo`} role="presentation" src={src} />
}
