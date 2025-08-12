import React, { useCallback, useRef, useState } from 'react'

import classNames from 'classnames'
import { ClassValue } from 'classnames/types'

import { Button, Separator } from '@gorgias/axiom'

import dotNeutral from 'assets/img/icons/dot-neutral.svg'
import dotSuccess from 'assets/img/icons/dot-success.svg'

import { StoreIntegration } from '../../../../models/integration/types'
import Dropdown from '../dropdown/Dropdown'
import DropdownBody from '../dropdown/DropdownBody'
import DropdownItem from '../dropdown/DropdownItem'
import DropdownSearch from '../dropdown/DropdownSearch'
import { IntegrationIcon } from '../IntegrationIcon/IntegrationIcon'

import css from './StoreSelector.less'

type BaseProps = {
    integrations: StoreIntegration[]
    selected?: StoreIntegration | null
    withSearch?: boolean
    // provide a function to get whether to display a success or neutral dot for the store
    shouldShowActiveStatus?: (
        integration: StoreIntegration,
    ) => boolean | undefined
    fullWidth?: boolean
    // When only one store, render without button styles
    singleStoreInline?: boolean
    buttonClassName?: ClassValue
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

const StatusIndicator = ({
    integration,
    getStatusIndicator,
    className,
}: {
    integration: StoreIntegration
    getStatusIndicator: (integration: StoreIntegration) => string | undefined
    className: string
}) => {
    const statusIndicator = getStatusIndicator(integration)

    if (!statusIndicator) {
        return null
    }

    return <img src={statusIndicator} alt="status" className={className} />
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
}: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const targetRef = useRef<HTMLButtonElement | null>(null)

    const handleClickButton = useCallback(() => {
        setIsOpen((o) => !o)
    }, [])

    const getStatusIndicator = useCallback(
        (integration: StoreIntegration) => {
            if (!shouldShowActiveStatus) {
                return undefined
            }

            const isActive = shouldShowActiveStatus(integration)
            if (isActive === undefined) {
                return undefined
            }

            return isActive ? dotSuccess : dotNeutral
        },
        [shouldShowActiveStatus],
    )

    const selectedStatusIndicator = selected
        ? getStatusIndicator(selected)
        : undefined

    const isSingleStore = integrations.length === 1
    const showAsInline = isSingleStore && singleStoreInline

    if (integrations.length === 0) {
        return null
    }

    // For single store without button styles, render inline element
    if (showAsInline && selected) {
        return (
            <div
                className={classNames(
                    css.inlineStoreContainer,
                    fullWidth && css.inlineStoreContainerFullWidth,
                )}
            >
                <div className={css.inlineStoreContent}>
                    <div className={css.integrationIcon}>
                        <IntegrationIcon kind={selected.type} />
                    </div>
                    <span className={css.inlineStoreName}>
                        {selected.name || ''}
                    </span>
                </div>
                {selectedStatusIndicator && (
                    <img
                        src={selectedStatusIndicator}
                        alt="status"
                        className={css.statusDotInline}
                    />
                )}
            </div>
        )
    }

    return (
        <>
            <Button
                intent="secondary"
                ref={targetRef}
                onClick={handleClickButton}
                className={classNames(
                    css.buttonContainer,
                    fullWidth && css.buttonContainerFullWidth,
                    buttonClassName,
                )}
                isDisabled={isSingleStore && !withAllOption}
            >
                <span
                    className={classNames(
                        css.spacer,
                        css.button,
                        fullWidth && css.fullWidth,
                    )}
                >
                    {selected && (
                        <div className={css.integrationIcon}>
                            <IntegrationIcon kind={selected.type} />
                        </div>
                    )}
                    <span className={css.buttonTextContent}>
                        {selected === undefined
                            ? 'Select a store'
                            : selected === null
                              ? 'All Stores'
                              : selected?.name || ''}
                    </span>
                    {selectedStatusIndicator && (
                        <img
                            src={selectedStatusIndicator}
                            alt="status"
                            className={css.statusDotButton}
                        />
                    )}
                    {(!isSingleStore || (isSingleStore && withAllOption)) && (
                        <i
                            className={classNames(
                                'material-icons',
                                css.dropdownIcon,
                            )}
                        >
                            arrow_drop_down
                        </i>
                    )}
                </span>
            </Button>
            <Dropdown
                isOpen={isOpen}
                placement="bottom-end"
                target={targetRef}
                onToggle={setIsOpen}
                value={selected?.id || null}
            >
                {withSearch && <DropdownSearch autoFocus />}
                <DropdownBody>
                    {withAllOption && (
                        <>
                            <DropdownItem
                                key="all"
                                option={{
                                    label: 'All Stores',
                                    value: null,
                                }}
                                onClick={() =>
                                    (
                                        onChange as (
                                            value: number | null,
                                        ) => void
                                    )(null)
                                }
                                shouldCloseOnSelect
                                alwaysVisible
                            >
                                <span className={css.spacer}>
                                    <div className={css.fakeIcon} />
                                    All Stores
                                </span>
                            </DropdownItem>
                            <Separator />
                        </>
                    )}
                    {integrations.map((integration) => (
                        <DropdownItem
                            key={integration.id}
                            option={{
                                label: integration.name,
                                value: integration.id,
                            }}
                            onClick={() => onChange(integration.id)}
                            shouldCloseOnSelect
                        >
                            <span className={css.spacer}>
                                <IntegrationIcon kind={integration.type} />
                                {integration.name}
                                {shouldShowActiveStatus && (
                                    <StatusIndicator
                                        integration={integration}
                                        getStatusIndicator={getStatusIndicator}
                                        className={css.statusDotDropdown}
                                    />
                                )}
                            </span>
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
