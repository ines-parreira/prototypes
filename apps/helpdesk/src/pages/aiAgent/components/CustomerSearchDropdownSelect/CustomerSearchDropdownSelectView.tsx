import React, { useCallback, useEffect, useState } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useSearchCustomer } from 'models/aiAgent/queries'
import type { Value } from 'pages/common/forms/SelectField/types'

import type { PlaygroundCustomer } from '../../PlaygroundV2/types'
import { CustomerSearchDropdownSelectComponent } from './CustomerSearchDropdownSelectComponent'

type Props = {
    onSelect: (customer: PlaygroundCustomer) => void
    className?: string
    baseSearchTerm?: string
    isDisabled?: boolean
}

export const CustomerSearchDropdownSelectView = ({
    className,
    onSelect,
    baseSearchTerm,
    isDisabled,
}: Props) => {
    const [searchTerm, setSearchTerm] = useState(baseSearchTerm ?? '')
    const [isSelected, setIsSelected] = useState(baseSearchTerm ?? false)
    const [isTyping, setIsTyping] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState(-1)

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
        },
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
                (customer) => customer.address === value,
            )

            setIsSelected(true)
            if (customerData) {
                const playgroundCustomer: PlaygroundCustomer = {
                    email: customerData.address,
                    name: customerData.user.name,
                    id: customerData.user.id,
                }
                onSelect(playgroundCustomer)
            }
            setSearchTerm(value)
        },
        [data?.data.data, onSelect],
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
                tags: { team: SentryTeam.AI_AGENT },
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
