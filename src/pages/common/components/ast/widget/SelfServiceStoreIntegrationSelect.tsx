import React, {useEffect, useMemo} from 'react'
import {fromJS} from 'immutable'

import useShopifyIntegrations from 'pages/automation/common/hooks/useShopifyIntegrations'
import useAppDispatch from 'hooks/useAppDispatch'
import {fetchIntegrations} from 'state/integrations/actions'
import {RenderLabel} from 'pages/common/utils/labels'

import Select from './ReactSelect'

type OwnProps = {
    onChange: (value: number) => void
    className?: string
    value: any
}

const RENDER_LABEL_FIELD = fromJS({name: 'integrations'})

const SelfServiceStoreIntegrationSelect = ({
    className,
    value,
    onChange,
}: OwnProps) => {
    const dispatch = useAppDispatch()

    const shopifyIntegrations = useShopifyIntegrations()
    const options = useMemo(
        () =>
            shopifyIntegrations.map((integration) => ({
                value: integration.id,
                text: integration.name,
                label: (
                    <RenderLabel
                        field={RENDER_LABEL_FIELD}
                        value={fromJS(integration)}
                    />
                ),
            })),
        [shopifyIntegrations]
    )

    useEffect(() => {
        if (!shopifyIntegrations) {
            void dispatch(fetchIntegrations)
        }
    }, [dispatch, shopifyIntegrations])

    return (
        <Select
            className={className}
            value={value}
            onChange={onChange}
            options={options}
            focusedPlaceholder="Search stores by name..."
            sortOptions={false}
        />
    )
}

export default SelfServiceStoreIntegrationSelect
