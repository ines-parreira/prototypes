import classNames from 'classnames'

import { TemplateCard } from 'pages/common/components/TemplateCard'

import type { AIGuidance } from '../../types'

import css from './GuidanceAiSuggestionCard.less'

type Props = {
    guidanceAiSuggestion: AIGuidance
    onClick: () => void
}

export const GuidanceAiSuggestionCard = ({
    guidanceAiSuggestion,
    onClick,
}: Props) => {
    return (
        <TemplateCard
            onClick={onClick}
            className={css.card}
            showOnlyTitle
            tag={
                <div className={css.tag}>
                    <i
                        className={classNames(
                            'material-icons',
                            css.autoAwesome,
                        )}
                    >
                        auto_awesome
                    </i>
                </div>
            }
            title={guidanceAiSuggestion.name}
        />
    )
}
