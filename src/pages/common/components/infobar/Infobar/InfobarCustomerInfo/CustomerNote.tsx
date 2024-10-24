import classnames from 'classnames'
import {Map} from 'immutable'
import React, {ChangeEvent, useEffect, useState} from 'react'

import {SegmentEvent, logEvent} from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import {CustomerDraft} from 'models/customer/types'
import Spinner from 'pages/common/components/Spinner'
import {submitCustomer} from 'state/customers/actions'
import {countLines} from 'utils/string'

import css from './CustomerNote.less'

export default function CustomerNote({customer}: {customer: Map<any, any>}) {
    const dispatch = useAppDispatch()
    const [note, setNote] = useState(customer.get('note') || '')
    const [isLoading, setIsLoading] = useState<boolean>()
    const [isError, setIsError] = useState<boolean>()
    const [isDirty, setDirty] = useState<boolean>()

    useEffect(() => {
        if (!isDirty) {
            setNote(customer.get('note'))
        }
    }, [customer, isDirty])

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
                submitCustomer({note} as CustomerDraft, customer.get('id'))
            )
        } catch (err) {
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
                                'text-danger'
                            )}
                        >
                            An error occurred while posting this note. Please
                            try again in a few seconds.
                        </p>
                    )}
                    {isLoading && (
                        <Spinner className={css.loaderIcon} size="small" />
                    )}
                </div>
            </div>
        </div>
    )
}
