import React, {useState} from 'react'

import {useLocalStorage} from 'react-use'

import {useFlags} from 'launchdarkly-react-client-sdk'

import {Map} from 'immutable'

import history from 'pages/history'

import {FeatureFlagKey} from 'config/featureFlags'

import useAppSelector from 'hooks/useAppSelector'

import {getCurrentUser} from 'state/currentUser/selectors'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'

import useQuickRepliesAlternativesLinks from './hooks/useQuickRepliesAlternativesLinks'

type Props = {
    integration: Map<any, any>
}

const GorgiasChatIntegrationQuickRepliesSunsetModal: React.FC<Props> = ({
    integration,
}) => {
    const currentUser = useAppSelector(getCurrentUser)
    const currentUserId = currentUser.get('id') as number

    const storageKey = `user:${currentUserId}:gorgias_chat_quick_replies_sunset_modal_acknowledged`

    const [isModalAcknowledged, setIsModalAcknowledged] =
        useLocalStorage<boolean>(storageKey, false)

    const [showModal, setShowModal] = useState(true)

    const isQuickRepliesSunsetModalEnabled =
        useFlags()[FeatureFlagKey.ChatQuickRepliesSunsetModal]

    const {
        showAlternatives,
        quickResponsesLink,
        flowsLink,
        installationTabLink,
    } = useQuickRepliesAlternativesLinks(integration)

    if (
        !isQuickRepliesSunsetModalEnabled ||
        !showAlternatives ||
        isModalAcknowledged
    ) {
        return null
    }

    return (
        <Modal
            isOpen={showModal}
            onClose={() => {
                setShowModal(false)
            }}
        >
            <ModalHeader title="We will sunset Quick Replies in early 2024" />
            <ModalBody>
                Quick Replies will not be available anymore after Q1 2024.{' '}
                <b>
                    You will still have access to{' '}
                    <a href={quickResponsesLink}>Quick Responses</a> and{' '}
                    <a href={flowsLink}>Flows</a> since you are subscribed to
                    Automate.
                </b>
                <br />
                <br />
                We advise you to use Quick Responses and Flows instead, as both
                will help you deflect more tickets than Quick Replies.{' '}
                {installationTabLink && (
                    <>Connect a store to this chat to get started.</>
                )}
            </ModalBody>
            <ModalActionsFooter>
                {installationTabLink ? (
                    <>
                        <Button
                            intent="secondary"
                            onClick={() => setShowModal(false)}
                            className="mr-2"
                        >
                            Dismiss
                        </Button>
                        <Button
                            onClick={() => history.push(installationTabLink)}
                        >
                            Connect Store
                        </Button>
                    </>
                ) : (
                    <Button
                        onClick={() => {
                            setShowModal(false)
                            setIsModalAcknowledged(true)
                        }}
                    >
                        I Understand
                    </Button>
                )}
            </ModalActionsFooter>
        </Modal>
    )
}

export default GorgiasChatIntegrationQuickRepliesSunsetModal
