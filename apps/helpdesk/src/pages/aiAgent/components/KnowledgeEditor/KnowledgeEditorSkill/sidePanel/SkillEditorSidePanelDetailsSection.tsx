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
    const { status, isDraft, createdDatetime, lastUpdatedDatetime } =
        useSkillDetailsFromContext()

    const statusTag = isDraft ? (
        <Tag color="grey">Draft</Tag>
    ) : (
        <Tag color={status === 'enabled' ? 'green' : 'grey'}>
            {status === 'enabled' ? 'Enabled' : 'Disabled'}
        </Tag>
    )

    const columns = [
        {
            left: 'Status',
            right: statusTag,
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
            <Heading size="lg" className={css.infoTitle}>
                Info
            </Heading>

            <KnowledgeEditorSidePanelSection
                header={{ title: 'Details' }}
                sectionId={sectionId}
                alwaysExpanded
            >
                <KnowledgeEditorSidePanelTwoColumnsContent columns={columns} />
            </KnowledgeEditorSidePanelSection>
        </>
    )
}
