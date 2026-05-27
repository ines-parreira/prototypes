import { getReferenceVisual } from '../../icons'
import { useGuidanceReferenceData } from '../article/useGuidanceReferenceData'
import { ReferenceCardError } from '../shared/ReferenceCardError'
import { ReferenceCardSkeleton } from '../shared/ReferenceCardSkeleton'
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
        return (
            <ReferenceCardSkeleton
                icon={VISUAL.icon}
                typeLabel={VISUAL.label}
                withBody={false}
                footerRows={2}
            />
        )
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
