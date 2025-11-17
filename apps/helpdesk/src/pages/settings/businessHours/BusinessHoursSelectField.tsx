import { useRef, useState } from 'react'

import { useId } from '@repo/hooks'

import {
    LegacyButton as Button,
    LegacyLabel as Label,
    Skeleton,
} from '@gorgias/axiom'
import type {
    BusinessHours,
    BusinessHoursConfig,
} from '@gorgias/helpdesk-queries'
import {
    useGetBusinessHoursDetails,
    useListAccountSettings,
} from '@gorgias/helpdesk-queries'

import { useBusinessHours } from 'hooks/businessHours/useBusinessHours'
import { useBusinessHoursSearch } from 'hooks/businessHours/useBusinessHoursSearch'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownItemLabel from 'pages/common/components/dropdown/DropdownItemLabel'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import AddCustomBusinessHoursModal from './AddCustomBusinessHoursModal'

import css from './BusinessHoursSelectField.less'

type BusinessHoursSelectProps = {
    name?: string
    value?: null | number
    onChange: (businessHoursId: null | number) => void
}

const DEFAULT_BUSINESS_HOURS_NAME = 'Default business hours'

export default function BusinessHoursSelectField({
    value,
    onChange,
    name,
}: BusinessHoursSelectProps) {
    const id = useId()
    const fieldsetName = name || 'radio-field-' + id

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    const [isModalOpen, setIsModalOpen] = useState(false)

    const { data: defaultBusinessHours } = useListAccountSettings({
        type: 'business-hours',
    })
    const defaultBusinessHoursConfig = defaultBusinessHours?.data.data?.[0]
        .data as BusinessHoursConfig | undefined

    const { getBusinessHoursConfigLabel } = useBusinessHours()

    const {
        onLoad,
        businessHours: options,
        shouldLoadMore,
        isLoading,
        isError,
        refetch,
    } = useBusinessHoursSearch()

    const selectedOption = options?.find(
        (businessHours) => businessHours.id === value,
    )

    const { data: businessHours } = useGetBusinessHoursDetails(value ?? 0, {
        query: {
            enabled: !selectedOption && !!value,
            staleTime: 60_000,
        },
    })

    const selectedBusinessHours = selectedOption ?? businessHours?.data

    const getBusinessHoursLabel = (
        businessHours: BusinessHours | undefined,
    ) => {
        const name = businessHours?.name || DEFAULT_BUSINESS_HOURS_NAME
        const businessHoursConfig =
            businessHours?.business_hours_config || defaultBusinessHoursConfig
        if (!businessHoursConfig) {
            return name
        }

        const businessHoursConfigLabel = getBusinessHoursConfigLabel(
            businessHoursConfig,
            true,
        )

        return `${name} (${businessHoursConfigLabel})`
    }

    const selectedBusinessHoursLabel = getBusinessHoursLabel(
        selectedBusinessHours,
    )

    if (isLoading) {
        return <LoadingSkeleton />
    }

    if (isError) {
        return (
            <div className={css.error}>
                <p>
                    There was an error while trying to fetch the business hours.
                    Please try again later.
                </p>
                <Button intent="secondary" onClick={() => refetch()}>
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <fieldset name={fieldsetName} className={css.container}>
            <div className={css.label}>
                <Label isRequired>Business Hours</Label>
            </div>
            <SelectInputBox
                label={selectedBusinessHoursLabel}
                onToggle={setIsDropdownOpen}
                floating={floatingRef}
                ref={targetRef}
                placeholder="Select custom business hours"
                isDisabled={isLoading}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isDropdownOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={value}
                            fallbackPlacements={['bottom', 'top']}
                        >
                            <DropdownSearch autoFocus />
                            <DropdownBody>
                                <InfiniteScroll
                                    onLoad={onLoad}
                                    shouldLoadMore={shouldLoadMore}
                                >
                                    {defaultBusinessHoursConfig && (
                                        <DropdownItem
                                            key={null}
                                            option={{
                                                label: DEFAULT_BUSINESS_HOURS_NAME,
                                                value: null,
                                            }}
                                            onClick={() => onChange(null)}
                                            shouldCloseOnSelect
                                        >
                                            <DropdownItemLabel
                                                caption={getBusinessHoursConfigLabel(
                                                    defaultBusinessHoursConfig,
                                                    true,
                                                )}
                                            >
                                                {DEFAULT_BUSINESS_HOURS_NAME}
                                            </DropdownItemLabel>
                                        </DropdownItem>
                                    )}
                                    {options?.map((option) => (
                                        <DropdownItem
                                            key={option.id}
                                            option={{
                                                label: option.name,
                                                value: option.id,
                                            }}
                                            onClick={() => onChange(option.id)}
                                            shouldCloseOnSelect
                                        >
                                            <DropdownItemLabel
                                                caption={getBusinessHoursConfigLabel(
                                                    option.business_hours_config,
                                                    true,
                                                )}
                                            >
                                                {option.name}
                                            </DropdownItemLabel>
                                        </DropdownItem>
                                    ))}
                                </InfiniteScroll>
                            </DropdownBody>
                            <Button
                                intent="secondary"
                                className={css.createNewButton}
                                leadingIcon="add"
                                onClick={() => {
                                    setIsDropdownOpen(false)
                                    setIsModalOpen(true)
                                }}
                            >
                                Add Custom Business Hours
                            </Button>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
            <AddCustomBusinessHoursModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreateSuccess={(id) => {
                    refetch()
                    onChange(id)
                }}
            />
        </fieldset>
    )
}

const LoadingSkeleton = () => {
    return (
        <>
            <Skeleton height={32} />
            <Skeleton height={32} />
        </>
    )
}
