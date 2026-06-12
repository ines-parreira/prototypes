import type { GuidanceArticle } from 'pages/aiAgent/types'

import { getReferenceVisual } from '../../icons'
import { ArticleReferenceCard } from '../article/ArticleReferenceCard'

const VISUAL = getReferenceVisual('skill')

export function SkillReferenceCardView({
    article,
}: {
    article: GuidanceArticle
}) {
    return (
        <ArticleReferenceCard
            article={article}
            icon={VISUAL.icon}
            typeLabel={VISUAL.label}
        />
    )
}
