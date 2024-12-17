import React, {useCallback, useEffect, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import InputField from 'pages/common/forms/input/InputField'

import css from './PublicSourcesItem.less'
import {SourceItem} from './types'

const isUrlValid = (url?: string) => {
    if (!url) return false

    try {
        new URL(url)
        return true
    } catch (err) {
        return false
    }
}

const isUrlRoot = (url: string) => {
    try {
        const urlObj = new URL(url)
        return (
            (urlObj.pathname === '/' || urlObj.pathname === '') &&
            !urlObj.search &&
            !urlObj.hash
        )
    } catch (_) {
        return false
    }
}

const isUrlFromGorgiasHelpCenter = (
    url: string,
    helpCenterCustomDomains: string[]
) => {
    try {
        const urlObj = new URL(url)
        const hostname = urlObj.hostname

        const isGorgiasDomain = hostname.endsWith('.gorgias.help')
        const isCustomDomain = helpCenterCustomDomains.includes(hostname)

        return isGorgiasDomain || isCustomDomain
    } catch (_) {
        return false
    }
}

const getInputError = (
    isInvalid: boolean,
    isGorgiasHelpCenterUrl: boolean,
    isRootUrl: boolean,
    isDuplicate: boolean,
    status: SourceItem['status']
) => {
    if (isInvalid) {
        return 'Invalid URL'
    }

    if (isGorgiasHelpCenterUrl) {
        return 'URL cannot be a Gorgias Help Center'
    }

    if (isRootUrl) {
        return 'URL must include a subpage (ie. yourstore.com/faqs)'
    }

    if (isDuplicate) {
        return 'This URL has already been added'
    }

    if (status === 'error') {
        return 'URL cannot be processed'
    }

    return undefined
}

type Props = {
    source: SourceItem
    existingUrls: string[]
    onDelete: (source: SourceItem) => void
    onSync: (url: string, sourceId: number) => void
    helpCenterCustomDomains: string[]
    setIsPristine?: (isPristine: boolean) => void
    syncUrlOnCommand?: boolean
    setSyncUrlOnCommand?: (value: boolean) => void
}

export const PublicSourcesItem = ({
    source,
    onDelete,
    onSync,
    existingUrls,
    helpCenterCustomDomains,
    setIsPristine,
    syncUrlOnCommand,
    setSyncUrlOnCommand,
}: Props) => {
    const [value, setValue] = useState(source.url ?? '')
    const [isCurrentUrlPristine, setIsCurrentUrlPristine] = useState(true)

    const handleChange = (value: string) => {
        if (setIsPristine) setIsPristine(false)
        setIsCurrentUrlPristine(false)
        setValue(value)
    }

    const handleDelete = () => {
        onDelete(source)
    }

    const handleSync = useCallback(() => {
        if (setIsPristine) setIsPristine(true)
        setIsCurrentUrlPristine(true)
        onSync(value, source.id)
    }, [onSync, setIsPristine, source.id, value])

    const handleOpen = () => {
        if (value) {
            window.open(value, '_blank', 'noopener noreferrer')
        }
    }

    const isValidUrl = isUrlValid(value)
    const isDuplicate = value !== source.url && existingUrls.includes(value)
    const isNotEmpty = value !== '' && value !== undefined
    const isGorgiasHelpCenterUrl = isUrlFromGorgiasHelpCenter(
        value,
        helpCenterCustomDomains
    )
    const isRootUrl = isUrlRoot(value)
    const isValid =
        isValidUrl && isNotEmpty && !isGorgiasHelpCenterUrl && !isRootUrl

    const isEditingDisabled =
        source.status !== 'idle' && source.status !== 'error'

    const isSyncDisabled =
        (source.status !== 'idle' &&
            source.status !== 'error' &&
            source.status !== 'done') ||
        isDuplicate

    const inputError = getInputError(
        !isValidUrl && isNotEmpty,
        isGorgiasHelpCenterUrl,
        isRootUrl,
        isDuplicate,
        source.status
    )

    useEffect(() => {
        if (
            !!syncUrlOnCommand &&
            !isCurrentUrlPristine &&
            isValid &&
            !inputError &&
            !isSyncDisabled
        ) {
            handleSync()
        }

        if (!!syncUrlOnCommand && setSyncUrlOnCommand) {
            setSyncUrlOnCommand(false)
        }
    }, [
        handleSync,
        inputError,
        isCurrentUrlPristine,
        isSyncDisabled,
        isValid,
        syncUrlOnCommand,
        setSyncUrlOnCommand,
    ])

    return (
        <div className={css.container}>
            <InputField
                className={css.input}
                value={value}
                isDisabled={isEditingDisabled}
                onChange={handleChange}
                placeholder="https://yourstore.com/faqs"
                hasError={source.status === 'error' || !!inputError}
                aria-label="Public URL"
                error={inputError}
            />
            <Button
                intent="secondary"
                isDisabled={!isValid || !!inputError || isSyncDisabled}
                onClick={handleSync}
                isLoading={source.status === 'loading'}
                leadingIcon="sync"
            >
                Sync URL
            </Button>

            <div className={css.buttonGroup}>
                <IconButton
                    size="small"
                    fillStyle="ghost"
                    intent="secondary"
                    isDisabled={!isValid}
                    aria-label="Open public URL"
                    onClick={handleOpen}
                >
                    open_in_new
                </IconButton>

                {source.status !== 'idle' ? (
                    <ConfirmationPopover
                        placement="bottom"
                        buttonProps={{
                            intent: 'destructive',
                        }}
                        confirmLabel="Delete"
                        title="Delete URL?"
                        content={
                            <p>
                                Are you sure you want to delete this URL? AI
                                Agent won’t be able to use this information
                                anymore.
                            </p>
                        }
                        onConfirm={handleDelete}
                    >
                        {({uid, elementRef, onDisplayConfirmation}) => (
                            <IconButton
                                size="small"
                                fillStyle="ghost"
                                className={css.closeIcon}
                                onClick={onDisplayConfirmation}
                                id={uid}
                                ref={elementRef}
                                aria-label="Delete public URL"
                            >
                                close
                            </IconButton>
                        )}
                    </ConfirmationPopover>
                ) : (
                    <IconButton
                        size="small"
                        fillStyle="ghost"
                        className={css.closeIcon}
                        onClick={handleDelete}
                        aria-label="Delete public URL"
                    >
                        close
                    </IconButton>
                )}
            </div>
        </div>
    )
}
