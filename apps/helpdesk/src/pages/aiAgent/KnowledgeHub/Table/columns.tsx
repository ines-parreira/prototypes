import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    Color,
    createSelectableColumn,
    createSortableColumn,
    Icon,
    Tag,
    Text,
} from '@gorgias/axiom'

import { GuidanceActionsBadge } from 'pages/aiAgent/components/GuidanceList/GuidanceActionsBadge'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'
import {
    KnowledgeType,
    KnowledgeVisibility,
    typeConfig,
} from 'pages/aiAgent/KnowledgeHub/types'
import type { GuidanceArticle } from 'pages/aiAgent/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import css from './KnowledgeHubTable.less'

const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text

    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'))
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

export const getColumns = (
    searchTerm: string = '',
    columnOnClick?: (data: GroupedKnowledgeItem) => void,
    availableActions: GuidanceAction[] = [],
    guidanceHelpCenterId?: number | null,
): ColumnDef<GroupedKnowledgeItem>[] => [
    createSelectableColumn<GroupedKnowledgeItem>(),
    {
        ...createSortableColumn<GroupedKnowledgeItem>(
            'title',
            'Title',
            (info) => {
                const type = info.row.original.type
                const title = info.getValue() as string
                const isGrouped = info.row.original.isGrouped
                const itemCount = info.row.original.itemCount
                const source = info.row.original.source

                const { guidanceArticle } = useGuidanceArticle({
                    guidanceHelpCenterId: guidanceHelpCenterId || -1,
                    guidanceArticleId: Number(info.row.original.id),
                    locale: info.row.original.localeCode || 'en-US',
                    enabled:
                        !!guidanceHelpCenterId &&
                        type === KnowledgeType.Guidance,
                })

                const shouldMakeClickable =
                    columnOnClick &&
                    (info.row.original.isGrouped ||
                        !info.row.original.isGrouped)

                return (
                    <div
                        onClick={() =>
                            shouldMakeClickable &&
                            columnOnClick(info.row.original)
                        }
                        style={{
                            cursor: shouldMakeClickable ? 'pointer' : 'default',
                        }}
                    >
                        <Box
                            gap="xs"
                            alignItems="center"
                            className={css.titleCell}
                        >
                            <Icon size="md" name={typeConfig[type].icon} />
                            <Text>{highlightText(title, searchTerm)}</Text>
                            {isGrouped && itemCount && (
                                <div className={css.quantity}>
                                    <Icon
                                        name="arrow-sub-down-right"
                                        size="sm"
                                    />
                                    {itemCount} snippets
                                </div>
                            )}
                            {!isGrouped &&
                                type === KnowledgeType.Guidance &&
                                guidanceArticle && (
                                    <GuidanceActionsBadge
                                        article={
                                            guidanceArticle as GuidanceArticle
                                        }
                                        availableActions={availableActions}
                                    />
                                )}
                            {!isGrouped && type === KnowledgeType.FAQ && (
                                <Tag
                                    id={info.row.original.id}
                                    className={css.tag}
                                >
                                    {info.row.original.inUseByAI ===
                                    KnowledgeVisibility.PUBLIC
                                        ? 'Public'
                                        : 'Draft'}
                                </Tag>
                            )}
                            {!isGrouped && source && (
                                <div className={css.source}>
                                    <Icon
                                        name={typeConfig[type].icon}
                                        size="sm"
                                    />
                                    {source}
                                </div>
                            )}
                        </Box>
                    </div>
                )
            },
        ),
    },
    {
        ...createSortableColumn<GroupedKnowledgeItem>(
            'lastUpdatedAt',
            'Last Updated',
            (info) => {
                const date = info.getValue() as string
                return <Text>{new Date(date).toLocaleDateString()}</Text>
            },
        ),
    },
    {
        ...createSortableColumn<GroupedKnowledgeItem>(
            'inUseByAI',
            'In Use by AI Agent',
            (info) => {
                const isGrouped = info.row.original.isGrouped
                const visibility = info.getValue() as
                    | KnowledgeVisibility
                    | undefined

                if (isGrouped) {
                    return (
                        <Box alignItems="center" justifyContent="flex-start">
                            <Text>--</Text>
                        </Box>
                    )
                }

                const isPublic = visibility === KnowledgeVisibility.PUBLIC

                return (
                    <Box alignItems="center" justifyContent="flex-start">
                        {isPublic ? (
                            <Icon name="check" size="md" color={Color.Green} />
                        ) : (
                            <Icon name="close" size="md" color={Color.Grey} />
                        )}
                    </Box>
                )
            },
        ),
    },
]
