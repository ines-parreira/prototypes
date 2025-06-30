import { IconButton } from '@gorgias/merchant-ui-kit'

import { DateAndTimeFormatting } from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { guidanceVariables } from 'pages/aiAgent/components/GuidanceEditor/variables'
import { Drawer } from 'pages/common/components/Drawer'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBar.less'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import {
    getKnowledgeResourceTypeLabel,
    parseKnowledgeResourceContent,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import { formatDatetime } from 'utils'
import { sanitizeHtmlDefault, unescapeAmpAndDollarEntities } from 'utils/html'

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

    const htmlContent = parseKnowledgeResourceContent(
        unescapeAmpAndDollarEntities(sanitizeHtmlDefault(content)),
        guidanceVariables,
        guidanceActions,
    )

    return (
        <>
            <Drawer.Header>
                {typeLabel}
                <Drawer.HeaderActions
                    onClose={onClose}
                    closeButtonId="close-button"
                >
                    {onEdit && (
                        <IconButton
                            icon="edit"
                            fillStyle="ghost"
                            intent="secondary"
                            size="medium"
                            aria-label="edit knowledge source"
                            onClick={onEdit}
                        />
                    )}
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <IconButton
                            icon="open_in_new"
                            fillStyle="ghost"
                            intent="secondary"
                            size="medium"
                            aria-label="open resource management in new tab"
                        />
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
                <div
                    dangerouslySetInnerHTML={{
                        __html: htmlContent,
                    }}
                />
            </Drawer.Content>
        </>
    )
}

export default KnowledgeSourcePreview
