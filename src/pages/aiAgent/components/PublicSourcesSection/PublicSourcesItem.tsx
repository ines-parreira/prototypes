import React, { useCallback, useEffect, useState } from 'react'

import { useHistory } from 'react-router'
import { useParams } from 'react-router-dom'

import { IconButton } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import Button from 'pages/common/components/button/Button'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import InputField from 'pages/common/forms/input/InputField'

import { useAiAgentNavigation } from '../../hooks/useAiAgentNavigation'
import { SourceItem } from './types'
import { DOCUMENT_EXTENSIONS } from './utils'

import css from './PublicSourcesItem.less'

const isUrlValid = (url?: string) => {
    if (!url) return false

    try {
        new URL(url)
        return true
    } catch {
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
    } catch {
        return false
    }
}

const isUrlFromGorgiasHelpCenter = (
    url: string,
    helpCenterCustomDomains: string[],
) => {
    try {
        const urlObj = new URL(url)
        const hostname = urlObj.hostname

        const isGorgiasDomain = hostname.endsWith('.gorgias.help')
        const isCustomDomain = helpCenterCustomDomains.includes(hostname)

        return isGorgiasDomain || isCustomDomain
    } catch {
        return false
    }
}

const isUrlWithDocumentExtension = (url: string): boolean => {
    try {
        const urlObj = new URL(url)
        const extension = urlObj.pathname.split('.').pop()?.toLowerCase()
        return extension !== undefined && DOCUMENT_EXTENSIONS.has(extension)
    } catch {
        return false
    }
}

const getInputError = (
    isInvalid: boolean,
    isGorgiasHelpCenterUrl: boolean,
    isRootUrl: boolean,
    isDuplicate: boolean,
    hasDocumentExtension: boolean,
    status: SourceItem['status'],
) => {
    if (isInvalid) {
        return 'Invalid URL'
    }

    if (isGorgiasHelpCenterUrl) {
        return 'URL cannot be a Gorgias Help Center'
    }

    if (isRootUrl) {
        return 'URL must include a subpage (ie. www.example.com/faqs)'
    }

    if (isDuplicate) {
        return 'This URL has already been added'
    }

    if (hasDocumentExtension) {
        return 'URL cannot be a document'
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
    const history = useHistory()

    const [isCurrentUrlPristine, setIsCurrentUrlPristine] = useState(true)

    const { shopName } = useParams<{ shopName: string }>()
    const { routes } = useAiAgentNavigation({ shopName })

    const isAiAgentFilesAndUrlsKnowledgeVisible = useFlag(
        FeatureFlagKey.AiAgentFilesAndUrlsKnowledgeVisibilityButton,
    )

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
        helpCenterCustomDomains,
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

    const hasDocumentExtension = isUrlWithDocumentExtension(value)

    const inputError = getInputError(
        !isValidUrl && isNotEmpty,
        isGorgiasHelpCenterUrl,
        isRootUrl,
        isDuplicate,
        hasDocumentExtension,
        source.status,
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
                placeholder="https://www.example.com/return-policy"
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
                    icon="open_in_new"
                />

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
                        {({ uid, elementRef, onDisplayConfirmation }) => (
                            <IconButton
                                size="small"
                                fillStyle="ghost"
                                className={css.closeIcon}
                                onClick={onDisplayConfirmation}
                                id={uid}
                                ref={elementRef}
                                aria-label="Delete public URL"
                                icon="close"
                            />
                        )}
                    </ConfirmationPopover>
                ) : (
                    <IconButton
                        size="small"
                        fillStyle="ghost"
                        className={css.closeIcon}
                        onClick={handleDelete}
                        aria-label="Delete public URL"
                        icon="close"
                    />
                )}
                {isAiAgentFilesAndUrlsKnowledgeVisible && (
                    <IconButton
                        size="small"
                        fillStyle="ghost"
                        intent="secondary"
                        aria-label="Open articles"
                        onClick={() => {
                            history.push(routes.urlArticles(source.id), {
                                selectedResource: source,
                            })
                        }}
                        className={css.arrowIcon}
                        icon="keyboard_arrow_right"
                    />
                )}
            </div>
        </div>
    )
}
