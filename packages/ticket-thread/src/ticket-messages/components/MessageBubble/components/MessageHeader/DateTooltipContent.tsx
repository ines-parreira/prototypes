import { Text, TooltipContent } from '@gorgias/axiom'

type DateTooltipContentProps = {
    datetime: string
}

export function DateTooltipContent({ datetime }: DateTooltipContentProps) {
    return (
        <TooltipContent>
            <Text size="xs">
                Date:{' '}
                <Text size="xs" variant="bold">
                    {datetime}
                </Text>
            </Text>
        </TooltipContent>
    )
}
