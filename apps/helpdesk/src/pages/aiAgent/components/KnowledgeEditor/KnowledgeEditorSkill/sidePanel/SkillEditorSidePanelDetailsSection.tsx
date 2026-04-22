import { Heading, Tag } from '@gorgias/axiom'

import { KnowledgeEditorSidePanelFieldDateField } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelCommonFields'
import { KnowledgeEditorSidePanelSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection'
import { KnowledgeEditorSidePanelTwoColumnsContent } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelTwoColumnsContent'

import { useSkillDetailsFromContext } from '../hooks/useSkillDetailsFromContext'

import css from './SkillEditorSidePanel.less'

type Props = {
    sectionId: string
}

export const SkillEditorSidePanelDetailsSection = ({ sectionId }: Props) => {
    const {
        status,
        isDraft,
        isViewingHistoricalVersion,
        createdDatetime,
        lastUpdatedDatetime,
        mode,
        isPreview,
    } = useSkillDetailsFromContext()

    const getStatusTag = () => {
        if (isViewingHistoricalVersion) {
            return <Tag>Previous version</Tag>
        }
        if (mode === 'create') {
            return <span>-</span>
        }
        if (isDraft) {
            return <Tag color="grey">Draft</Tag>
        }
        return (
            <Tag color={status === 'enabled' ? 'green' : 'grey'}>
                {status === 'enabled' ? 'Enabled' : 'Disabled'}
            </Tag>
        )
    }

    const columns = [
        {
            left: 'Status',
            right: getStatusTag(),
        },
        {
            left: 'Created',
            right: (
                <KnowledgeEditorSidePanelFieldDateField
                    date={createdDatetime}
                />
            ),
        },
        {
            left: 'Last updated',
            right: (
                <KnowledgeEditorSidePanelFieldDateField
                    date={lastUpdatedDatetime}
                />
            ),
        },
    ]

    return (
        <>
            {!isPreview && (
                <Heading size="lg" className={css.infoTitle}>
                    Info
                </Heading>
            )}

            <KnowledgeEditorSidePanelSection
                header={{ title: 'Details' }}
                sectionId={sectionId}
                alwaysExpanded={!isPreview}
            >
                <KnowledgeEditorSidePanelTwoColumnsContent columns={columns} />
            </KnowledgeEditorSidePanelSection>
        </>
    )
}
