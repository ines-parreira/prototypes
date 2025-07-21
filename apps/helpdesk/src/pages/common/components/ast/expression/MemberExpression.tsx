import React, { Fragment, useMemo, useState } from 'react'

import classnames from 'classnames'
import { fromJS, List } from 'immutable'
import { connect, ConnectedProps } from 'react-redux'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
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
import { RootState } from 'state/types'
import { getIconFromUrl } from 'utils'

import RuleSelect from '../widget/RuleSelect'

import css from './MemberExpression.less'

type OwnProps = {
    object: ObjectExpressionPropertyKey
    property: ObjectExpressionPropertyKey
    parent: List<any>
    filteredIntegrationTypes?: IntegrationType[]
    actions: RuleItemActions
}

export function MemberExpressionContainer({
    hasIntegrationType,
    hasAutomate,
    object,
    property,
    parent,
    actions,
}: OwnProps & ConnectedProps<typeof connector>) {
    const [selectedCategory, setSelectedCategory] =
        useState<IdentifierCategoryKey | null>(null)
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
            .find((element) => {
                return element.value === jointValuePath
            }) as IdentifierElement
    }, [property, object])

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
        const expression = fromJS(
            generateExpression(value.split('.').reverse()),
        )
        actions.modifyCodeAST(parent, expression, RuleOperation.Update)
        setSelectedCategory(null)
    }

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

    const isPriorityUsageEnabled = useFlag(
        FeatureFlagKey.TicketAllowPriorityUsage,
        false,
    )

    return (
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
                            onClick={() => setSelectedCategory(category.value)}
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
                        {IDENTIFIER_VARIABLES_BY_CATEGORY[selectedCategory].map(
                            (subcategory) => {
                                if (
                                    subcategory.value === 'ticket.priority' &&
                                    !isPriorityUsageEnabled
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
                            },
                        )}
                    </div>
                </>
            )}
        </RuleSelect>
    )
}

const connector = connect((state: RootState) => ({
    hasIntegrationType: makeHasIntegrationOfTypes(state),
    hasAutomate: getHasAutomate(state),
}))

export default connector(MemberExpressionContainer)
