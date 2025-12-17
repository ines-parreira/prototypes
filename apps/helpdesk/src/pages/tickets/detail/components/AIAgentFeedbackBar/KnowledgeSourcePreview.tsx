import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'

import {
    LegacyIconButton as IconButton,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { guidanceVariables } from 'pages/aiAgent/components/GuidanceEditor/variables'
import { Drawer } from 'pages/common/components/Drawer'
import { KnowledgeSourcePreviewContentRenderer } from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourcePreviewContentRenderer'
import type { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { getKnowledgeResourceTypeLabel } from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import { sanitizeHtmlDefault, unescapeAmpAndDollarEntities } from 'utils/html'

import css from './KnowledgeSourcePreview.less'

type KnowledgeSourcePreviewProps = {
    onClose: () => void
    onEdit?: () => void
    title: string
    content: string
    url?: string
    knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum
    lastUpdatedAt?: string
    shopName: string
    shopType: string
}

const KnowledgeSourcePreview = ({
    onEdit,
    onClose,
    title,
    content,
    url,
    lastUpdatedAt,
    knowledgeResourceType,
    shopName,
    shopType,
}: KnowledgeSourcePreviewProps) => {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate,
    )
    const formattedDate =
        lastUpdatedAt && formatDatetime(lastUpdatedAt, datetimeFormat)

    const typeLabel = getKnowledgeResourceTypeLabel(knowledgeResourceType)

    const { guidanceActions } = useGetGuidancesAvailableActions(
        shopName,
        shopType,
    )

    const processedContent = unescapeAmpAndDollarEntities(
        sanitizeHtmlDefault(content),
    )

    return (
        <>
            <Drawer.Header className={css.header}>
                {typeLabel}
                <Drawer.HeaderActions
                    onClose={onClose}
                    closeButtonId="close-button"
                >
                    {onEdit && (
                        <>
                            <IconButton
                                id="edit-knowledge-source"
                                icon="edit"
                                fillStyle="ghost"
                                intent="secondary"
                                size="medium"
                                aria-label="edit knowledge source"
                                onClick={onEdit}
                            />
                            <Tooltip
                                target="edit-knowledge-source"
                                placement="bottom"
                            >
                                Edit
                            </Tooltip>
                        </>
                    )}
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <IconButton
                            id="open-knowledge-source-in-new-tab"
                            icon="open_in_new"
                            fillStyle="ghost"
                            intent="secondary"
                            size="medium"
                            aria-label="open resource management in new tab"
                        />
                        <Tooltip
                            target="open-knowledge-source-in-new-tab"
                            placement="bottom"
                        >
                            Open in new tab
                        </Tooltip>
                    </a>
                </Drawer.HeaderActions>
            </Drawer.Header>
            <Drawer.Content className={css.previewContent}>
                {formattedDate && (
                    <div className={css.lastUpdatedAt}>
                        Last updated: {formattedDate}
                    </div>
                )}
                <h1 className={css.title}>{title}</h1>
                <KnowledgeSourcePreviewContentRenderer
                    content={processedContent}
                    guidanceVariables={guidanceVariables}
                    guidanceActions={guidanceActions}
                    shopName={shopName}
                />
            </Drawer.Content>
        </>
    )
}

export default KnowledgeSourcePreview
