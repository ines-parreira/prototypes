import React, { useCallback, useMemo, useRef, useState } from 'react'

import classNames from 'classnames'
import type { ClassValue } from 'classnames/types'

import {
    Button,
    Dot,
    Icon,
    ListItem,
    ListSection,
    Select,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'
import type { ColorValue } from '@gorgias/axiom'
import { THEME_NAME } from '@gorgias/design-tokens'

import { useTheme } from '../../../../core/theme'
import type { StoreIntegration } from '../../../../models/integration/types'
import { useIsTruncated } from '../../hooks/useIsTruncated'
import { IntegrationIcon } from '../IntegrationIcon/IntegrationIcon'

import css from './StoreSelector.less'

type BaseProps = {
    integrations: StoreIntegration[]
    selected?: StoreIntegration | null
    withSearch?: boolean
    shouldShowActiveStatus?: (
        integration: StoreIntegration,
    ) => boolean | undefined
    fullWidth?: boolean
    singleStoreInline?: boolean
    buttonClassName?: ClassValue
    hideSelectedFromDropdown?: boolean
    enableDynamicHeight?: boolean
    applyClassicThemeOverride?: boolean
}

type PropsWithAllOption = BaseProps & {
    withAllOption: true
    onChange: (value: number | null) => void
}

type PropsWithoutAllOption = BaseProps & {
    withAllOption?: false
    onChange: (value: number) => void
}

type Props = PropsWithAllOption | PropsWithoutAllOption

type StoreSelectorItem = {
    id: string | number
    name: string
    type: StoreIntegration['type'] | null
    isAllOption?: boolean
}

type StoreSelectorSection = {
    id: string
    items: StoreSelectorItem[]
}

export default function StoreSelector({
    integrations,
    selected,
    onChange,
    withSearch = false,
    withAllOption = false,
    shouldShowActiveStatus,
    fullWidth = false,
    singleStoreInline = false,
    buttonClassName,
    hideSelectedFromDropdown = false,
    applyClassicThemeOverride = false,
}: Props) {
    const theme = useTheme()
    const inlineNameRef = useRef<HTMLSpanElement>(null)
    const buttonTextRef = useRef<HTMLSpanElement>(null)

    const displayName =
        selected === undefined
            ? 'Select a store'
            : selected === null
              ? 'All Stores'
              : selected?.name || ''

    const isInlineTruncated = useIsTruncated(
        inlineNameRef,
        selected?.name ?? '',
    )

    const isButtonTextTruncated = useIsTruncated(buttonTextRef, displayName)

    const getStatusColor = useCallback(
        (integration: StoreIntegration): ColorValue | undefined => {
            if (!shouldShowActiveStatus) return undefined
            const isActive = shouldShowActiveStatus(integration)
            if (isActive === undefined) return undefined
            return isActive ? 'green' : 'red'
        },
        [shouldShowActiveStatus],
    )

    const isSingleStore = integrations.length === 1
    const showAsInline = isSingleStore && singleStoreInline
    const showChevron = !isSingleStore || (isSingleStore && withAllOption)
    const isDisabled = isSingleStore && !withAllOption

    const selectedStatusColor = selected ? getStatusColor(selected) : undefined

    const sections = useMemo(() => {
        const storeItems: StoreSelectorItem[] = integrations
            .filter(
                (integration) =>
                    !hideSelectedFromDropdown ||
                    integration.id !== selected?.id,
            )
            .map((integration) => ({
                id: integration.id,
                name: integration.name,
                type: integration.type,
            }))

        if (withAllOption) {
            const allSection: StoreSelectorSection = {
                id: 'all',
                items: [
                    {
                        id: 'all-stores',
                        name: 'All Stores',
                        type: null,
                        isAllOption: true,
                    },
                ],
            }
            const storesSection: StoreSelectorSection = {
                id: 'stores',
                items: storeItems,
            }
            return [allSection, storesSection]
        }

        return [{ id: 'stores', items: storeItems }]
    }, [integrations, withAllOption, hideSelectedFromDropdown, selected?.id])

    const selectedItem = useMemo((): StoreSelectorItem | null => {
        if (selected === undefined) return null
        if (selected === null) {
            return {
                id: 'all-stores',
                name: 'All Stores',
                type: null,
                isAllOption: true,
            }
        }
        return {
            id: selected.id,
            name: selected.name,
            type: selected.type,
        }
    }, [selected])

    const handleSelect = useCallback(
        (item: StoreSelectorItem) => {
            if (item.isAllOption) {
                ;(onChange as (value: number | null) => void)(null)
            } else {
                onChange(item.id as number)
            }
        },
        [onChange],
    )

    const [triggerWidth, setTriggerWidth] = useState<number | undefined>(
        undefined,
    )

    const triggerRef = useCallback(
        (node: HTMLButtonElement | null) => {
            if (node && fullWidth) {
                setTriggerWidth(node.getBoundingClientRect().width)
            }
        },
        [fullWidth],
    )

    if (integrations.length === 0) {
        return null
    }

    if (showAsInline && selected) {
        return (
            <div
                className={classNames(
                    css.inlineStoreContainer,
                    fullWidth && css.inlineStoreContainerFullWidth,
                )}
            >
                <div className={css.inlineStoreContent}>
                    <div className={css.integrationIconContainer}>
                        <IntegrationIcon
                            kind={selected.type}
                            className={css.integrationIcon}
                        />
                    </div>
                    {isInlineTruncated ? (
                        <Tooltip placement="top">
                            <TooltipTrigger>
                                <span
                                    ref={inlineNameRef}
                                    className={css.inlineStoreName}
                                >
                                    {selected.name || ''}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent title={selected.name} />
                        </Tooltip>
                    ) : (
                        <span
                            ref={inlineNameRef}
                            className={css.inlineStoreName}
                        >
                            {selected.name || ''}
                        </span>
                    )}
                </div>
                {selectedStatusColor && (
                    <Dot color={selectedStatusColor} size="md" />
                )}
            </div>
        )
    }

    const isDarkDropdown =
        applyClassicThemeOverride && theme.resolvedName === THEME_NAME.Classic

    return (
        <div
            className={classNames(
                fullWidth && css.selectContainerFullWidth,
                isDarkDropdown && css.darkDropdown,
            )}
        >
            <Select
                items={sections}
                selectedItem={selectedItem}
                onSelect={handleSelect}
                isSearchable={withSearch}
                maxHeight={400}
                maxWidth={triggerWidth}
                isDisabled={isDisabled}
                placement="bottom left"
                aria-label="Store selector"
                trigger={({ ref, isOpen }) => (
                    <Button
                        ref={(node: HTMLButtonElement | null) => {
                            if (ref) {
                                ;(
                                    ref as React.MutableRefObject<HTMLButtonElement | null>
                                ).current = node
                            }
                            triggerRef(node)
                        }}
                        variant="secondary"
                        isDisabled={isDisabled}
                        className={classNames(
                            css.buttonContainer,
                            buttonClassName,
                        )}
                        style={
                            fullWidth
                                ? { display: 'flex', width: '100%' }
                                : undefined
                        }
                    >
                        <span
                            className={classNames(
                                css.triggerContent,
                                fullWidth && css.fullWidth,
                            )}
                        >
                            {selected && (
                                <div className={css.integrationIconContainer}>
                                    <IntegrationIcon
                                        kind={selected.type}
                                        className={css.integrationIcon}
                                    />
                                </div>
                            )}
                            <Tooltip
                                placement="top"
                                isDisabled={!isButtonTextTruncated}
                            >
                                <TooltipTrigger>
                                    <span
                                        ref={buttonTextRef}
                                        className={css.buttonTextContent}
                                    >
                                        {displayName}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent title={displayName} />
                            </Tooltip>
                            <span className={css.trailingSlot}>
                                {selectedStatusColor && (
                                    <Dot
                                        color={selectedStatusColor}
                                        size="md"
                                    />
                                )}
                                {showChevron && (
                                    <Icon
                                        name={
                                            isOpen
                                                ? 'arrow-chevron-up'
                                                : 'arrow-chevron-down'
                                        }
                                        size="xs"
                                    />
                                )}
                            </span>
                        </span>
                    </Button>
                )}
            >
                {(section: StoreSelectorSection) => (
                    <ListSection id={section.id} items={section.items}>
                        {(item: StoreSelectorItem) => {
                            const statusColor = item.isAllOption
                                ? undefined
                                : getStatusColor(
                                      integrations.find(
                                          (i) => i.id === item.id,
                                      )!,
                                  )
                            return (
                                <ListItem
                                    id={item.id}
                                    textValue={item.name}
                                    label={item.name}
                                    leadingSlot={
                                        item.isAllOption ? (
                                            <div className={css.fakeIcon} />
                                        ) : (
                                            <IntegrationIcon
                                                kind={item.type!}
                                                className={css.integrationIcon}
                                            />
                                        )
                                    }
                                    trailingSlot={
                                        statusColor ? (
                                            <Dot
                                                color={statusColor}
                                                size="md"
                                            />
                                        ) : undefined
                                    }
                                />
                            )
                        }}
                    </ListSection>
                )}
            </Select>
        </div>
    )
}
