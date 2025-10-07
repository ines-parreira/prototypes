import { DEFAULT_LOCALE } from 'domains/reporting/pages/common/utils'

import { KnowledgeEditorSidePanelFieldPercentage } from '../KnowledgeEditorSidePanelCommonFields'
import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanelSection'
import { KnowledgeEditorSidePanelTwoColumnsContent } from '../KnowledgeEditorSidePanelTwoColumnsContent'

import css from './KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement.less'

type Props = {
    views?: number
    rating?: number // 0.0 to 1.0
    reactions?: {
        positive: number
        negative: number
    }
    sectionId: string
    reportUrl?: string
}

export const KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement = ({
    views,
    rating,
    reactions,
    reportUrl,
    sectionId,
}: Props) => (
    <KnowledgeEditorSidePanelSection
        header={{ title: 'Engagement', subtitle: 'Last 28 days' }}
        sectionId={sectionId}
        bottomLink={{
            text: 'View report',
            url: reportUrl,
        }}
    >
        <KnowledgeEditorSidePanelTwoColumnsContent
            columns={[
                ['Views', views ? views.toLocaleString(DEFAULT_LOCALE) : '-'],
                [
                    'Rating',
                    <KnowledgeEditorSidePanelFieldPercentage
                        key="rating"
                        percentage={rating}
                    />,
                ],
                [
                    'Reactions',
                    <Reactions key="reactions" reactions={reactions} />,
                ],
            ]}
        />
    </KnowledgeEditorSidePanelSection>
)

const Reactions = ({ reactions }: Pick<Props, 'reactions'>) => (
    <div className={css.reactions}>
        {reactions?.positive || '-'} 👍 | {reactions?.negative || '-'} 👎
    </div>
)
