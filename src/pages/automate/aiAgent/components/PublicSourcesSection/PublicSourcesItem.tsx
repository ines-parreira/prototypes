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

type Props = {
    source: SourceItem
    onDelete: (id: number) => void
    onSync: (id: number) => void
}

export const PublicSourcesItem = ({source, onDelete, onSync}: Props) => {
    const [value, setValue] = useState(source.url ?? '')

    const handleChange = (value: string) => {
        setValue(value)
    }

    const handleDelete = () => {
        onDelete(source.id)
    }

    const handleSync = () => {
        onSync(source.id)
    }

    const handleOpen = () => {
        if (value) {
            window.open(value, '_blank', 'noopener noreferrer')
        }
    }

    const isValidUrl = isUrlValid(value)
    const isNotEmpty = value !== '' && value !== undefined
    const isValid = isValidUrl && isNotEmpty

    const isSyncDisabled = source.status !== 'idle' && source.status !== 'error'

    return (
        <div className={css.container}>
            <InputField
                className={css.input}
                value={value}
                isDisabled={isSyncDisabled}
                onChange={handleChange}
                placeholder="URL"
                aria-label="Public URL"
                error={!isValidUrl && isNotEmpty ? 'Invalid URL' : undefined}
            />
            <Button
                intent="secondary"
                isDisabled={!isValid || isSyncDisabled}
                onClick={handleSync}
                isLoading={source.status === 'loading'}
            >
                <ButtonIconLabel icon="sync">Sync URL</ButtonIconLabel>
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
