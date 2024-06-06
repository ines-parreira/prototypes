import React, {useState} from 'react'

import InputField from 'pages/common/forms/input/InputField'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
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

const getInputError = (
    isInvalid: boolean,
    isDuplicate: boolean,
    status: SourceItem['status']
) => {
    if (isInvalid) {
        return 'Invalid URL'
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
}

export const PublicSourcesItem = ({
    source,
    onDelete,
    onSync,
    existingUrls,
}: Props) => {
    const [value, setValue] = useState(source.url ?? '')

    const handleChange = (value: string) => {
        setValue(value)
    }

    const handleDelete = () => {
        onDelete(source)
    }

    const handleSync = () => {
        onSync(value, source.id)
    }

    const handleOpen = () => {
        if (value) {
            window.open(value, '_blank', 'noopener noreferrer')
        }
    }

    const isValidUrl = isUrlValid(value)
    const isDuplicate = value !== source.url && existingUrls.includes(value)
    const isNotEmpty = value !== '' && value !== undefined
    const isValid = isValidUrl && isNotEmpty

    const isEditingDisabled =
        source.status !== 'idle' && source.status !== 'error'

    const isSyncDisabled =
        (source.status !== 'idle' &&
            source.status !== 'error' &&
            source.status !== 'done') ||
        isDuplicate

    const inputError = getInputError(
        !isValidUrl && isNotEmpty,
        isDuplicate,
        source.status
    )

    return (
        <div className={css.container}>
            <InputField
                className={css.input}
                value={value}
                isDisabled={isEditingDisabled}
                onChange={handleChange}
                placeholder="URL"
                hasError={source.status === 'error' || !!inputError}
                aria-label="Public URL"
                error={inputError}
            />
            <Button
                intent="secondary"
                isDisabled={!isValid || isSyncDisabled}
                disabled={!isValid || isSyncDisabled}
                onClick={handleSync}
                isLoading={source.status === 'loading'}
                data-testid="sync-button"
            >
                {source.status === 'loading' ? (
                    'Sync URL'
                ) : (
                    <ButtonIconLabel icon="sync">Sync URL</ButtonIconLabel>
                )}
            </Button>

            <div className={css.buttonGroup}>
                <IconButton
                    size="small"
                    fillStyle="ghost"
                    intent="secondary"
                    isDisabled={!isValid}
                    disabled={!isValid}
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
