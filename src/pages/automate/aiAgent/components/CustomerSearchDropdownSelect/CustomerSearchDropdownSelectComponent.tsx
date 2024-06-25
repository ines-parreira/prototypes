import React, {useCallback, useEffect} from 'react'
import classnames from 'classnames'
import {CustomerList} from 'models/aiAgentPlayground/types'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {Value} from 'pages/common/forms/SelectField/types'
import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'
import css from './CustomerSearchDropdownSelectComponent.less'

type Props = {
    customerList: CustomerList
    onSearch: (value: Value) => void
    onSelect: (value: string) => void
    searchTerm: string
    isDropdownVisible: boolean
    isDropdownLoading: boolean
    isCustomerListAvailable: boolean
    focusedIndex: number
    setFocusedIndex: (value: number) => void
    className?: string
    isDisabled?: boolean
}

export const CustomerSearchDropdownSelectComponent = ({
    customerList,
    onSearch,
    onSelect,
    isDropdownVisible,
    isDropdownLoading,
    isCustomerListAvailable,
    searchTerm,
    focusedIndex,
    setFocusedIndex,
    className,
    isDisabled,
}: Props) => {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!isDropdownVisible || !customerList) return

            switch (event.key) {
                case 'ArrowDown':
                    setFocusedIndex(
                        focusedIndex < customerList.length - 1
                            ? focusedIndex + 1
                            : focusedIndex
                    )
                    break
                case 'ArrowUp':
                    setFocusedIndex(
                        focusedIndex > 0 ? focusedIndex - 1 : focusedIndex
                    )
                    break
                case 'Enter':
                    if (
                        focusedIndex >= 0 &&
                        focusedIndex < customerList.length
                    ) {
                        onSelect(customerList[focusedIndex].address)
                    }
                    break
                default:
                    break
            }
        },
        [
            customerList,
            focusedIndex,
            setFocusedIndex,
            onSelect,
            isDropdownVisible,
        ]
    )

    useEffect(() => {
        if (isDropdownVisible) {
            window.addEventListener('keydown', handleKeyDown)
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isDropdownVisible, handleKeyDown])

    return (
        <div className={classnames(css.container, className)}>
            <div className={css.inputContainer}>
                <TextInput
                    onChange={onSearch}
                    prefix={<IconInput icon="search" />}
                    value={searchTerm}
                    placeholder="Search"
                    isDisabled={isDisabled}
                />
            </div>
            {isDropdownVisible && (
                <div className={css.dropdownContainer}>
                    <div className={css.dropdown}>
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
                        {isCustomerListAvailable &&
                            customerList.length === 0 && (
                                <div className={css.noResults}>
                                    No results found
                                </div>
                            )}
                        {isCustomerListAvailable &&
                            customerList.length > 0 &&
                            customerList.map((customer, index) => (
                                <div
                                    key={customer.id}
                                    className={classnames(css.dropdownItem, {
                                        [css.focusedDropdownItem]:
                                            focusedIndex === index,
                                    })}
                                    onClick={() => onSelect(customer.address)}
                                >
                                    {customer.address}
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    )
}
