import { useEffect, useState } from 'react'

import {
    autoUpdate,
    flip,
    offset,
    shift,
    useDismiss,
    useFloating,
    useInteractions,
} from '@floating-ui/react'
import { logEvent, SegmentEvent } from '@repo/logging'

import { Icon } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import type { Field } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/MetafieldsTable/types'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import * as integrationsSelectors from 'state/integrations/selectors'

import { MetafieldsList } from './MetafieldsList'
import { SubmenuItem } from './SubmenuItem'
import type { ShopifyMetafieldVariablePickerProps } from './types'
import { useSubmenuNavigation } from './useSubmenuNavigation'
import { CATEGORIES, getMetafieldVariableValue } from './utils'

import css from './ShopifyMetafieldVariablePicker.less'

export function ShopifyMetafieldVariablePicker({
    onSelect,
    onCloseParentMenu,
}: ShopifyMetafieldVariablePickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    const {
        currentLevel,
        selectedStore,
        selectedCategory,
        backButtonLabel,
        handleBack,
        handleStoreSelect,
        handleCategorySelect,
        resetSubmenuState,
    } = useSubmenuNavigation()

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: 'right-start',
        middleware: [
            offset(4),
            flip({ fallbackPlacements: ['left-start', 'right-start'] }),
            shift({ padding: 8 }),
        ],
        whileElementsMounted: autoUpdate,
    })

    const dismiss = useDismiss(context)
    const { getFloatingProps } = useInteractions([dismiss])

    const shopifyIntegrations = useAppSelector(
        integrationsSelectors.getShopifyIntegrationsSortedByName,
    )

    useEffect(() => {
        if (!isOpen) {
            resetSubmenuState()
        }
    }, [isOpen, resetSubmenuState])

    const handleMetafieldSelect = (field: Field) => {
        if (!selectedStore || !selectedCategory) return

        logEvent(SegmentEvent.ShopifyMetafieldsSelectedMetafieldForMacros, {
            accountId,
            userId,
        })

        const variableValue = getMetafieldVariableValue(
            selectedStore.id,
            selectedCategory,
            field.key,
        )
        onSelect(variableValue)
        setIsOpen(false)
        onCloseParentMenu?.()
    }

    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)

    const handleOpenSubmenu = (e: React.MouseEvent | React.KeyboardEvent) => {
        logEvent(SegmentEvent.ShopifyMetafieldsOpenMacroDropdown, {
            accountId,
            userId,
        })
        e.stopPropagation()
        setIsOpen(true)
    }

    if (shopifyIntegrations.length === 0) {
        return null
    }

    return (
        <div className={css.triggerContainer}>
            <div
                ref={refs.setReference}
                role="button"
                tabIndex={0}
                className={css.triggerItem}
                onClick={handleOpenSubmenu}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        handleOpenSubmenu(e)
                    }
                }}
            >
                <span>Shopify metafields</span>
                <span className={css.chevronIcon}>
                    <Icon name="arrow-chevron-right" />
                </span>
            </div>

            {isOpen && (
                <div
                    ref={refs.setFloating}
                    style={floatingStyles}
                    className={css.submenu}
                    {...getFloatingProps()}
                >
                    {currentLevel !== 'stores' && (
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={handleBack}
                            className={css.backHeader}
                        >
                            <span className={css.backButton}>
                                <span className={css.backIcon}>
                                    <Icon name="arrow-chevron-left" />
                                </span>
                                <span className={css.backLabel}>
                                    {backButtonLabel}
                                </span>
                            </span>
                        </div>
                    )}

                    <div className={css.dropdownBody}>
                        {currentLevel === 'stores' && (
                            <div className={css.storesList}>
                                {shopifyIntegrations.map((store) => (
                                    <SubmenuItem
                                        key={store.id}
                                        label={store.name}
                                        onClick={(e) =>
                                            handleStoreSelect(e, store)
                                        }
                                    />
                                ))}
                            </div>
                        )}

                        {currentLevel === 'categories' &&
                            CATEGORIES.map((category) => (
                                <SubmenuItem
                                    key={category.id}
                                    label={category.name}
                                    onClick={(e) =>
                                        handleCategorySelect(e, category.id)
                                    }
                                />
                            ))}

                        {currentLevel === 'metafields' &&
                            selectedStore &&
                            selectedCategory && (
                                <MetafieldsList
                                    integrationId={selectedStore.id}
                                    category={selectedCategory}
                                    onSelect={handleMetafieldSelect}
                                />
                            )}
                    </div>
                </div>
            )}
        </div>
    )
}
