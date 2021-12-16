import React, {ChangeEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {Map} from 'immutable'

import {submitCustomer} from '../../../../../../../state/customers/actions'
import {
    SegmentEvent,
    logEvent,
} from '../../../../../../../store/middlewares/segmentTracker'
import {countLines} from '../../../../../../../utils/string'

import css from './CustomerNote.less'

type OwnProps = {
    customer: Map<any, any>
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    note: string
    isLoading: boolean
    isError: boolean
    isDirty: boolean
}

export class CustomerNote extends React.Component<Props, State> {
    state = {
        note: this.props.customer.get('note') || '',
        isLoading: false,
        isError: false,
        isDirty: false,
    }

    componentWillReceiveProps(nextProps: Props) {
        // todo(@martin): handle the case when the note is overridden by a server-side update while the current user
        //  is modifying the note at the same time
        this.setState({
            note: nextProps.customer.get('note'),
            isDirty: false,
        })
    }

    _updateNote = async (event: ChangeEvent<HTMLTextAreaElement>) => {
        await new Promise<void>((resolve) => {
            this.setState(
                {
                    note: event.currentTarget.value,
                    isDirty: true,
                },
                resolve
            )
        })
    }

    _submitNote = async () => {
        const {customer, submitCustomer} = this.props
        const {note, isDirty} = this.state

        if (!isDirty) {
            return
        }

        logEvent(SegmentEvent.CustomerNoteEdited)

        this.setState({isLoading: true})

        try {
            await submitCustomer({note} as any, customer.get('id'))
        } catch (err) {
            this.setState({isLoading: false, isError: true})
            setTimeout(() => this.setState({isError: false}), 2000)
            return
        }

        this.setState({isLoading: false, isDirty: false})
    }

    render() {
        const {note, isLoading, isError} = this.state

        const noteRowsCount = countLines(note)

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
                            onChange={this._updateNote}
                            onBlur={this._submitNote}
                            rows={noteRowsCount || 1}
                        />
                        {isError && (
                            <p
                                className={classnames(
                                    css.errorMessage,
                                    'text-danger'
                                )}
                            >
                                An error occurred while posting this note.
                                Please try again in a few seconds.
                            </p>
                        )}
                        {isLoading && (
                            <i
                                className={classnames(
                                    'icon-custom icon-circle-o-notch md-spin',
                                    css.loaderIcon
                                )}
                            />
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

const connector = connect(null, {
    submitCustomer,
})

export default connector(CustomerNote)
