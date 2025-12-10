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
import { KnowledgeVisibility } from 'pages/aiAgent/KnowledgeHub/types'
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
