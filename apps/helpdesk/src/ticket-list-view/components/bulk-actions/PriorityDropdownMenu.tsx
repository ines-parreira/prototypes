import { useMemo } from 'react'

import { TicketPriority } from '@gorgias/helpdesk-types'

import { Body, Context, Item } from 'components/Dropdown'

import PriorityDropdownItem from './PriorityDropdownItem'

import css from './style.less'

type Props = {
    onClick: (item: Item | null) => void
}

const PriorityDropdownMenu = ({ onClick }: Props) => {
    const contextValue = useMemo(
        () => ({
            data: Object.values(TicketPriority).map((priority) => ({
                name: priority,
            })),
            onClick,
            shouldRender: true,
        }),
        [onClick],
    )

    return (
        <Context.Provider value={contextValue}>
            <div className={css.priorityDropdownMenu}>
                <Body
                    hasSearch={false}
                    onRenderItem={(item) => (
                        <PriorityDropdownItem item={item} />
                    )}
                />
            </div>
        </Context.Provider>
    )
}

export default PriorityDropdownMenu
