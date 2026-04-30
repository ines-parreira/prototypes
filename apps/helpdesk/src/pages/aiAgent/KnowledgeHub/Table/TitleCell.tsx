import type { Row } from '@gorgias/axiom'
import { Box, Icon, Tag, Text } from '@gorgias/axiom'

import { GuidanceActionsBadge } from 'pages/aiAgent/components/GuidanceList/GuidanceActionsBadge'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'
import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'
import { KnowledgeType, typeConfig } from 'pages/aiAgent/KnowledgeHub/types'
import type { GuidanceArticle } from 'pages/aiAgent/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { hasDraftEdits, isDraft } from '../utils/articleUtils'

import css from './KnowledgeHubTable.less'

const escapeRegExp = (string: string) =>
    string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text

    const parts = text.split(new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi'))
    return (
        <>
            {parts.map((part, index) =>
                part.toLowerCase() === searchTerm.toLowerCase() ? (
                    <span key={index} className={css.highlight}>
                        {part}
                    </span>
                ) : (
                    part
                ),
            )}
        </>
    )
}

export type TitleCellProps = {
    row: Row<GroupedKnowledgeItem>
    searchTerm: string
    columnOnClick?: (data: GroupedKnowledgeItem) => void
    availableActions: GuidanceAction[]
    guidanceHelpCenterId?: number | null
}

export const TitleCell = ({
    row,
    searchTerm,
    columnOnClick,
    availableActions,
    guidanceHelpCenterId,
}: TitleCellProps) => {
    const type = row.original.type
    const title = row.original.title
    const isGrouped = row.original.isGrouped
    const itemCount = row.original.itemCount
    const source = row.original.source
    const id = parseInt(row.original.id, 10)

    const { guidanceArticle } = useGuidanceArticle({
        guidanceHelpCenterId: guidanceHelpCenterId || -1,
        guidanceArticleId: Number(row.original.id),
        locale: row.original.localeCode || 'en-US',
        enabled:
            !!guidanceHelpCenterId &&
            type === KnowledgeType.Guidance &&
            !isGrouped,
        versionStatus: 'latest_draft',
    })

    const shouldMakeClickable = !!columnOnClick

    const articleVersionInfo = {
        id: id,
        draftVersionId: row.original.draftVersionId,
        publishedVersionId: row.original.publishedVersionId,
    }
    const isArticleDraft = isDraft(articleVersionInfo)
    const hasArticleDraftEdits = hasDraftEdits(articleVersionInfo)

    const getIcon = () => {
        if (!isGrouped) {
            if (
                type === KnowledgeType.Document ||
                type === KnowledgeType.URL ||
                type === KnowledgeType.Domain
            ) {
                return 'snippet'
            }
        }

        return typeConfig[type].icon
    }
    return (
        <div
            onClick={() => shouldMakeClickable && columnOnClick(row.original)}
            className={
                shouldMakeClickable ? css.clickableCell : css.nonClickableCell
            }
        >
            <Box gap="xs" alignItems="center" className={css.titleCell}>
                <Icon size="sm" name={getIcon()} />
                <TruncatedTextWithTooltip tooltipContent={title}>
                    <Text>{highlightText(title, searchTerm)}</Text>
                </TruncatedTextWithTooltip>
                {isGrouped && itemCount && (
                    <div className={css.quantity}>
                        <Icon name="arrow-sub-down-right" size="sm" />
                        {itemCount} snippet{itemCount !== 1 ? 's' : ''}
                    </div>
                )}
                {!isGrouped &&
                    type === KnowledgeType.Guidance &&
                    guidanceArticle && (
                        <GuidanceActionsBadge
                            article={guidanceArticle as GuidanceArticle}
                            availableActions={availableActions}
                        />
                    )}
                {!isGrouped &&
                    (type === KnowledgeType.FAQ ||
                        type === KnowledgeType.Guidance) &&
                    isArticleDraft && (
                        <Tag
                            id={row.original.id}
                            color={hasArticleDraftEdits ? undefined : 'grey'}
                        >
                            {hasArticleDraftEdits ? 'Draft edits' : 'Draft'}
                        </Tag>
                    )}
                {!isGrouped && source && (
                    <div className={css.source}>
                        <Icon name={typeConfig[type].icon} size="sm" />
                        <TruncatedTextWithTooltip tooltipContent={source}>
                            <span>{source}</span>
                        </TruncatedTextWithTooltip>
                    </div>
                )}
            </Box>
        </div>
    )
}
