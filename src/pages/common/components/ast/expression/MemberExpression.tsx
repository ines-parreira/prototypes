import classnames from 'classnames'
import {List, fromJS} from 'immutable'
import React, {useMemo, useState, Fragment} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import _camelCase from 'lodash/camelCase'

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
    getCategoryFromPath,
    generateExpression,
} from '../../../../../models/rule/utils'
import {RootState} from '../../../../../state/types'
import {
    ObjectExpressionPropertyKey,
    RuleOperation,
} from '../../../../../state/rules/types'
import {makeHasIntegrationOfTypes} from '../../../../../state/integrations/selectors'
import {RuleItemActions} from '../../../../settings/rules/types'
import RuleSelect from '../widget/RuleSelect'
import {getIconFromUrl} from '../../../../../utils'

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
    object,
    property,
    parent,
    filteredIntegrationTypes = [
        IntegrationType.Shopify,
        IntegrationType.Magento2,
        IntegrationType.Recharge,
        IntegrationType.Smile,
        IntegrationType.SelfService,
    ],
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
                [] as IdentifierElement[]
            )
            .find((element) => {
                return element.value === jointValuePath
            }) as IdentifierElement
    }, [property, object])

    const filteredCategories = useMemo(() => {
        return IDENTIFIER_CATEGORIES.filter((category) => {
            const currentIntegration = filteredIntegrationTypes.find(
                (integrationType) =>
                    category.value.startsWith(_camelCase(integrationType))
            )

            return !currentIntegration || hasIntegrationType(currentIntegration)
        })
    }, [])

    const handleSelect = (value: string) => {
        const expression = fromJS(
            generateExpression(value.split('.').reverse())
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
                                        'material-icons'
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
                                    'material-icons mr-1'
                                )}
                            >
                                arrow_back
                            </i>
                            {
                                IDENTIFIER_CATEGORIES.find(
                                    (category) =>
                                        category.value === selectedCategory
                                )?.label
                            }
                        </span>
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
                                                    className={css.subOption}
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
                            }
                        )}
                    </div>
                </>
            )}
        </RuleSelect>
    )
}

const connector = connect((state: RootState) => ({
    hasIntegrationType: makeHasIntegrationOfTypes(state),
}))

export default connector(MemberExpressionContainer)
