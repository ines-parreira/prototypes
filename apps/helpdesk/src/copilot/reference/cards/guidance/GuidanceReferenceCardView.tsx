import type { ReactNode } from 'react'

import type { GuidanceArticle } from 'pages/aiAgent/types'

import { getReferenceVisual } from '../../icons'
import { ArticleReferenceCard } from '../article/ArticleReferenceCard'

const VISUAL = getReferenceVisual('guidance')

type Props = {
    article: GuidanceArticle
    /**
     * Pre-rendered body preview — typically a mix of plain text and inline
     * action/variable pills produced by `renderGuidanceContent`. Same
     * placeholders, same labels, same data the editor uses.
     */
    body?: ReactNode
}

export function GuidanceReferenceCardView({ article, body }: Props) {
    return (
        <ArticleReferenceCard
            article={article}
            icon={VISUAL.icon}
            typeLabel={VISUAL.label}
            body={body}
        />
    )
}
