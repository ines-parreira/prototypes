import {
    Button,
    ButtonSize,
    ButtonVariant,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

export interface InfobarTicketCustomerSearchButtonProps {
    onOpenMergePanel?: () => void
}

export function InfobarTicketCustomerSearchButton({
    onOpenMergePanel,
}: InfobarTicketCustomerSearchButtonProps) {
    if (!onOpenMergePanel) {
        return null
    }

    return (
        <Tooltip
            placement="bottom"
            trigger={
                <Button
                    variant={ButtonVariant.Tertiary}
                    size={ButtonSize.Md}
                    aria-label="Search for customers to merge or switch"
                    icon="magnifying-glass"
                    onClick={onOpenMergePanel}
                />
            }
        >
            <TooltipContent title="Search for customers to merge or switch by name, email, order number etc" />
        </Tooltip>
    )
}
