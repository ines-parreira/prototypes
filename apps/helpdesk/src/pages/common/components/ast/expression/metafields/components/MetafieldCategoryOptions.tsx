import classnames from 'classnames'

import RuleSelect from '../../../widget/RuleSelect'
import type { MetafieldCategoryOptionsProps } from '../types'
import { getMetafieldCategoryType } from '../utils'

import css from '../../MemberExpression.less'

export function MetafieldCategoryOptions({
    selectedCategory,
    shopifyIntegrations,
    selectedStore,
    metafieldLevel,
    metafields,
    isLoadingMetafields,
    onSelectStore,
    onBackToStores,
    onSelectMetafield,
}: MetafieldCategoryOptionsProps) {
    const categoryType = getMetafieldCategoryType(selectedCategory)

    if (metafieldLevel === 'stores') {
        if (shopifyIntegrations.length === 0) {
            return (
                <div className={css.noMetafields}>No Shopify stores found</div>
            )
        }

        return (
            <>
                {shopifyIntegrations.map((store) => (
                    <RuleSelect.Option
                        className={css.subOption}
                        key={store.id}
                        onClick={() => onSelectStore(store)}
                        toggle={false}
                        value={store.id.toString()}
                    >
                        <span className={css.optionContent}>
                            <span className={css.categoryLabel}>
                                {store.name}
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
                ))}
            </>
        )
    }

    const filteredMetafields = metafields.filter(
        (field) => field.category === categoryType,
    )

    return (
        <>
            <div className={css.backOption} onClick={onBackToStores}>
                <span className={css.optionContent}>
                    <i
                        className={classnames(
                            css.backArrow,
                            'material-icons mr-1',
                        )}
                    >
                        arrow_back
                    </i>
                    {selectedStore?.name}
                </span>
            </div>
            {isLoadingMetafields ? (
                <div className={css.noMetafields}>Loading metafields...</div>
            ) : filteredMetafields.length === 0 ? (
                <div className={css.noMetafields}>No metafields found</div>
            ) : (
                filteredMetafields.map((field) => (
                    <RuleSelect.Option
                        className={css.subOption}
                        key={field.id}
                        onClick={() => onSelectMetafield(field, categoryType!)}
                        value={field.key}
                    >
                        {field.name}
                    </RuleSelect.Option>
                ))
            )}
        </>
    )
}
