import {useLimitations} from 'hooks/helpCenter/useLimitations'

import {useAbilityChecker} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {ARTICLE_ROW_ACTIONS} from '../constants'

/**
 * For a given article row, returns the authorized actions to perform
 * @param articleId number
 * @returns TableActions actions
 */
export const useArticleRowActions = (articleId: number) => {
    const limitations = useLimitations()
    const {isPassingRulesCheck} = useAbilityChecker()

    return ARTICLE_ROW_ACTIONS.map(({icon, name, tooltip}) => {
        const isDisabled =
            name === 'copyToClipboard'
                ? false
                : isPassingRulesCheck(
                      ({can}) =>
                          can('create', 'ArticleEntity') &&
                          can('update', 'ArticleEntity')
                  )
                ? limitations[name]?.disabled
                : true

        return {
            icon,
            name,
            tooltip: {
                content: tooltip,
                target: `${name}-${articleId}`,
            },
            disabled: isDisabled,
        }
    })
}
