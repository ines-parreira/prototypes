import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map, List} from 'immutable'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import {mergeTickets} from '../../../../state/mergeTickets/actions'
import shortcutManager from '../../../../services/shortcutManager/shortcutManager'
import {
    logEvent,
    SegmentEvent,
} from '../../../../store/middlewares/segmentTracker'
import history from '../../../history'

import BuildFinalTicket from './BuildFinalTicket'
import SelectTargetTicket from './SelectTargetTicket'

const EDITABLE_FIELDS = fromJS([
    'subject',
    'customer',
    'assignee_user',
]) as List<string>

type Props = ConnectedProps<typeof connector> & {
    sourceTicket: Map<any, any>
    isOpen: boolean
    toggleModal: () => void
}

type State = {
    targetTicket: Maybe<Map<any, any>>
    finalTicket: Maybe<Map<any, any>>
    isLoading: boolean
}

class MergeTicketsContainer extends React.Component<Props, State> {
    state = {
        targetTicket: null,
        finalTicket: null,
        isLoading: false,
    }

    buttonsRef = React.createRef<HTMLDivElement>()

    componentDidUpdate(prevProps: Props) {
        if (prevProps.isOpen && !this.props.isOpen) {
            shortcutManager.bind('TicketDetailContainer')
        } else if (!prevProps.isOpen && this.props.isOpen) {
            shortcutManager.unbind('TicketDetailContainer')
            logEvent(SegmentEvent.TicketMergeClicked, {
                sourceTicketId: this.props.sourceTicket.get('id'),
            })
        }
    }

    _updateTargetTicket = (targetTicket: Map<any, any>) => {
        const {sourceTicket} = this.props

        let finalTicket = fromJS({}) as Map<any, any>

        EDITABLE_FIELDS.forEach((fieldName) => {
            let value = targetTicket.get(fieldName)

            if (!value) {
                value = sourceTicket.get(fieldName)
            }

            if (value) {
                finalTicket = finalTicket.set(fieldName, value)
            }
        })

        finalTicket = finalTicket.update(
            'customer',
            (customer: Map<any, any>) =>
                fromJS({id: customer.get('id')}) as Map<any, any>
        )

        this.setState({targetTicket, finalTicket})
    }

    _handleSubmit = () => {
        this.setState({isLoading: true})

        const {sourceTicket} = this.props
        const {targetTicket, finalTicket} = this.state

        if (!sourceTicket || !targetTicket || !finalTicket) {
            return
        }

        this.props
            .mergeTickets(
                sourceTicket.get('id'),
                (targetTicket as unknown as Map<any, any>).get('id'),
                (finalTicket as unknown as Map<any, any>).toJS()
            )
            .then((data) =>
                history.push(`/app/ticket/${(data as {id: string}).id}`)
            )
            .catch(() => this.setState({isLoading: false}))
    }

    render() {
        const {sourceTicket, isOpen} = this.props
        const {targetTicket, finalTicket, isLoading} = this.state

        let content = (
            <BuildFinalTicket
                sourceTicket={sourceTicket}
                targetTicket={targetTicket as unknown as Map<any, any>}
                finalTicket={finalTicket as unknown as Map<any, any>}
                updateFinalTicket={(finalTicket) =>
                    this.setState({finalTicket})
                }
            />
        )

        if (!targetTicket) {
            content = (
                <SelectTargetTicket
                    sourceTicket={sourceTicket}
                    updateTargetTicket={this._updateTargetTicket}
                    customerId={sourceTicket.getIn(['customer', 'id'])}
                />
            )
        }

        return (
            <Modal
                isOpen={isOpen}
                onClose={() => {
                    this.props.toggleModal()
                    this.setState({targetTicket: null})
                }}
                size="huge"
            >
                <ModalHeader title="Merge tickets" />
                <ModalBody>{isOpen && content}</ModalBody>
                {targetTicket && (
                    <ModalActionsFooter
                        extra={
                            <Button
                                color="secondary"
                                onClick={() =>
                                    this.setState({targetTicket: null})
                                }
                                isDisabled={isLoading}
                            >
                                <ButtonIconLabel icon="arrow_back">
                                    Back
                                </ButtonIconLabel>
                            </Button>
                        }
                    >
                        <Button
                            intent="secondary"
                            onClick={this.props.toggleModal}
                            isDisabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <ConfirmButton
                            onConfirm={this._handleSubmit}
                            confirmationContent="This action is irreversible. Are you sure you want to merge these tickets?"
                            isLoading={isLoading}
                        >
                            Merge tickets
                        </ConfirmButton>
                    </ModalActionsFooter>
                )}
            </Modal>
        )
    }
}

const connector = connect(null, {
    mergeTickets,
})

export default connector(MergeTicketsContainer)
