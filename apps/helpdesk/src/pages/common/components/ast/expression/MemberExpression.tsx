import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import classnames from 'classnames'
import type { Expression } from 'estree'
import type { List } from 'immutable'
import { fromJS } from 'immutable'

import type { CustomField } from '@gorgias/helpdesk-types'
import { ObjectType } from '@gorgias/helpdesk-types'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import {
    IDENTIFIER_CATEGORIES,
    IDENTIFIER_VARIABLES_BY_CATEGORY,
} from 'models/rule/constants'
import type { IdentifierElement } from 'models/rule/types'
import { CustomFieldTreePath, IdentifierCategoryKey } from 'models/rule/types'
import {
    generateExpression,
    getAstPath,
    getCategoryFromPath,
} from 'models/rule/utils'
import type { RuleItemActions } from 'pages/settings/rules/types'
import {
    getShopifyIntegrationsSortedByName,
    makeHasIntegrationOfTypes,
} from 'state/integrations/selectors'
import type { ObjectExpressionPropertyKey } from 'state/rules/types'
import { RuleOperation } from 'state/rules/types'
import { getIconFromUrl } from 'utils'

import { getFieldSchemaDefinitionKey } from '../../ViewTable/Filters/utils'
import { getSyntaxTreeLeaves } from '../utils'
import RuleSelect from '../widget/RuleSelect'
import {
    isMetafieldCategory,
    MetafieldCategoryOptions,
    MetafieldValueLabel,
    useMetafieldRuleSelection,
} from './metafields'

import css from './MemberExpression.less'

