import { useCallback, useMemo } from 'react'

import classNames from 'classnames'

import { ListItem, SelectField } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import type {
    GorgiasChatIntegration,
    StoreIntegration,
} from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'

import useThemeAppExtensionInstallation from '../hooks/useThemeAppExtensionInstallation'

import css from './StorePicker.less'

const getStoreIconName = (type: StoreIntegration['type']): IconName => {
    switch (type) {
        case IntegrationType.Shopify:
            return 'vendor-shopify-colored'
        case IntegrationType.BigCommerce:
            return 'vendor-bicommerce-colored'
        case IntegrationType.Magento2:
            return 'vendor-magento-colored'
        default:
            return 'shopping-bag'
    }
}

type Props = {
    gorgiasChatIntegrations: GorgiasChatIntegration[]
    storeIntegrations: StoreIntegration[]
    selectedStoreIntegrationId: number | null
    onChange: (storeIntegrationId: number) => void
    isDisabled?: boolean
    placeholder?: string
    error?: string
    showHelperText?: boolean
    label?: string
    size?: 'sm' | 'md' | 'full'
}

export const StorePicker = ({
    storeIntegrations,
    gorgiasChatIntegrations,
    selectedStoreIntegrationId,
    onChange,
    isDisabled,
    placeholder = 'Select a store',
    error,
    showHelperText = true,
    label = 'Connect a store',
    size = 'md',
}: Props) => {
    const selectedStore = useMemo(
        () =>
            storeIntegrations.find(
                (store) => store.id === selectedStoreIntegrationId,
            ) ?? undefined,
        [storeIntegrations, selectedStoreIntegrationId],
    )
    const { shouldUseThemeAppExtensionInstallation } =
        useThemeAppExtensionInstallation(
            selectedStore?.type === IntegrationType.Shopify
                ? selectedStore
                : undefined,
        )
    const chatsPerStore = useMemo(() => {
        const counts: Record<number, number> = {}

        gorgiasChatIntegrations.forEach((chat) => {
            const shopId = chat.meta.shop_integration_id
            if (shopId) {
                counts[shopId] = (counts[shopId] || 0) + 1
            }
        })

        return counts
    }, [gorgiasChatIntegrations])

    const getCaption = useCallback(
        (store: StoreIntegration) => {
            if (store.deactivated_datetime) {
                return 'Disconnected store'
            }

            const count = chatsPerStore[store.id]
            if (!count) return undefined

            return count === 1 ? '1 connected chat' : `${count} connected chats`
        },
        [chatsPerStore],
    )

    const helperText = `Link your store to enable AI Agent features and ${shouldUseThemeAppExtensionInstallation ? 'quick' : '1-click'} Shopify installation.`

    return (
        <>
            <div
                className={classNames(css.storePickerWrapper, css[size])}
                aria-label="Store selection"
                role="listbox"
            >
                <SelectField
                    items={storeIntegrations}
                    value={selectedStore}
                    maxHeight={300}
                    onChange={(store) => onChange(store.id)}
                    label={label}
                    aria-label="Select a store to connect"
                    placeholder={placeholder}
                    isRequired
                    isDisabled={isDisabled}
                    isSearchable
                    error={error}
                    leadingSlot={
                        selectedStore
                            ? getStoreIconName(selectedStore?.type)
                            : undefined
                    }
                >
                    {(store) => (
                        <ListItem
                            id={store.id}
                            leadingSlot={getStoreIconName(store.type)}
                            label={store.name}
                            caption={getCaption(store)}
                            textValue={store.name}
                        />
                    )}
                </SelectField>
            </div>
            {showHelperText && (
                <span className={css.helperText}>{helperText}</span>
            )}
        </>
    )
}
