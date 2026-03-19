import type { ReactNode } from 'react'
import { useRef } from 'react'

import { NavigationSection } from '@repo/navigation'
import { TicketSectionActionsMenu } from '@repo/tickets'
import classnames from 'classnames'
import { useDrag } from 'react-dnd'

import type { ViewCategoryNavbar } from 'models/view/types'
import TicketNavbarDropTarget from 'pages/tickets/navbar/TicketNavbarDropTarget'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'

import css from './TicketNavbarBlock.less'

type Props = {
    id?: string
    actions?: {
        label: string
        onClick: () => void
    }[]
    children: ReactNode
    title: string
    value?: ViewCategoryNavbar
    actionsIcon?: {
        isDisabled?: boolean
        tooltip?: string
    }
}

export function InboxSidebarBlock({
    id,
    actions,
    children,
    title,
    value,
    actionsIcon = {
        isDisabled: false,
        tooltip: undefined,
    },
}: Props) {
    const categoryRef = useRef<HTMLDivElement>(null)

    const [{ isDragging }, drag] = useDrag({
        type: TicketNavbarElementType.Category,
        item: {
            id: value,
            type: TicketNavbarElementType.Category,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    if (value !== undefined) {
        drag(categoryRef)
    }

    return (
        <TicketNavbarDropTarget
            accept={TicketNavbarElementType.Category}
            canDrop={(item) => item.type === TicketNavbarElementType.Category}
            className={classnames({
                [css.isDragged]: isDragging,
            })}
            onDrop={(__, ___, direction) => ({
                sectionId: null,
                viewId: null,
                categoryId: value,
                direction,
            })}
        >
            <NavigationSection
                id={id}
                label={title}
                actionsSlot={
                    !!actions && (
                        <TicketSectionActionsMenu
                            triggerIcon="add-plus-circle"
                            actions={actions}
                            isDisabled={actionsIcon.isDisabled}
                            tooltip={actionsIcon.tooltip}
                        />
                    )
                }
            >
                {children}
            </NavigationSection>
        </TicketNavbarDropTarget>
    )
}
