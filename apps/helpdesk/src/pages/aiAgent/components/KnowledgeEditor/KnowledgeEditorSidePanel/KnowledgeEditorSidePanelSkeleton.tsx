import { Skeleton } from '@gorgias/axiom'

import { KnowledgeEditorSidePanelSection } from './KnowledgeEditorSidePanelSection'

import css from './KnowledgeEditorSidePanelSkeleton.less'

export const KnowledgeEditorSidePanelSkeleton = () => {
    return (
        <>
            <KnowledgeEditorSidePanelSection
                header={null}
                sectionId="details-skeleton"
            >
                <Skeleton width={268} height={24} />
                <div className={css.section}>
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                </div>
            </KnowledgeEditorSidePanelSection>

            <KnowledgeEditorSidePanelSection
                header={null}
                sectionId="impact-skeleton"
            >
                <Skeleton width={268} height={35} />
                <div className={css.section}>
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} width="25%" />
                </div>
            </KnowledgeEditorSidePanelSection>

            <KnowledgeEditorSidePanelSection
                header={null}
                sectionId="tickets-skeleton"
            >
                <Skeleton width={268} height={23} />
                <div className={css.section}>
                    <Skeleton height={69} />
                    <Skeleton height={69} />
                    <Skeleton height={69} />
                    <Skeleton height={12} width="25%" />
                </div>
            </KnowledgeEditorSidePanelSection>

            <KnowledgeEditorSidePanelSection
                header={null}
                sectionId="tickets-skeleton"
            >
                <Skeleton width={268} height={23} />
                <div className={css.section}>
                    <Skeleton height={69} />
                    <Skeleton height={69} />
                    <Skeleton height={69} />
                    <Skeleton height={12} width="25%" />
                </div>
            </KnowledgeEditorSidePanelSection>
        </>
    )
}
