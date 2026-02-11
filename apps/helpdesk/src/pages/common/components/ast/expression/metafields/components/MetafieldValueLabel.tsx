import { IntegrationType } from 'models/integration/types'
import { getIconFromUrl } from 'utils'

import type { MetafieldValueLabelProps } from '../types'

import css from '../../MemberExpression.less'

export function MetafieldValueLabel({
    selectedMetafield,
    displayStoreName,
}: MetafieldValueLabelProps) {
    const integrationUrl = getIconFromUrl(
        `integrations/${IntegrationType.Shopify}-mono.svg`,
    )

    return (
        <>
            <div
                className={css.logo}
                style={{
                    mask: `url(${integrationUrl})`,
                    WebkitMask: `url(${integrationUrl})`,
                }}
            />
            {displayStoreName
                ? `${displayStoreName}:${selectedMetafield.name}`
                : selectedMetafield.name}
        </>
    )
}
