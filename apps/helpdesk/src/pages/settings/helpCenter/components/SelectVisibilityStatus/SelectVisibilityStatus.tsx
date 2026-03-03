import type { RefObject } from 'react'
import React, { useMemo } from 'react'

import classnames from 'classnames'
import _upperFirst from 'lodash/upperFirst'

import {
    Button,
    Label,
    ListItem,
    Select,
    SelectTrigger,
    TextField,
} from '@gorgias/axiom'

import type { CustomerVisibility } from 'models/helpCenter/types'

import css from './SelectVisibilityStatus.less'

export type SelectCustomerVisibilityProps = {
    status?: CustomerVisibility
    onChange: (status: CustomerVisibility) => void
    isParentUnlisted: boolean
    showNotification: boolean
    setShowNotification: (showNotification: boolean) => void
    type: 'article' | 'category'
    className?: string
    isDisabled?: boolean
}

type VisibilityOption = {
    id: string
    value: CustomerVisibility
    title: string
    icon: string
    description: string
    descriptionInheritUnlisted?: string
}

const SelectCustomerVisibility = ({
    status = 'PUBLIC',
    onChange,
    className,
    isParentUnlisted,
    showNotification,
    setShowNotification,
    type,
    isDisabled = false,
}: SelectCustomerVisibilityProps) => {
    const options: VisibilityOption[] = useMemo(
        () => [
            {
                id: 'visibility-unlisted',
                value: 'UNLISTED',
                title: 'Unlisted',
                description: `Accessible only via direct link, not indexed by search engines.`,
                icon: 'hide',
            },
            {
                id: 'visibility-public',
                value: 'PUBLIC',
                title: 'Public',
                description: `Visible to Help Center visitors.`,
                descriptionInheritUnlisted: `${_upperFirst(
                    type,
                )} is currently only accessible via direct link because one of its parent categories is unlisted.`,
                icon: 'show',
            },
        ],
        [type],
    )

    const selectedOption = useMemo(
        () => options.find((opt) => opt.value === status) || options[1],
        [options, status],
    )

    const handleSelect = (option: VisibilityOption) => {
        onChange(option.value)
    }

    const selectedText = useMemo(() => {
        const isPublicButUnlisted =
            isParentUnlisted && selectedOption.value === 'PUBLIC'
        return isPublicButUnlisted
            ? `${selectedOption.title} (currently Unlisted)`
            : selectedOption.title
    }, [selectedOption, isParentUnlisted])

    return (
        <div className={classnames(className, css.wrapper)}>
            <Label>Customer visibility</Label>
            <Select<VisibilityOption>
                trigger={({ ref, isOpen }) => (
                    <SelectTrigger>
                        <TextField
                            inputRef={ref as RefObject<HTMLInputElement>}
                            value={selectedText}
                            isDisabled={isDisabled}
                            isFocused={isOpen}
                            leadingSlot={selectedOption.icon}
                            trailingSlot={
                                isOpen
                                    ? 'arrow-chevron-up'
                                    : 'arrow-chevron-down'
                            }
                        />
                    </SelectTrigger>
                )}
                items={options}
                selectedItem={selectedOption}
                onSelect={handleSelect}
                aria-label="Select customer visibility"
                isDisabled={isDisabled}
                maxWidth={266}
            >
                {(option: VisibilityOption) => {
                    const isPublicButUnlisted =
                        isParentUnlisted && option.value === 'PUBLIC'
                    const title = isPublicButUnlisted
                        ? `${option.title} (currently Unlisted)`
                        : option.title
                    const description = isPublicButUnlisted
                        ? option.descriptionInheritUnlisted
                        : option.description

                    return (
                        <ListItem
                            id={option.id}
                            label={title}
                            caption={description}
                            textValue={title}
                            leadingSlot={option.icon}
                        />
                    )
                }}
            </Select>
            {showNotification && status === 'PUBLIC' && (
                <div className={css.notificationWrapper}>
                    <div>
                        This {type}{' '}
                        {type === 'category' && 'and all its content'} will only
                        be accessible via direct link because one of its parent
                        categories is unlisted.
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowNotification(false)}
                        className={css.gotItButton}
                    >
                        Got it
                    </Button>
                </div>
            )}
        </div>
    )
}

export default SelectCustomerVisibility
