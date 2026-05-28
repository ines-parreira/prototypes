import { getReferenceVisual } from '../../icons'
import { useGuidanceReferenceData } from '../article/useGuidanceReferenceData'
import { ReferenceCardError } from '../shared/ReferenceCardError'
import { SkillReferenceCardSkeleton } from './SkillReferenceCardSkeleton'
import { SkillReferenceCardView } from './SkillReferenceCardView'

type Props = {
    articleId: number
    shopName: string
    isOpen: boolean
}

const VISUAL = getReferenceVisual('skill')

export function SkillReferenceCard({ articleId, shopName, isOpen }: Props) {
    const { article, isLoading, isError } = useGuidanceReferenceData({
        shopName,
        articleId,
        enabled: isOpen,
    })

    if (isLoading) {
        return <SkillReferenceCardSkeleton />
    }

    if (isError || !article) {
        return (
            <ReferenceCardError
                icon={VISUAL.icon}
                typeLabel={VISUAL.label}
                message="Couldn't load this skill."
            />
        )
    }

    return <SkillReferenceCardView article={article} />
}
