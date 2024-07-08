import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react'
import {useSearchCustomer} from 'models/aiAgent/queries'
import {Value} from 'pages/common/forms/SelectField/types'
import {reportError} from 'utils/errors'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {CustomerSearchDropdownSelectComponent} from './CustomerSearchDropdownSelectComponent'

type Props = {
    onSelect: (email: string, name?: string) => void
    className?: string
    baseSearchTerm?: string
    isDisabled?: boolean
}

export const CustomerSearchDropdownSelectView = forwardRef(
    ({className, onSelect, baseSearchTerm, isDisabled}: Props, ref) => {
        const [searchTerm, setSearchTerm] = useState(baseSearchTerm ?? '')
        const [isSelected, setIsSelected] = useState(baseSearchTerm ?? false)
        const [isTyping, setIsTyping] = useState(false)
        const [focusedIndex, setFocusedIndex] = useState(-1)

        useImperativeHandle(
            ref,
            () => ({
                clear: () => {
                    setSearchTerm('') // Reset the search term
                    setIsSelected(false)
                    setFocusedIndex(-1)
                },
            }),
            []
        )

        const {
            isLoading,
            error,
            isRefetching,
            isRefetchError,
            data,
            refetch: customerSearchRefetch,
        } = useSearchCustomer(
            {
                email: searchTerm,
            },
            {
                enabled: false,
            }
        )

        const isDropdownLoading =
            (isLoading || isRefetching || isTyping) && searchTerm.length > 0

        const isCustomerListAvailable =
            (data && !isRefetching && !isTyping) ?? false

        const isDropdownVisible =
            (isDropdownLoading || isCustomerListAvailable) && !isSelected

        const handleCustomerSearch = (value: Value) => {
            if (typeof value !== 'string') {
                return
            }
            setIsSelected(false)
            setIsTyping(true)
            setSearchTerm(value)
        }

        const handleCustomerSelect = useCallback(
            (value: string) => {
                const customerData = data?.data.data.find(
                    (customer) => customer.address === value
                )
                setIsSelected(true)
                if (customerData) {
                    onSelect(value, customerData.customer.name)
                }
                setSearchTerm(value)
            },
            [data?.data.data, onSelect]
        )

        useEffect(() => {
            if (searchTerm && !isSelected) {
                setIsTyping(true)
                const handler = setTimeout(async () => {
                    setIsTyping(false)
                    await customerSearchRefetch()
                }, 1000)

                return () => {
                    clearTimeout(handler)
                }
            }
        }, [searchTerm, customerSearchRefetch, isSelected])

        useEffect(() => {
            if (error || isRefetchError) {
                reportError(error || isRefetchError, {
                    tags: {team: AI_AGENT_SENTRY_TEAM},
                })
            }
        }, [error, isRefetchError])

        return (
            <CustomerSearchDropdownSelectComponent
                customerList={data?.data.data ?? []}
                onSearch={handleCustomerSearch}
                onSelect={handleCustomerSelect}
                searchTerm={searchTerm}
                isDropdownVisible={isDropdownVisible}
                isDropdownLoading={isDropdownLoading}
                isCustomerListAvailable={isCustomerListAvailable}
                focusedIndex={focusedIndex}
                setFocusedIndex={setFocusedIndex}
                className={className}
                isDisabled={isDisabled}
            />
        )
    }
)
