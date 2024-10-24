import React, {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {Integration, IntegrationType} from 'models/integration/types'
import {Option} from 'pages/common/forms/SelectField/types'
import {getIconFromType} from 'state/integrations/helpers'
import {getIntegrationsByTypes} from 'state/integrations/selectors'

type CssClasses = {
    option: string
    icon: string
}

const optionLabel = (
    shop: JSX.Element | string,
    type: IntegrationType,
    css: CssClasses
) => (
    <span className={css.option}>
        <span>
            <img
                src={getIconFromType(type)}
                className={css.icon}
                alt="integration logo"
            />
        </span>

        <span>{shop}</span>
    </span>
)

export function useStoreOptions(css: CssClasses) {
    const integrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ])
    )

    const shopsOptions: Option[] = useMemo(() => {
        const options = integrations.map<Option>((integration: Integration) => {
            return {
                value: integration.name,
                label: optionLabel(integration.name, integration.type, css),
                text: integration.name,
            }
        })
        return options
    }, [integrations, css])

    return shopsOptions
}
