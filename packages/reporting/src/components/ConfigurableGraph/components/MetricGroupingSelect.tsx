import { Button, ListItem, Select } from '@gorgias/axiom'

type MetricGroupingSelectItem = {
    id: string
    name: string
}

type Props = {
    items: MetricGroupingSelectItem[]
    selectedItem: MetricGroupingSelectItem
    onMetricGroupingSelect: (item: MetricGroupingSelectItem) => void
}

export function MetricGroupingSelect({
    items,
    selectedItem,
    onMetricGroupingSelect,
}: Props) {
    return (
        <Select
            data-name={'metric-grouping-selector'}
            items={items}
            selectedItem={selectedItem}
            onSelect={onMetricGroupingSelect}
            trigger={({ selectedText }) => (
                <Button
                    size="sm"
                    variant="secondary"
                    trailingSlot={'arrow-chevron-down'}
                >
                    {selectedText || 'Select grouping'}
                </Button>
            )}
        >
            {(grouping) => <ListItem label={grouping.name} wrap={true} />}
        </Select>
    )
}
