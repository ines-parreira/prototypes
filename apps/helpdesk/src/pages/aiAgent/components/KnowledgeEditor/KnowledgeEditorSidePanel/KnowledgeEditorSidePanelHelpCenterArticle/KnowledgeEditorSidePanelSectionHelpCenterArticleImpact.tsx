import { formatCurrency } from 'domains/reporting/pages/common/utils'

import {
    KnowledgeEditorSidePanelFieldDescription,
    KnowledgeEditorSidePanelFieldPercentage,
} from '../KnowledgeEditorSidePanelCommonFields'
import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanelSection'
import { KnowledgeEditorSidePanelTwoColumnsContent } from '../KnowledgeEditorSidePanelTwoColumnsContent'

import css from './KnowledgeEditorSidePanelSectionHelpCenterArticleImpact.less'

type Props = {
    successRate?: number // 0.0 to 1.0
    csat?: number
    gmvInfluenced?: {
        value: number
        currency: string
    }
    sectionId: string
}

export const KnowledgeEditorSidePanelSectionHelpCenterArticleImpact = ({
    successRate,
    csat,
    gmvInfluenced,
    sectionId,
}: Props) => (
    <KnowledgeEditorSidePanelSection
        header={{ title: 'Impact', subtitle: 'Last 28 days' }}
        sectionId={sectionId}
    >
        <div className={css.container}>
            <KnowledgeEditorSidePanelFieldDescription description="AI Agent performance in tickets where this knowledge was used." />

            <KnowledgeEditorSidePanelTwoColumnsContent
                columns={[
                    [
                        'Success rate',
                        <KnowledgeEditorSidePanelFieldPercentage
                            key="success-rate"
                            percentage={successRate}
                        />,
                    ],
                    ['CSAT', csat ? csat : '-'],
                    [
                        'GMV influenced',
                        gmvInfluenced
                            ? formatCurrency(
                                  gmvInfluenced.value,
                                  gmvInfluenced.currency,
                              )
                            : '-',
                    ],
                ]}
            />
        </div>
    </KnowledgeEditorSidePanelSection>
)
