import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    Color,
    createSelectableColumn,
    createSortableColumn,
    Icon,
    Text,
} from '@gorgias/axiom'

import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'
import {
    KnowledgeType,
    KnowledgeVisibility,
} from 'pages/aiAgent/KnowledgeHub/types'
import { isDraft } from 'pages/aiAgent/KnowledgeHub/utils/articleUtils'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { TitleCell } from './TitleCell'

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
            (info) => (
                <TitleCell
                    row={info.row}
                    searchTerm={searchTerm}
                    columnOnClick={columnOnClick}
                    availableActions={availableActions}
                    guidanceHelpCenterId={guidanceHelpCenterId}
                />
            ),
        ),
    },
    {
        ...createSortableColumn<GroupedKnowledgeItem>(
            'lastUpdatedAt',
            'Last updated',
            (info) => {
                const date = info.getValue() as string
                return <Text>{new Date(date).toLocaleDateString()}</Text>
            },
        ),
    },
    {
        ...createSortableColumn<GroupedKnowledgeItem>(
            'inUseByAI',
            'In use by AI Agent',
            (info) => {
                const isGrouped = info.row.original.isGrouped
                const row = info.row.original

                if (isGrouped) {
                    return (
                        <Box alignItems="center" justifyContent="flex-start">
                            <Text>--</Text>
                        </Box>
                    )
                }

                // For FAQ (Help Center articles), use isDraft to determine status
                // Articles are in use by AI only when published (not draft)
                let isInUse: boolean
                if (row.type === KnowledgeType.FAQ) {
                    const article = {
                        id: Number(row.id),
                        title: row.title,
                        draftVersionId: row.draftVersionId,
                        publishedVersionId: row.publishedVersionId,
                    }
                    isInUse = !isDraft(article)
                } else {
                    // For other types, use visibility status
                    const visibility = info.getValue() as
                        | KnowledgeVisibility
                        | undefined
                    isInUse = visibility === KnowledgeVisibility.PUBLIC
                }

                return (
                    <Box alignItems="center" justifyContent="flex-start">
                        {isInUse ? (
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
