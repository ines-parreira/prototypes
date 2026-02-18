import type { ChangeEvent } from 'react'
import { useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { countLines } from '@repo/utils'
import classnames from 'classnames'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import type { CustomerDraft } from 'models/customer/types'
import { submitCustomer } from 'state/customers/actions'

import css from './CustomerNote.less'

export default function CustomerNote({
    customerId,
    initialNote,
}: {
    customerId: number
    initialNote: string | undefined
}) {
    const dispatch = useAppDispatch()
    const [note, setNote] = useState(initialNote || '')
    const [isLoading, setIsLoading] = useState<boolean>()
    const [isError, setIsError] = useState<boolean>()
    const [isDirty, setDirty] = useState<boolean>()

    const updateNote = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setNote(event.currentTarget.value)
        setDirty(true)
    }

    const submitNote = async () => {
        if (!isDirty) {
            return
        }

        logEvent(SegmentEvent.CustomerNoteEdited)
        setIsLoading(true)

        try {
            await dispatch(
                submitCustomer({ note } as CustomerDraft, customerId),
            )
        } catch {
            setIsError(true)
            setTimeout(() => setIsError(false), 2000)
        } finally {
            setIsLoading(false)
            setDirty(false)
        }
    }

    return (
        <div>
            <div className={css.customerNote}>
                <i className={classnames('material-icons', css.noteIcon)}>
                    note
                </i>
                <div className={css.noteInputContainer}>
                    <textarea
                        className={classnames(css.noteInput, {
                            [css.loading]: isLoading,
                            [css.error]: isError,
                        })}
                        disabled={isLoading}
                        placeholder="This customer has no note."
                        value={note || ''}
                        onChange={updateNote}
                        onBlur={submitNote}
                        rows={countLines(note) || 1}
                    />
                    {isError && (
                        <p
                            className={classnames(
                                css.errorMessage,
                                'text-danger',
                            )}
                        >
                            An error occurred while posting this note. Please
                            try again in a few seconds.
                        </p>
                    )}
                    {isLoading && (
                        <LoadingSpinner
                            className={css.loaderIcon}
                            size="small"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
