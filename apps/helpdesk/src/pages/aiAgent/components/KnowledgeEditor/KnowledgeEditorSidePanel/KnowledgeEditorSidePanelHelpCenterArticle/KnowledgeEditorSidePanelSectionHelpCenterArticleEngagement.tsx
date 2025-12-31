import { Skeleton } from '@gorgias/axiom'

import { DEFAULT_LOCALE } from 'domains/reporting/pages/common/utils'

import { KnowledgeEditorSidePanelFieldPercentage } from '../KnowledgeEditorSidePanelCommonFields'
import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanelSection'
import { KnowledgeEditorSidePanelTwoColumnsContent } from '../KnowledgeEditorSidePanelTwoColumnsContent'

import css from './KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement.less'

export type Props = {
    views?: number
    rating?: number // 0.0 to 1.0
    reactions?: {
        up: number
        down: number
    }
    sectionId: string
    isLoading?: boolean
}

export const KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement = ({
    views,
    rating,
    reactions,
    sectionId,
    isLoading,
}: Props) => (
    <KnowledgeEditorSidePanelSection
        header={{ title: 'Engagement', subtitle: 'Last 28 days' }}
        sectionId={sectionId}
    >
        <KnowledgeEditorSidePanelTwoColumnsContent
            columns={[
                {
                    left: 'Views',
                    right: isLoading ? (
                        <Skeleton key="views-loading" width={100} height={20} />
                    ) : views ? (
                        views.toLocaleString(DEFAULT_LOCALE)
                    ) : (
                        '-'
                    ),
                },
                {
                    left: 'Rating',
                    right: isLoading ? (
                        <Skeleton
                            key="rating-loading"
                            width={100}
                            height={20}
                        />
                    ) : (
                        <KnowledgeEditorSidePanelFieldPercentage
                            key="rating"
                            percentage={rating}
                        />
                    ),
                },
                {
                    left: 'Reactions',
                    right: isLoading ? (
                        <Skeleton
                            key="reactions-loading"
                            width={100}
                            height={20}
                        />
                    ) : (
                        <Reactions key="reactions" reactions={reactions} />
                    ),
                },
            ]}
        />
    </KnowledgeEditorSidePanelSection>
)

const Reactions = ({ reactions }: Pick<Props, 'reactions'>) => (
    <div className={css.reactions}>
        {reactions?.up || '-'} 👍 | {reactions?.down || '-'} 👎
    </div>
)
