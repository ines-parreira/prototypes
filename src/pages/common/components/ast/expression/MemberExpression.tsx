import classnames from 'classnames'
import {Map, List} from 'immutable'
import React, {useMemo, useState, useCallback, Fragment} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {IntegrationType} from '../../../../../models/integration/types'
import {
    IDENTIFIER_CATEGORIES,
    IDENTIFIER_VARIABLES_BY_CATEGORY,
} from '../../../../../models/rule/constants'
import {
    IdentifierCategoryKey,
    IdentifierElement,
} from '../../../../../models/rule/types'
import {
    getAstPath,
    getFormattedRule,
    getCategoryFromPath,
} from '../../../../../models/rule/utils'
import {RootState} from '../../../../../state/types'
import {getIconFromUrl} from '../../../../../state/integrations/helpers'
import {ruleUpdated} from '../../../../../state/rules/actions'
import {ObjectExpressionPropertyKey} from '../../../../../state/rules/types'
import {makeHasIntegrationOfTypes} from '../../../../../state/integrations/selectors'
import RuleSelect from '../widget/RuleSelect'

import css from './MemberExpression.less'

type OwnProps = {
    object: ObjectExpressionPropertyKey
    property: ObjectExpressionPropertyKey
    rule: Map<any, any>
    parent: List<any>
    filteredIntegrationTypes?: IntegrationType[]
}

export function MemberExpressionContainer({
    hasIntegrationType,
    object,
    property,
    rule,
    parent,
    ruleUpdated,
    filteredIntegrationTypes = [
        IntegrationType.ShopifyIntegrationType,
        IntegrationType.Magento2IntegrationType,
        IntegrationType.RechargeIntegrationType,
        IntegrationType.SmileIntegrationType,
    ],
}: OwnProps & ConnectedProps<typeof connector>) {
    const [
        selectedCategory,
        setSelectedCategory,
    ] = useState<IdentifierCategoryKey | null>(null)
    const displayedValue = useMemo(() => {
        const valuePath = getAstPath(property, object)
        const jointValuePath = valuePath.join('.')
        const categoryElements =
            IDENTIFIER_VARIABLES_BY_CATEGORY[getCategoryFromPath(valuePath)]

        return categoryElements
            .reduce(
                (acc, element) => acc.concat(element.children || [element]),
                [] as IdentifierElement[]
            )
            .find((element) => {
                return element.value === jointValuePath
            }) as IdentifierElement
    }, [property, object])

    const filteredCategories = useMemo(() => {
        return IDENTIFIER_CATEGORIES.filter((category) => {
            const currentIntegration = filteredIntegrationTypes.find(
                (integrationType) => category.value.startsWith(integrationType)
            )

            return !currentIntegration || hasIntegrationType(currentIntegration)
        })
    }, [])

    const handleSelect = useCallback(
        (value) => {
            ruleUpdated(getFormattedRule(rule, value, parent))
            setSelectedCategory(null)
        },
        [rule, parent]
    )

    const valueLabel = useMemo(() => {
        if (!displayedValue) {
            return null
        }
        const integrationName = displayedValue.value.includes('shopify')
            ? IntegrationType.ShopifyIntegrationType
            : displayedValue.value.includes('recharge')
            ? IntegrationType.RechargeIntegrationType
            : displayedValue.value.includes('magento')
            ? IntegrationType.Magento2IntegrationType
            : displayedValue.value.includes('smile')
            ? IntegrationType.SmileIntegrationType
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

    return (
        <RuleSelect
            className="IdentifierDropdown"
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
                            {category.label}
                            <i
                                className={classnames(
                                    css.optionArrow,
                                    'material-icons md-2'
                                )}
                            >
                                keyboard_arrow_right
                            </i>
                        </RuleSelect.Option>
                    )
                })
            ) : (
                <>
                    <div
                        className={css.backOption}
                        onClick={() => setSelectedCategory(null)}
                    >
                        <i className="material-icons mr-1">arrow_back</i>
                        {
                            IDENTIFIER_CATEGORIES.find(
                                (category) =>
                                    category.value === selectedCategory
                            )?.label
                        }
                    </div>
                    <div className={css.subOptions}>
                        {IDENTIFIER_VARIABLES_BY_CATEGORY[selectedCategory].map(
                            (subcategory) => {
                                return subcategory.children ? (
                                    <Fragment key={subcategory.label}>
                                        <div className={css.subcategoryLabel}>
                                            {subcategory.label}
                                        </div>
                                        {subcategory.children.map((element) => {
                                            return (
                                                <RuleSelect.Option
                                                    key={element.value}
                                                    onClick={() =>
                                                        handleSelect(
                                                            element.value
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
                                        key={subcategory.value}
                                        onClick={() =>
                                            handleSelect(subcategory.value)
                                        }
                                        value={subcategory.value}
                                    >
                                        {subcategory.label}
                                    </RuleSelect.Option>
                                )
                            }
                        )}
                    </div>
                </>
            )}
        </RuleSelect>
    )
}

const connector = connect(
    (state: RootState) => ({
        hasIntegrationType: makeHasIntegrationOfTypes(state),
    }),
    {
        ruleUpdated,
    }
)

export default connector(MemberExpressionContainer)
