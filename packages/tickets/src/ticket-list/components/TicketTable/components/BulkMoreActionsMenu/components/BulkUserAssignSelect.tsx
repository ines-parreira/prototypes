import {
    Icon,
    ListHeader,
    ListHeaderItem,
    StatusButton,
    Text,
} from '@gorgias/axiom'
import type { User } from '@gorgias/helpdesk-queries'

import { SELECT_WIDTH } from '../../../../../../components/TicketAssignee/components/constant'
import { UserSelectBase } from '../../../../../../components/TicketAssignee/components/UserSelectBase'

import css from '../../../../../../components/TicketAssignee/components/SelectStyles.less'

type BulkUserAssignSelectProps = {
    onChange: (user: User | null) => void | Promise<void>
    isDisabled?: boolean
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function BulkUserAssignSelect({
    onChange,
    isDisabled = false,
    isOpen,
    onOpenChange,
}: BulkUserAssignSelectProps) {
    return (
        <UserSelectBase
            value={undefined}
            onChange={onChange}
            isDisabled={isDisabled}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            aria-label="Assign agent"
            minWidth={SELECT_WIDTH}
            maxWidth={SELECT_WIDTH}
            header={({ onClear, search }) =>
                !search && (
                    <ListHeader>
                        <ListHeaderItem
                            label="Unassigned"
                            leadingSlot={<Icon name="user" size="sm" />}
                            onClick={onClear}
                        />
                    </ListHeader>
                )
            }
            renderTrigger={({ ref, isOpen: open }) => (
                <StatusButton
                    ref={ref}
                    leadingSlot={<Icon name="user" size="sm" />}
                    trailingSlot={
                        <Icon
                            name={
                                open ? 'arrow-chevron-up' : 'arrow-chevron-down'
                            }
                            size="xs"
                        />
                    }
                    className={css.trigger}
                >
                    <Text as="span" size="sm" variant="bold">
                        Assign agent
                    </Text>
                </StatusButton>
            )}
        />
    )
}
