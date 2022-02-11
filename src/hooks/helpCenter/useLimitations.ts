import {useSelector} from 'react-redux'

import {getArticles} from 'state/entities/helpCenter/articles'
import {
    HELP_CENTER_MAX_ARTICLES,
    HELP_CENTER_MAX_ARTICLES_WARNING_THRESHOLD,
} from 'pages/settings/helpCenter/constants'

type Limitation = {
    disabled: boolean
    warningThreshold: boolean
    currentNumber: number
}

export const useLimitations = (): {[actionName: string]: Limitation} => {
    const articles = useSelector(getArticles)

    const articleCreationLimitation = {
        currentNumber: articles.length,
        disabled: articles.length >= HELP_CENTER_MAX_ARTICLES,
        warningThreshold:
            articles.length >= HELP_CENTER_MAX_ARTICLES_WARNING_THRESHOLD,
    }

    return {
        createArticle: articleCreationLimitation,
        duplicateArticle: articleCreationLimitation,
    }
}
