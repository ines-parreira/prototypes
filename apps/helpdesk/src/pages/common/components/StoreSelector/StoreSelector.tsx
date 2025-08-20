import React, { useCallback, useRef, useState } from 'react'

import classNames from 'classnames'
import { ClassValue } from 'classnames/types'

import { Button, Separator, Tooltip } from '@gorgias/axiom'

import dotError from 'assets/img/icons/dot-error.svg'
import dotSuccess from 'assets/img/icons/dot-success.svg'

import { StoreIntegration } from '../../../../models/integration/types'
import { useIsTruncated } from '../../hooks/useIsTruncated'
import Dropdown from '../dropdown/Dropdown'
import DropdownBody from '../dropdown/DropdownBody'
import DropdownItem from '../dropdown/DropdownItem'
import DropdownSearch from '../dropdown/DropdownSearch'
import { IntegrationIcon } from '../IntegrationIcon/IntegrationIcon'
import { TruncatedText } from '../TruncatedText'

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
    // Hide the selected store from the dropdown options
    hideSelectedFromDropdown?: boolean
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
    hideSelectedFromDropdown = false,
}: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const targetRef = useRef<HTMLButtonElement | null>(null)

    const inlineNameRef = useRef<HTMLSpanElement>(null)
    const buttonNameRef = useRef<HTMLSpanElement>(null)

    const isInlineTruncated = useIsTruncated(
        inlineNameRef,
        selected?.name ?? '',
    )
    const isButtonTruncated = useIsTruncated(
        buttonNameRef,
        selected?.name ?? '',
    )

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

            return isActive ? dotSuccess : dotError
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
        const inlineNameId = `inline-store-${selected.id}`

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
                    <span
                        ref={inlineNameRef}
                        id={inlineNameId}
                        className={css.inlineStoreName}
                    >
                        {selected.name || ''}
                    </span>
                    {isInlineTruncated && (
                        <Tooltip target={inlineNameId} placement="top">
                            {selected.name}
                        </Tooltip>
                    )}
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
                        <div className={css.integrationIconContainer}>
                            <IntegrationIcon
                                kind={selected.type}
                                className={css.integrationIcon}
                            />
                        </div>
                    )}
                    <span
                        ref={buttonNameRef}
                        id="button-store-name"
                        className={css.buttonTextContent}
                    >
                        {selected === undefined
                            ? 'Select a store'
                            : selected === null
                              ? 'All Stores'
                              : selected?.name || ''}
                    </span>
                    {isButtonTruncated && selected && selected.name && (
                        <Tooltip target="button-store-name" placement="top">
                            {selected.name}
                        </Tooltip>
                    )}
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
                shouldFlip={false}
                isOpen={isOpen}
                placement="bottom-start"
                target={targetRef}
                onToggle={setIsOpen}
                value={selected?.id || null}
                matchTriggerWidth
            >
                {withSearch && <DropdownSearch autoFocus />}
                <DropdownBody className={css.dropdownBody}>
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
                    {integrations
                        .filter(
                            (integration) =>
                                !hideSelectedFromDropdown ||
                                integration.id !== selected?.id,
                        )
                        .map((integration) => (
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
                                    <TruncatedText
                                        text={integration.name}
                                        className={css.dropdownStoreName}
                                    />
                                    {shouldShowActiveStatus && (
                                        <StatusIndicator
                                            integration={integration}
                                            getStatusIndicator={
                                                getStatusIndicator
                                            }
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
