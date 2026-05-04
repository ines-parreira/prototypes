import {
    Button,
    ButtonSize,
    ButtonVariant,
    IconName,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

export interface InfobarTicketCustomerMergeButtonProps {
    onOpenMergePanel?: () => void
}

export function InfobarTicketCustomerMergeButton({
    onOpenMergePanel,
}: InfobarTicketCustomerMergeButtonProps) {
    return (
        <Tooltip
            trigger={
                <Button
                    variant={ButtonVariant.Tertiary}
                    size={ButtonSize.Sm}
                    aria-label="Merge or switch customer profiles"
                    icon={IconName.ArrowMerging}
                    onClick={onOpenMergePanel}
                />
            }
        >
            <TooltipContent
                title="Search for customers to merge or to switch the ticket customer"
                maxWidth={147}
            />
        </Tooltip>
    )
}
