import classNames from 'classnames'

import { Icon, Text } from '@gorgias/axiom'

import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'

import type { TransformedArticle } from '../../types'

import css from './LinkToSkillRow.less'

interface LinkToSkillRowProps {
    article: TransformedArticle
    isSelected: boolean
    onToggle: (articleId: number) => void
}

export const LinkToSkillRow = ({
    article,
    isSelected,
    onToggle,
}: LinkToSkillRowProps) => {
    return (
        <div
            className={classNames(css.skillRow, {
                [css.skillRowSelected]: isSelected,
            })}
            role="option"
            aria-selected={isSelected}
            tabIndex={0}
            onClick={() => onToggle(article.id)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onToggle(article.id)
                }
            }}
        >
            <TruncatedTextWithTooltip tooltipContent={article.title}>
                <Text size="md">{article.title}</Text>
            </TruncatedTextWithTooltip>

            {isSelected && (
                <Icon
                    name="check"
                    size="sm"
                    color="var(--content-accent-default)"
                />
            )}
        </div>
    )
}
