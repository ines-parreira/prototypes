import { useCallback, useEffect } from 'react'

import classnames from 'classnames'

import { Skeleton } from '@gorgias/axiom'

import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'

import css from './TicketSearchDropdownSelectComponent.less'

// Type for the search result item - based on the actual API response structure
type SearchTicketItem = {
    id: number
    subject: string
    customer?: {
        id: number
        name?: string
        email?: string
    }
}

type Props = {
    ticketList: SearchTicketItem[]
    onSearch: (value: string) => void
    onSelect: (ticketId: number) => void
    searchTerm: string
    isDropdownVisible: boolean
    isDropdownLoading: boolean
    isTicketListAvailable: boolean
    focusedIndex: number
    setFocusedIndex: (value: number) => void
    className?: string
    isDisabled?: boolean
}

export const TicketSearchDropdownSelectComponent = ({
    ticketList,
    onSearch,
    onSelect,
    isDropdownVisible,
    isDropdownLoading,
    isTicketListAvailable,
    searchTerm,
    focusedIndex,
    setFocusedIndex,
    className,
    isDisabled,
}: Props) => {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!isDropdownVisible || !ticketList) return

            switch (event.key) {
                case 'ArrowDown':
                    setFocusedIndex(
                        focusedIndex < ticketList.length - 1
                            ? focusedIndex + 1
                            : focusedIndex,
                    )
                    break
                case 'ArrowUp':
                    setFocusedIndex(
                        focusedIndex > 0 ? focusedIndex - 1 : focusedIndex,
                    )
                    break
                case 'Enter':
                    if (focusedIndex >= 0 && focusedIndex < ticketList.length) {
                        onSelect(ticketList[focusedIndex].id)
                    }
                    break
                default:
                    break
            }
        },
        [
            ticketList,
            focusedIndex,
            setFocusedIndex,
            onSelect,
            isDropdownVisible,
        ],
    )

    useEffect(() => {
        if (isDropdownVisible) {
            window.addEventListener('keydown', handleKeyDown)
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isDropdownVisible, handleKeyDown])

    const formatTicketDisplay = (ticket: SearchTicketItem) => {
        const customerName = ticket.customer
            ? ticket.customer.name ||
              ticket.customer.email ||
              `Customer #${ticket.customer.id}`
            : undefined

        return [ticket.subject, customerName, ticket.id]
            .filter(Boolean)
            .join(' - ')
    }

    return (
        <div className={classnames(css.container, className)}>
            <div className={css.inputContainer}>
                <TextInput
                    onChange={onSearch}
                    prefix={<IconInput icon="search" />}
                    value={searchTerm}
                    placeholder="Search by ticket id or email subject"
                    isDisabled={isDisabled}
                />
            </div>
            {isDropdownVisible && (
                <div className={css.dropdownContainer}>
                    <div className={css.dropdown} role="listbox">
                        {isDropdownLoading && (
                            <div>
                                <Skeleton
                                    className={css.dropdownSkeleton}
                                    height={28}
                                    width="100%"
                                    count={1}
                                />
                                <Skeleton
                                    className={css.dropdownSkeleton}
                                    height={28}
                                    width="100%"
                                    count={1}
                                />
                                <Skeleton
                                    className={css.dropdownSkeleton}
                                    height={28}
                                    width="100%"
                                    count={1}
                                />
                            </div>
                        )}
                        {isTicketListAvailable && ticketList.length === 0 && (
                            <div className={css.noResults}>
                                No results found
                            </div>
                        )}
                        {isTicketListAvailable &&
                            ticketList.length > 0 &&
                            ticketList.map((ticket, index) => (
                                <div
                                    key={ticket.id}
                                    className={classnames(css.dropdownItem, {
                                        [css.focusedDropdownItem]:
                                            focusedIndex === index,
                                    })}
                                    onClick={() => onSelect(ticket.id)}
                                >
                                    {formatTicketDisplay(ticket)}
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    )
}
