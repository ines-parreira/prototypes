import { useCallback, useEffect, useMemo, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import type { ShopifyIntegration } from 'models/integration/types'
import { generateExpression, getMetafieldTreePath } from 'models/rule/utils'
import { useMetafieldDefinitions } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/hooks/useMetafieldDefinitions'
import type { Field } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/MetafieldsTable/types'
import type { SupportedCategories } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/types'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { RuleOperation } from 'state/rules/types'

import type {
    MetafieldLevel,
    UseMetafieldRuleSelectionParams,
    UseMetafieldRuleSelectionReturn,
} from '../types'
import {
    extractIntegrationIdFromTree,
    extractMetafieldCategoryFromTree,
    extractMetafieldKeyFromTree,
    filterSupportedMetafields,
    findMetafieldByKey,
    findStoreById,
    getActiveIntegrationId,
    getDisplayStoreName,
    getMetafieldValueSuffix,
    hasMetafieldInPath,
    parsePathToExpressionSegments,
} from '../utils'

export function useMetafieldRuleSelection({
    syntaxTreeLeaves,
    actions,
    parent,
    shopifyIntegrations,
}: UseMetafieldRuleSelectionParams): UseMetafieldRuleSelectionReturn {
    const hasMetafieldInTree = useMemo(
        () => hasMetafieldInPath(syntaxTreeLeaves),
        [syntaxTreeLeaves],
    )

    const metafieldKeyFromTree = useMemo(
        () => extractMetafieldKeyFromTree(syntaxTreeLeaves, hasMetafieldInTree),
        [syntaxTreeLeaves, hasMetafieldInTree],
    )

    const metafieldCategoryFromTree = useMemo(
        () =>
            extractMetafieldCategoryFromTree(
                syntaxTreeLeaves,
                hasMetafieldInTree,
            ),
        [syntaxTreeLeaves, hasMetafieldInTree],
    )

    const integrationIdFromTree = useMemo(
        () => extractIntegrationIdFromTree(syntaxTreeLeaves),
        [syntaxTreeLeaves],
    )

    const [showMetafieldSelection, setShowMetafieldSelection] =
        useState<SupportedCategories | null>(() => metafieldCategoryFromTree)

    const [selectedMetafield, setSelectedMetafield] = useState<Field | null>(
        null,
    )

    const [selectedStore, setSelectedStore] =
        useState<ShopifyIntegration | null>(null)

    const [metafieldLevel, setMetafieldLevel] =
        useState<MetafieldLevel>('stores')

    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)

    const activeIntegrationId = getActiveIntegrationId(
        selectedStore?.id,
        integrationIdFromTree,
        shopifyIntegrations[0]?.id,
    )

    const { data: allMetafields = [], isLoading: isLoadingMetafields } =
        useMetafieldDefinitions({
            integrationId: activeIntegrationId ?? 0,
            pinned: true,
        })

    const metafields = useMemo(
        () => filterSupportedMetafields(allMetafields),
        [allMetafields],
    )

    const displayStoreName = useMemo(
        () =>
            getDisplayStoreName(
                selectedStore,
                integrationIdFromTree,
                shopifyIntegrations,
            ),
        [selectedStore, integrationIdFromTree, shopifyIntegrations],
    )

    const selectMetafield = useCallback(
        (field: Field, category: SupportedCategories) => {
            if (!selectedStore) return

            logEvent(SegmentEvent.ShopifyMetafieldsSelectedMetafieldForRule, {
                accountId,
                userId,
            })

            setSelectedMetafield(field)
            setShowMetafieldSelection(category)

            const treePath = getMetafieldTreePath(category, selectedStore.id)

            const valueSuffix = getMetafieldValueSuffix(field.type)

            const fullPath = `${treePath}.${field.key}${valueSuffix}`

            const expressionSegments = parsePathToExpressionSegments(fullPath)

            actions.modifyCodeAST(
                parent,
                fromJS(generateExpression(expressionSegments.reverse())),
                RuleOperation.Update,
            )
        },
        [accountId, userId, actions, parent, selectedStore],
    )

    const resetMetafieldSelection = useCallback(() => {
        setShowMetafieldSelection(null)
        setSelectedMetafield(null)
    }, [])

    useEffect(() => {
        if (!integrationIdFromTree || selectedStore) {
            return
        }
        const matchingStore = findStoreById(
            shopifyIntegrations,
            integrationIdFromTree,
        )
        if (matchingStore) {
            setSelectedStore(matchingStore)
        }
    }, [integrationIdFromTree, shopifyIntegrations, selectedStore])

    useEffect(() => {
        if (
            !hasMetafieldInTree ||
            !metafieldKeyFromTree ||
            !metafieldCategoryFromTree ||
            !metafields.length ||
            selectedMetafield
        ) {
            return
        }

        const matchingField = findMetafieldByKey(
            metafields,
            metafieldKeyFromTree,
            metafieldCategoryFromTree,
        )
        if (matchingField) {
            setSelectedMetafield(matchingField)
        }
    }, [
        hasMetafieldInTree,
        metafieldKeyFromTree,
        metafieldCategoryFromTree,
        metafields,
        selectedMetafield,
    ])

    return {
        hasMetafieldInTree,
        showMetafieldSelection,
        selectedMetafield,
        selectedStore,
        metafieldLevel,
        metafields,
        isLoadingMetafields,
        displayStoreName,
        selectMetafield,
        setSelectedStore,
        setMetafieldLevel,
        resetMetafieldSelection,
    }
}
