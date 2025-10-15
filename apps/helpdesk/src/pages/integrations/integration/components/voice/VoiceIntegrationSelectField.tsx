import { useEffect, useMemo, useRef, useState } from 'react'

import { useId } from '@repo/hooks'
import flatten from 'lodash/flatten'

import { LegacyButton as Button, Skeleton } from '@gorgias/axiom'
import { useGetIntegration } from '@gorgias/helpdesk-queries'

import { useNotify } from 'hooks/useNotify'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownItemLabel from 'pages/common/components/dropdown/DropdownItemLabel'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import usePhoneNumbers from '../phone/usePhoneNumbers'
import { useInfiniteListVoiceIntegrations } from './hooks/useInfiniteListVoiceIntegrations'

import css from './VoiceIntegrationSelectField.less'

type VoiceIntegrationSelectProps = {
    name?: string
    value?: null | number
    onChange: (integrationId: null | number) => void
    hiddenIntegrations?: number[]
}

export default function VoiceIntegrationSelectField({
    value,
    onChange,
    name,
    hiddenIntegrations,
}: VoiceIntegrationSelectProps) {
    const id = useId()
    const fieldsetName = name || 'phone-integration-selector-' + id

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    const {
        data,
        refetch,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        isError,
        isLoading,
    } = useInfiniteListVoiceIntegrations()

    const { getPhoneNumberById } = usePhoneNumbers()
    const notify = useNotify()

    useEffect(() => {
        if (isError) {
            notify.error(
                'Something went wrong while trying to fetch integrations',
            )
        }
    }, [isError, notify])

    const options = useMemo(
        () =>
            flatten(data?.pages.map((page) => page.data.data)).filter(
                (integration) => !hiddenIntegrations?.includes(integration.id),
            ),
        [data, hiddenIntegrations],
    )

    const selectedOption = options?.find(
        (integration) => integration.id === value,
    )

    const { data: integration } = useGetIntegration(value ?? 0, {
        query: {
            enabled: !selectedOption && !!value,
            staleTime: 60_000,
        },
    })

    const selectedIntegration = selectedOption ?? integration?.data

    const shouldLoadMore = hasNextPage && !isFetchingNextPage

    if (isLoading) {
        return <LoadingSkeleton />
    }

    if (isError) {
        return (
            <div className={css.error}>
                <p>
                    There was an error while trying to fetch the integrations.
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
            <SelectInputBox
                label={selectedIntegration?.name}
                onToggle={setIsDropdownOpen}
                floating={floatingRef}
                ref={targetRef}
                placeholder="Select voice integration"
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
                            <DropdownBody>
                                <InfiniteScroll
                                    onLoad={fetchNextPage}
                                    shouldLoadMore={shouldLoadMore}
                                >
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
                                                caption={
                                                    getPhoneNumberById(
                                                        option.meta
                                                            .phone_number_id as number,
                                                    )?.phone_number_friendly
                                                }
                                            >
                                                {option.name}
                                            </DropdownItemLabel>
                                        </DropdownItem>
                                    ))}
                                </InfiniteScroll>
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
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
