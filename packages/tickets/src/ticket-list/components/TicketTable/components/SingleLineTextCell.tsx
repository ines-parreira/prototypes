import { DataTableBaseCell, OverflowTooltip, Text } from '@gorgias/axiom'

type Props = {
    value: string | null | undefined
}

export function SingleLineTextCell({ value }: Props) {
    if (!value) {
        return <DataTableBaseCell>{null}</DataTableBaseCell>
    }

    return (
        <DataTableBaseCell alignItems="stretch">
            <OverflowTooltip>
                <Text overflow="ellipsis">{value}</Text>
            </OverflowTooltip>
        </DataTableBaseCell>
    )
}
