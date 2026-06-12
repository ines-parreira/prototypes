import { getReferenceVisual } from '../../icons'
import { ArticleReferenceCardSkeleton } from '../article/ArticleReferenceCardSkeleton'

const VISUAL = getReferenceVisual('skill')

export function SkillReferenceCardSkeleton() {
    return (
        <ArticleReferenceCardSkeleton
            icon={VISUAL.icon}
            typeLabel={VISUAL.label}
        />
    )
}
