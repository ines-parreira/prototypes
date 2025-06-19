import { IconButton } from '@gorgias/merchant-ui-kit'

import { DateAndTimeFormatting } from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { Drawer } from 'pages/common/components/Drawer'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBar.less'
import { formatDatetime } from 'utils'
import { sanitizeHtmlDefault } from 'utils/html'

import { AiAgentKnowledgeResourceTypeEnum } from './types'

type KnowledgeSourcePreviewProps = {
    onClose: () => void
    title: string
    content: string
    url?: string
    type: AiAgentKnowledgeResourceTypeEnum
    lastUpdatedAt?: string
}

const KnowledgeSourcePreview = ({
    onClose,
    title,
    content,
    url,
    lastUpdatedAt,
}: KnowledgeSourcePreviewProps) => {
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate,
    )
    const formattedDate =
        lastUpdatedAt && formatDatetime(lastUpdatedAt, datetimeFormat)

    return (
        <>
            <Drawer.Header>
                {title}
                <Drawer.HeaderActions
                    onClose={onClose}
                    closeButtonId="close-button"
                >
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
                <div
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHtmlDefault(content),
                    }}
                />
            </Drawer.Content>
        </>
    )
}

export default KnowledgeSourcePreview
