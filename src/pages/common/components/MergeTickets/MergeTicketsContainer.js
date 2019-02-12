// @flow
import React from 'react'
import {browserHistory} from 'react-router'
import {connect} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {Button, Form} from 'reactstrap'

import Modal from '../Modal'
import ConfirmButton from '../ConfirmButton'

import {mergeTickets} from '../../../../state/mergeTickets/actions'
import shortcutManager from '../../../../services/shortcutManager/shortcutManager'

import * as segmentTracker from '../../../../store/middlewares/segmentTracker'

import css from './MergeTicketsContainer.less'
import BuildFinalTicket from './BuildFinalTicket'
import SelectTargetTicket from './SelectTargetTicket'


const EDITABLE_FIELDS = fromJS(['subject', 'customer', 'assignee_user'])

type Props = {
    sourceTicket: Map<*,*>,
    isOpen: boolean,
    toggleModal: () => null,
    mergeTickets: (number, number, Map<*,*>) => Promise<*>,
}

type State = {
    targetTicket: ?Map<*,*>,
    finalTicket: ?Map<*,*>,
    isLoading: boolean
}

class MergeTicketsContainer extends React.Component<Props, State> {
    state = {
        targetTicket: null,
        finalTicket: null,
        isLoading: false
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.isOpen && !this.props.isOpen) {
            shortcutManager.bind('TicketDetailContainer')
        } else if (!prevProps.isOpen && this.props.isOpen) {
            shortcutManager.unbind('TicketDetailContainer')
            segmentTracker.logEvent(segmentTracker.EVENTS.TICKET_MERGE_CLICKED, {
                sourceTicketId: this.props.sourceTicket.get('id')
            })
        }
    }

    _updateTargetTicket = (targetTicket) => {
        const {sourceTicket} = this.props

        let finalTicket = fromJS({})

        EDITABLE_FIELDS.forEach((fieldName) => {
            let value = targetTicket.get(fieldName)

            if (!value) {
                value = sourceTicket.get(fieldName)
            }

            if (value) {
                finalTicket = finalTicket.set(fieldName, value)
            }
        })

        finalTicket = finalTicket.set('customer', finalTicket.get('customer').delete('email'))

        this.setState({targetTicket, finalTicket})
    }

    _handleSubmit = (evt: Event) => {
        evt.preventDefault()
        this.setState({isLoading: true})

        const {sourceTicket} = this.props
        const {targetTicket, finalTicket} = this.state

        if (!sourceTicket || !targetTicket || !finalTicket) {
            return
        }

        this.props.mergeTickets(
            sourceTicket.get('id'),
            targetTicket.get('id'),
            finalTicket.toJS()
        ).then((data) => browserHistory.push(`/app/ticket/${data.id}`))
            .catch(() => this.setState({isLoading: false}))
    }

    render() {
        const {sourceTicket, isOpen} = this.props
        const {targetTicket, finalTicket, isLoading} = this.state

        let content = <BuildFinalTicket
            sourceTicket={sourceTicket}
            targetTicket={targetTicket}
            finalTicket={finalTicket}
            updateFinalTicket={(finalTicket) => this.setState({finalTicket})}
        />

        if (!targetTicket){
            content = <SelectTargetTicket
                sourceTicket={sourceTicket}
                updateTargetTicket={this._updateTargetTicket}
                customerId={sourceTicket.getIn(['customer', 'id'])}
            />
        }

        return (
            <Modal
                isOpen={isOpen}
                onClose={() => this.props.toggleModal()}
                onClosed={() => this.setState({targetTicket: null})}
                size="lg"
                header="Merge tickets"
                className={css.modal}
                footerClassName={css.footer}
                footer={targetTicket ? (
                    <Form
                        onSubmit={this._handleSubmit}
                        style={{width: '100%'}}
                    >
                        <div className="float-left buttons-bar">
                            <Button
                                color="secondary"
                                type="button"
                                onClick={() => this.setState({targetTicket: null})}
                                disabled={isLoading}
                            >
                                <i className="material-icons mr-2">arrow_back</i>
                                Back
                            </Button>
                        </div>
                        <div className="float-right buttons-bar">
                            <Button
                                color="secondary"
                                type="button"
                                className="mr-2"
                                onClick={this.props.toggleModal}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <ConfirmButton
                                color="success"
                                type="submit"
                                content="This action is irreversible. Are you sure you want to merge these tickets?"
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                Merge tickets
                            </ConfirmButton>
                        </div>
                    </Form>
                ) : null}
            >
                {content}
            </Modal>
        )
    }
}

export default connect(null, {
    mergeTickets
})(MergeTicketsContainer)
