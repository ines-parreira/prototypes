import {
    AIArticleToggleOption,
    AIArticleToggleOptionValue,
} from 'models/helpCenter/types'

export const AI_ARTICLES_TOGGLE_OPTIONS: AIArticleToggleOption[] = [
    {
        label: (
            <>
                <i className="material-icons">auto_awesome</i> New
            </>
        ),
        value: AIArticleToggleOptionValue.New,
    },
    {
        label: 'Past Suggestions',
        value: AIArticleToggleOptionValue.Old,
    },
    {
        label: 'All',
        value: AIArticleToggleOptionValue.All,
    },
]
