import {CATEGORY_ROW_ACTIONS, CATEGORY_TREE_MAX_LEVEL} from '../constants'
import {useAbilityChecker} from './useHelpCenterApi'

/**
 * For a given category row, returns the authorized actions
 * @param categoryId number
 * @param level current category level
 * @returns TableActions actions
 */
export const useCategoryRowActions = (categoryId: number, level: number) => {
    const {isPassingRulesCheck} = useAbilityChecker()

    return CATEGORY_ROW_ACTIONS.map(({name, icon, tooltip}) => {
        let isDisabled = false
        switch (name) {
            case 'categorySettings':
                isDisabled = !isPassingRulesCheck(
                    ({can}) =>
                        can('create', 'ArticleEntity') ||
                        can('create', 'CategoryEntity')
                )
                break
            case 'createNestedCategory':
                isDisabled =
                    level >= CATEGORY_TREE_MAX_LEVEL ||
                    !isPassingRulesCheck(({can}) =>
                        can('create', 'CategoryEntity')
                    )
                break
            case 'createNestedArticle':
                isDisabled = !isPassingRulesCheck(({can}) =>
                    can('create', 'ArticleEntity')
                )
                break
            default:
                isDisabled = false
        }

        return {
            name,
            icon,
            disabled: isDisabled,
            tooltip: {
                content: tooltip,
                target: `${name}-${categoryId}`,
            },
        }
    })
}
