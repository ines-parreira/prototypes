import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import classnames from 'classnames'
import { Expression } from 'estree'
import { fromJS, List } from 'immutable'

import { CustomField } from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import {
    IDENTIFIER_CATEGORIES,
    IDENTIFIER_VARIABLES_BY_CATEGORY,
} from 'models/rule/constants'
import { IdentifierCategoryKey, IdentifierElement } from 'models/rule/types'
import {
    generateExpression,
    getAstPath,
    getCategoryFromPath,
} from 'models/rule/utils'
import { RuleItemActions } from 'pages/settings/rules/types'
import { getHasAutomate } from 'state/billing/selectors'
import { makeHasIntegrationOfTypes } from 'state/integrations/selectors'
import { ObjectExpressionPropertyKey, RuleOperation } from 'state/rules/types'
import { getIconFromUrl } from 'utils'

import { getFieldSchemaDefinitionKey } from '../../ViewTable/Filters/utils'
import RuleSelect from '../widget/RuleSelect'

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
    const hasIntegrationType = useAppSelector(makeHasIntegrationOfTypes)
    const hasAutomate = useAppSelector(getHasAutomate)
    const [selectedCategory, setSelectedCategory] =
        useState<IdentifierCategoryKey | null>(null)
    const [showCustomFieldSelection, setShowCustomFieldSelection] =
        useState(false)
    const [selectedCustomField, setSelectedCustomField] =
        useState<CustomField | null>(null)

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
    }, [property, object])

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

    const activeCustomFields = useMemo(
        () => customFields.filter((field) => !field.deactivated_datetime),
        [customFields],
    )

    const filteredCategories = useMemo(() => {
        return IDENTIFIER_CATEGORIES.filter((category) => {
            switch (category.value) {
                case IdentifierCategoryKey.ShopifyCustomer:
                case IdentifierCategoryKey.ShopifyLastOrder:
                    return hasIntegrationType(IntegrationType.Shopify)
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
                case IdentifierCategoryKey.SelfServiceFlow:
                    return hasAutomate
                default:
                    return true
            }
        })
    }, [hasIntegrationType, hasAutomate])

    const handleSelect = (value: string) => {
        setSelectedCategory(null)
        if (value === 'ticket.custom_fields') {
            setShowCustomFieldSelection(true)
            handleSelectCustomField(activeCustomFields[0])
            return
        }
        setShowCustomFieldSelection(false)
        actions.modifyCodeAST(
            parent,
            fromJS(generateExpression(value.split('.').reverse())),
            RuleOperation.Update,
            undefined,
            getFieldSchemaDefinitionKey(activeCustomFields[0]),
        )
    }

    const handleSelectCustomField = useCallback(
        (field?: CustomField) => {
            if (!field) {
                return
            }
            setSelectedCustomField(field)
            actions.modifyCodeAST(
                parent,
                fromJS(
                    generateExpression([
                        'value',
                        field.id.toString(),
                        'custom_fields',
                        'ticket',
                    ]),
                ),
                RuleOperation.Update,
                undefined,
                getFieldSchemaDefinitionKey(field),
            )
        },
        [actions, parent],
    )

    useEffect(() => {
        if (
            showCustomFieldSelection &&
            !selectedCustomField &&
            isFetched &&
            activeCustomFields.length > 0
        ) {
            handleSelectCustomField(activeCustomFields[0])
        }
    }, [
        activeCustomFields,
        handleSelectCustomField,
        isFetched,
        selectedCustomField,
        showCustomFieldSelection,
    ])

    const valueLabel = useMemo(() => {
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
    }, [displayedValue])

    const isCustomFieldsInRulesConditionsEnabled = useFlag(
        FeatureFlagKey.TicketCustomFieldsInRuleConditions,
        false,
    )

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
                            onClick={() => setSelectedCategory(null)}
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
                            {IDENTIFIER_VARIABLES_BY_CATEGORY[
                                selectedCategory
                            ].map((subcategory) => {
                                if (
                                    subcategory.value ===
                                        'ticket.custom_fields' &&
                                    !isCustomFieldsInRulesConditionsEnabled
                                ) {
                                    return null
                                }

                                return subcategory.children ? (
                                    <Fragment key={subcategory.label}>
                                        <div className={css.subcategoryLabel}>
                                            {subcategory.label}
                                        </div>
                                        {subcategory.children.map((element) => {
                                            return (
                                                <RuleSelect.Option
                                                    className={css.subOption}
                                                    key={element.value}
                                                    onClick={() =>
                                                        handleSelect(
                                                            element.value,
                                                        )
                                                    }
                                                    value={element.value}
                                                >
                                                    {element.label}
                                                </RuleSelect.Option>
                                            )
                                        })}
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

            {/* Second dropdown - for selecting custom fields (only shown when Custom Fields is selected) */}
            {showCustomFieldSelection && (
                <RuleSelect
                    className="IdentifierDropdown"
                    dropdownClassName={css.dropdown}
                    placeholder="Select Custom Field..."
                    valueLabel={selectedCustomField?.label}
                >
                    {isLoadingCustomFields
                        ? 'Loading custom fields...'
                        : activeCustomFields.map((field) => (
                              <RuleSelect.Option
                                  key={field.id}
                                  onClick={() => handleSelectCustomField(field)}
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