export function MemberExpression({
    actions,
    object,
    parent,
    property,
}: {
    actions: RuleItemActions
    object: Expression
    parent: List<any>
    property: ObjectExpressionPropertyKey
}) {
    const syntaxTreeLeaves = useMemo(() => {
        return getSyntaxTreeLeaves(object)
    }, [object])

    const hasCustomTicketFieldInTree = useMemo(() => {
        if (!syntaxTreeLeaves) {
            return false
        }

        return syntaxTreeLeaves.join('.').startsWith(CustomFieldTreePath.Ticket)
    }, [syntaxTreeLeaves])

    const hasCustomCustomerFieldInTree = useMemo(() => {
        if (!syntaxTreeLeaves) {
            return false
        }

        return syntaxTreeLeaves
            .join('.')
            .startsWith(CustomFieldTreePath.Customer)
    }, [syntaxTreeLeaves])

    const customFieldIdFromTree = useMemo(() => {
        if (!hasCustomTicketFieldInTree && !hasCustomCustomerFieldInTree) {
            return null
        }

        const customFieldId = syntaxTreeLeaves?.last()
        if (!customFieldId || Number.isNaN(Number(customFieldId))) {
            return null
        }

        return Number(customFieldId)
    }, [
        syntaxTreeLeaves,
        hasCustomTicketFieldInTree,
        hasCustomCustomerFieldInTree,
    ])

    const hasIntegrationType = useAppSelector(makeHasIntegrationOfTypes)
    const { hasAccess } = useAiAgentAccess()
    const enableShopifyMetafieldsInRules = useFlag(
        FeatureFlagKey.EnableShopifyMetafieldsIngestionUIinRules,
        false,
    )
    const [selectedCategory, setSelectedCategory] =
        useState<IdentifierCategoryKey | null>(null)

    // Handles showing the custom field selection dropdown
    const [showCustomFieldSelection, setShowCustomFieldSelection] = useState(
        () => hasCustomTicketFieldInTree,
    )
    const [
        showCustomerCustomFieldSelection,
        setShowCustomerCustomFieldSelection,
    ] = useState(() => hasCustomCustomerFieldInTree)

    // Handles the selection of the custom field
    const [selectedTicketCustomField, setSelectedTicketCustomField] =
        useState<CustomField | null>(null)
    const [selectedCustomerCustomField, setSelectedCustomerCustomField] =
        useState<CustomField | null>(null)

    const shopifyIntegrations =
        useAppSelector(getShopifyIntegrationsSortedByName) ?? []

    const {
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
    } = useMetafieldRuleSelection({
        syntaxTreeLeaves,
        actions,
        parent,
        shopifyIntegrations,
    })

    const selectCustomFieldByType = useCallback(
        (field: CustomField | undefined, fieldType: ObjectType) => {
            if (!field) {
                return
            }

            if (fieldType === ObjectType.Ticket) {
                setSelectedTicketCustomField(field)
            } else {
                setSelectedCustomerCustomField(field)
            }

            const expressionSegments =
                fieldType === ObjectType.Ticket
                    ? ['value', field.id.toString(), 'custom_fields', 'ticket']
                    : [
                          'value',
                          field.id.toString(),
                          'custom_fields',
                          'customer',
                          'ticket',
                      ]

            actions.modifyCodeAST(
                parent,
                fromJS(generateExpression(expressionSegments)),
                RuleOperation.Update,
                undefined,
                getFieldSchemaDefinitionKey(field),
            )
        },
        [actions, parent],
    )

    // Since the logic is similar for both ticket and customer custom fields, we build a generic function to handle the selection
    // cases on render or when the state attributes change.
    const handleCustomFieldSelectionOnRender = useCallback(
        (
            activeFields: CustomField[],
            enabled: boolean,
            fieldType: ObjectType,
            hasCustomFieldInTree: boolean,
            isFetched: boolean,
            selectedField: CustomField | null,
            setSelectedField: (field: CustomField) => void,
        ) => {
            if (
                !enabled ||
                selectedField ||
                !isFetched ||
                activeFields.length === 0
            ) {
                return
            }

            if (hasCustomFieldInTree && customFieldIdFromTree) {
                const matchingField = activeFields.find(
                    (field) => field.id === customFieldIdFromTree,
                )
                if (matchingField) {
                    setSelectedField(matchingField)
                    return
                }
            }

            selectCustomFieldByType(activeFields[0], fieldType)
        },
        [customFieldIdFromTree, selectCustomFieldByType],
    )

    const displayedValue = useMemo(() => {
        const valuePath = getAstPath(property, object)
        const jointValuePath = valuePath.join('.')
        const categoryElements =
            IDENTIFIER_VARIABLES_BY_CATEGORY[getCategoryFromPath(valuePath)]

        return categoryElements
            .reduce(
                (acc, element) => acc.concat(element.children || [element]),
                [] as IdentifierElement[],
            )
            .find((element) =>
                jointValuePath.includes(element.value),
            ) as IdentifierElement
    }, [object, property])

    // Fetch available custom fields
    const {
        data: { data: customFields = [] } = {},
        isLoading: isLoadingCustomFields,
        isFetched,
    } = useCustomFieldDefinitions(
        {
            archived: false,
            object_type: 'Ticket',
        },
        {
            query: {
                enabled: showCustomFieldSelection,
            },
        },
    )

    // Fetch available customer custom fields
    const {
        data: { data: customerCustomFields = [] } = {},
        isLoading: isLoadingCustomerCustomFields,
        isFetched: isCustomerCustomFieldsFetched,
    } = useCustomFieldDefinitions(
        {
            archived: false,
            object_type: 'Customer',
        },
        {
            query: {
                enabled: showCustomerCustomFieldSelection,
            },
        },
    )

    const activeCustomFields = useMemo(
        () => customFields.filter((field) => !field.deactivated_datetime),
        [customFields],
    )

    const activeCustomerCustomFields = useMemo(
        () =>
            customerCustomFields.filter((field) => !field.deactivated_datetime),
        [customerCustomFields],
    )

    const isInstagramProfileInRulesEnabled = useFlag(
        FeatureFlagKey.RulesAddInstagramProfileIntegration,
        false,
    )

    const filteredCategories = useMemo(() => {
        return IDENTIFIER_CATEGORIES.filter((category) => {
            switch (category.value) {
                case IdentifierCategoryKey.ShopifyCustomer:
                case IdentifierCategoryKey.ShopifyLastOrder:
                    return hasIntegrationType(IntegrationType.Shopify)
                case IdentifierCategoryKey.ShopifyCustomerMetafields:
                case IdentifierCategoryKey.ShopifyLastOrderMetafields:
                case IdentifierCategoryKey.ShopifyLastDraftOrderMetafields:
                    return (
                        hasIntegrationType(IntegrationType.Shopify) &&
                        enableShopifyMetafieldsInRules
                    )
                case IdentifierCategoryKey.Magento2Customer:
                case IdentifierCategoryKey.Magento2LastOrder:
                    return hasIntegrationType(IntegrationType.Magento2)
                case IdentifierCategoryKey.RechargeLastSubscription:
                case IdentifierCategoryKey.RechargeCustomer:
                    return hasIntegrationType(IntegrationType.Recharge)
                case IdentifierCategoryKey.SmileCustomer:
                    return hasIntegrationType(IntegrationType.Smile)
                case IdentifierCategoryKey.BigCommerceCustomer:
                case IdentifierCategoryKey.BigCommerceLastOrder:
                    return hasIntegrationType(IntegrationType.BigCommerce)
                case IdentifierCategoryKey.InstagramProfile:
                    return (
                        isInstagramProfileInRulesEnabled &&
                        hasIntegrationType(IntegrationType.Facebook)
                    )
                case IdentifierCategoryKey.SelfServiceFlow:
                    return hasAccess
                default:
                    return true
            }
        })
    }, [
        hasIntegrationType,
        hasAccess,
        enableShopifyMetafieldsInRules,
        isInstagramProfileInRulesEnabled,
    ])

    const handleSelect = (value: string) => {
        setSelectedCategory(null)
        resetMetafieldSelection()

        if (value === CustomFieldTreePath.Ticket) {
            setShowCustomFieldSelection(true)
            setShowCustomerCustomFieldSelection(false)
            selectCustomFieldByType(activeCustomFields[0], ObjectType.Ticket)
            return
        }
        if (value === CustomFieldTreePath.Customer) {
            setShowCustomerCustomFieldSelection(true)
            setShowCustomFieldSelection(false)
            selectCustomFieldByType(
                activeCustomerCustomFields[0],
                ObjectType.Customer,
            )
            return
        }
        setShowCustomFieldSelection(false)
        setShowCustomerCustomFieldSelection(false)
        actions.modifyCodeAST(
            parent,
            fromJS(generateExpression(value.split('.').reverse())),
            RuleOperation.Update,
            undefined,
            getFieldSchemaDefinitionKey(activeCustomFields[0]),
        )
    }

    useEffect(() => {
        handleCustomFieldSelectionOnRender(
            activeCustomFields,
            showCustomFieldSelection,
            ObjectType.Ticket,
            hasCustomTicketFieldInTree,
            isFetched,
            selectedTicketCustomField,
            setSelectedTicketCustomField,
        )
    }, [
        activeCustomFields,
        handleCustomFieldSelectionOnRender,
        hasCustomTicketFieldInTree,
        isFetched,
        selectedTicketCustomField,
        showCustomFieldSelection,
    ])

    useEffect(() => {
        handleCustomFieldSelectionOnRender(
            activeCustomerCustomFields,
            showCustomerCustomFieldSelection,
            ObjectType.Customer,
            hasCustomCustomerFieldInTree,
            isCustomerCustomFieldsFetched,
            selectedCustomerCustomField,
            setSelectedCustomerCustomField,
        )
    }, [
        activeCustomerCustomFields,
        handleCustomFieldSelectionOnRender,
        hasCustomCustomerFieldInTree,
        isCustomerCustomFieldsFetched,
        selectedCustomerCustomField,
        showCustomerCustomFieldSelection,
    ])

    const valueLabel = useMemo(() => {
        if (selectedMetafield && showMetafieldSelection) {
            return (
                <MetafieldValueLabel
                    selectedMetafield={selectedMetafield}
                    displayStoreName={displayStoreName}
                />
            )
        }

        if (!displayedValue) {
            return null
        }
        const integrationName = displayedValue.value.includes('shopify')
            ? IntegrationType.Shopify
            : displayedValue.value.includes('recharge')
              ? IntegrationType.Recharge
              : displayedValue.value.includes('magento')
                ? IntegrationType.Magento2
                : displayedValue.value.includes('smile')
                  ? IntegrationType.Smile
                  : displayedValue.value.includes('bigcommerce')
                    ? IntegrationType.BigCommerce
                    : null
        const integrationUrl = integrationName
            ? getIconFromUrl(`integrations/${integrationName}-mono.svg`)
            : null

        return (
            <>
                {integrationUrl && (
                    <div
                        className={css.logo}
                        style={{
                            mask: `url(${integrationUrl})`,
                            WebkitMask: `url(${integrationUrl})`,
                        }}
                    />
                )}
                {displayedValue.text}
            </>
        )
    }, [
        displayedValue,
        selectedMetafield,
        showMetafieldSelection,
        displayStoreName,
    ])

    return (
        <div className={css.memberExpressionContainer}>
            {/* First dropdown - for selecting categories */}
            <RuleSelect
                className="IdentifierDropdown"
                dropdownClassName={classnames(css.dropdown, {
                    [css.isCategorySelected]: selectedCategory != null,
                })}
                placeholder="Add variables..."
                valueLabel={valueLabel}
            >
                {selectedCategory == null ? (
                    filteredCategories.map((category) => {
                        return (
                            <RuleSelect.Option
                                key={category.value}
                                onClick={() =>
                                    setSelectedCategory(category.value)
                                }
                                toggle={false}
                                value={category.value}
                            >
                                <span className={css.optionContent}>
                                    <span className={css.categoryLabel}>
                                        {category.label}
                                    </span>
                                    <i
                                        className={classnames(
                                            css.optionArrow,
                                            'material-icons',
                                        )}
                                    >
                                        keyboard_arrow_right
                                    </i>
                                </span>
                            </RuleSelect.Option>
                        )
                    })
                ) : (
                    <>
                        <div
                            className={css.backOption}
                            onClick={() => {
                                setSelectedCategory(null)
                                setMetafieldLevel('stores')
                                setSelectedStore(null)
                            }}
                        >
                            <span className={css.optionContent}>
                                <i
                                    className={classnames(
                                        css.backArrow,
                                        'material-icons mr-1',
                                    )}
                                >
                                    arrow_back
                                </i>
                                {
                                    IDENTIFIER_CATEGORIES.find(
                                        (category) =>
                                            category.value === selectedCategory,
                                    )?.label
                                }
                            </span>
                        </div>
                        <div className={css.subOptions}>
                            {isMetafieldCategory(selectedCategory) && (
                                <MetafieldCategoryOptions
                                    selectedCategory={selectedCategory}
                                    shopifyIntegrations={shopifyIntegrations}
                                    selectedStore={selectedStore}
                                    metafieldLevel={metafieldLevel}
                                    metafields={metafields}
                                    isLoadingMetafields={isLoadingMetafields}
                                    onSelectStore={(store) => {
                                        setSelectedStore(store)
                                        setMetafieldLevel('metafields')
                                    }}
                                    onBackToStores={() => {
                                        setMetafieldLevel('stores')
                                        setSelectedStore(null)
                                    }}
                                    onSelectMetafield={(field, category) => {
                                        setSelectedCategory(null)
                                        selectMetafield(field, category)
                                    }}
                                />
                            )}
                            {!isMetafieldCategory(selectedCategory) &&
                                IDENTIFIER_VARIABLES_BY_CATEGORY[
                                    selectedCategory
                                ].map((subcategory) => {
                                    return subcategory.children ? (
                                        <Fragment key={subcategory.label}>
                                            <div
                                                className={css.subcategoryLabel}
                                            >
                                                {subcategory.label}
                                            </div>
                                            {subcategory.children.map(
                                                (element) => {
                                                    return (
                                                        <RuleSelect.Option
                                                            className={
                                                                css.subOption
                                                            }
                                                            key={element.value}
                                                            onClick={() =>
                                                                handleSelect(
                                                                    element.value,
                                                                )
                                                            }
                                                            value={
                                                                element.value
                                                            }
                                                        >
                                                            {element.label}
                                                        </RuleSelect.Option>
                                                    )
                                                },
                                            )}
                                        </Fragment>
                                    ) : (
                                        <RuleSelect.Option
                                            className={css.subOption}
                                            key={subcategory.value}
                                            onClick={() =>
                                                handleSelect(subcategory.value)
                                            }
                                            value={subcategory.value}
                                        >
                                            {subcategory.label}
                                        </RuleSelect.Option>
                                    )
                                })}
                        </div>
                    </>
                )}
            </RuleSelect>

            {/* Only shown when Custom Fields is selected */}
            {showCustomFieldSelection && (
                <RuleSelect
                    className="IdentifierDropdown"
                    dropdownClassName={css.dropdown}
                    placeholder="Select Custom Field..."
                    valueLabel={selectedTicketCustomField?.label}
                >
                    {isLoadingCustomFields
                        ? 'Loading custom fields...'
                        : activeCustomFields.map((field) => (
                              <RuleSelect.Option
                                  key={field.id}
                                  onClick={() =>
                                      selectCustomFieldByType(
                                          field,
                                          ObjectType.Ticket,
                                      )
                                  }
                                  value={field.id.toString()}
                              >
                                  {field.label}
                              </RuleSelect.Option>
                          ))}
                </RuleSelect>
            )}

            {/* Only shown when Customer Fields is selected */}
            {showCustomerCustomFieldSelection && (
                <RuleSelect
                    className="IdentifierDropdown"
                    dropdownClassName={css.dropdown}
                    placeholder="Select Custom Field..."
                    valueLabel={selectedCustomerCustomField?.label}
                >
                    {isLoadingCustomerCustomFields
                        ? 'Loading customer custom fields...'
                        : activeCustomerCustomFields.map((field) => (
                              <RuleSelect.Option
                                  key={field.id}
                                  onClick={() =>
                                      selectCustomFieldByType(
                                          field,
                                          ObjectType.Customer,
                                      )
                                  }
                                  value={field.id.toString()}
                              >
                                  {field.label}
                              </RuleSelect.Option>
                          ))}
                </RuleSelect>
            )}
        </div>
    )
}

export default MemberExpression
