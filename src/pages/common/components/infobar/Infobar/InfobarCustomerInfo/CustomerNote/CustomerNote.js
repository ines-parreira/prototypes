// @flow
import React from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'

import * as customerActions from '../../../../../../../state/customers/actions'
import {countLines} from '../../../../../../../utils/string'

import css from './CustomerNote.less'


type Props = {
    customer: Map<*,*>,
    submitCustomer: (Object, ?number) => Promise<*>,
    mergeTicketCustomer: (Object) => void
}

type State = {
    note: string,
    isLoading: boolean,
    isError: boolean,
    isDirty: boolean
}

export class CustomerNote extends React.Component<Props, State> {
    state = {
        note: this.props.customer.get('note') || '',
        isLoading: false,
        isError: false,
        isDirty: false
    }

    componentWillReceiveProps(nextProps: Props) {
        // todo(@martin): handle the case when the note is overridden by a server-side update while the current user
        //  is modifying the note at the same time
        this.setState({
            note: nextProps.customer.get('note'),
            isDirty: false
        })
    }

    _updateNote = async (event: SyntheticEvent<HTMLInputElement>) => {
        await this.setState({
            note: event.currentTarget.value,
            isDirty: true
        })
    }

    _submitNote = async () => {
        const {customer, submitCustomer} = this.props
        const {note, isDirty} = this.state

        if (!isDirty) {
            return
        }

        this.setState({isLoading: true})

        try {
            // $FlowFixMe
            await submitCustomer({note}, customer.get('id'))
        } catch(err) {
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
            <div style={{display: 'none'}}>
                <p className={css.customerNote}>
                    <i className={classnames('material-icons', css.noteIcon)}>
                        note
                    </i>
                    <div className={css.noteInputContainer}>
                        <textarea
                            className={classnames(css.noteInput, {
                                [css.loading]: isLoading,
                                [css.error]: isError
                            })}
                            disabled={isLoading}
                            placeholder="This customer has no note."
                            value={note}
                            onChange={this._updateNote}
                            onBlur={this._submitNote}
                            rows={noteRowsCount > 2 ? noteRowsCount : 2}
                        />
                        {
                            isError && (
                                <p className={classnames(css.errorMessage, 'text-danger')}>
                                    An error occurred while posting this note. Please try again in a few seconds.
                                </p>
                            )
                        }
                        {
                            isLoading && (
                                <i className={classnames('icon-custom icon-circle-o-notch md-spin', css.loaderIcon)}/>
                            )
                        }
                    </div>
                </p>
            </div>
        )
    }
}

export default connect(null, {
    submitCustomer: customerActions.submitCustomer
})(CustomerNote)
