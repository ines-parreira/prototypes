import React, { useMemo } from 'react'

import { THEME_NAME, useTheme } from 'core/theme'
import { IntegrationType } from 'models/integration/constants'
import { getIconFromType } from 'state/integrations/helpers'
import { assetsUrl } from 'utils'

import css from './IntegrationIcon.less'

type Props = {
    kind: IntegrationType
}

export function IntegrationIcon({ kind }: Props) {
    const theme = useTheme()

    const src = useMemo(
        () =>
            kind === IntegrationType.BigCommerce
                ? assetsUrl(
                      `/img/integrations/bigcommerce${theme.resolvedName === THEME_NAME.Dark ? '-white' : ''}.svg`,
                  )
                : getIconFromType(kind),
        [kind, theme],
    )

    return (
        <img
            alt={`${kind} logo`}
            className={css.icon}
            role="presentation"
            src={src}
        />
    )
}
