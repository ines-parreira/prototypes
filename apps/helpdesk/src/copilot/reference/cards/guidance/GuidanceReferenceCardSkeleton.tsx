import { getReferenceVisual } from '../../icons'
import { ArticleReferenceCardSkeleton } from '../article/ArticleReferenceCardSkeleton'

const VISUAL = getReferenceVisual('guidance')

export function GuidanceReferenceCardSkeleton() {
    return (
        <ArticleReferenceCardSkeleton
            icon={VISUAL.icon}
            typeLabel={VISUAL.label}
            typeColor="blue"
            hasBody
        />
    )
}
