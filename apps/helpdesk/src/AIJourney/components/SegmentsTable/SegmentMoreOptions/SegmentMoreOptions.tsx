import { useCallback } from 'react'

import { Icon, ListItem, Select, SelectTrigger } from '@gorgias/axiom'

import type { Segment } from 'AIJourney/pages/Segments/Segments'

const Options = {
    Edit: 'edit',
    Duplicate: 'duplicate',
    Delete: 'delete',
} as const

type Option = (typeof Options)[keyof typeof Options]

type OptionEntry = { id: Option; name: string; icon: string }

const options: OptionEntry[] = [
    { id: Options.Edit, name: 'Edit', icon: 'edit-pencil' },
    { id: Options.Duplicate, name: 'Duplicate', icon: 'copy' },
    { id: Options.Delete, name: 'Delete', icon: 'trash-empty' },
]

export const SegmentMoreOptions = ({
    segment,
    onEditClick,
    onDuplicateClick,
    onDeleteClick,
}: {
    segment: Segment
    onEditClick: (segment: Segment) => void
    onDuplicateClick: (segment: Segment) => void
    onDeleteClick: (segment: Segment) => void
}) => {
    const handleAction = useCallback(
        (option: OptionEntry) => {
            switch (option.id) {
                case Options.Edit:
                    onEditClick(segment)
                    break
                case Options.Duplicate:
                    onDuplicateClick(segment)
                    break
                case Options.Delete:
                    onDeleteClick(segment)
                    break
            }
        },
        [segment, onEditClick, onDuplicateClick, onDeleteClick],
    )

    return (
        <Select
            placement="bottom right"
            trigger={({ ref }) => (
                <SelectTrigger ref={ref}>
                    <Icon name="dots-meatballs-horizontal" />
                </SelectTrigger>
            )}
            items={options}
            selectedItem={null}
            onSelect={handleAction}
        >
            {(option) => (
                <ListItem
                    id={option.id}
                    leadingSlot={option.icon}
                    label={option.name}
                />
            )}
        </Select>
    )
}
