import { useMemo } from 'react'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { guidanceVariables } from 'pages/aiAgent/components/GuidanceEditor/variables'
import { stripHTML } from 'utils'

import { getReferenceVisual } from '../../icons'
import { renderGuidanceContent } from '../article/inline/renderGuidanceContent'
import { useGuidanceReferenceData } from '../article/useGuidanceReferenceData'
import { ReferenceCardError } from '../shared/ReferenceCardError'
import { GuidanceReferenceCardSkeleton } from './GuidanceReferenceCardSkeleton'
import { GuidanceReferenceCardView } from './GuidanceReferenceCardView'

type Props = {
    articleId: number
    shopName: string
    shopType: string
    isOpen: boolean
}

const VISUAL = getReferenceVisual('guidance')

export function GuidanceReferenceCard({
    articleId,
    shopName,
    shopType,
    isOpen,
}: Props) {
    const { article, isLoading, isError } = useGuidanceReferenceData({
        shopName,
        articleId,
        enabled: isOpen,
    })

    // Same actions data the guidance editor uses, lazy-gated on hover.
    const { guidanceActions } = useGetGuidancesAvailableActions(
        shopName,
        shopType,
        isOpen,
    )

    const body = useMemo(() => {
        if (!article?.content) return null
        return renderGuidanceContent(
            stripHTML(article.content) ?? '',
            guidanceVariables,
            guidanceActions,
        )
    }, [article?.content, guidanceActions])

    if (isLoading) {
        return <GuidanceReferenceCardSkeleton />
    }

    if (isError || !article) {
        return (
            <ReferenceCardError
                icon={VISUAL.icon}
                typeLabel={VISUAL.label}
                message="Couldn't load this guidance."
            />
        )
    }

    return <GuidanceReferenceCardView article={article} body={body} />
}
