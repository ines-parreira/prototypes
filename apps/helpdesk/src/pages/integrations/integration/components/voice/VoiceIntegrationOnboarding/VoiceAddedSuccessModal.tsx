import React, { useState } from 'react'

import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useSearchParam } from 'hooks/useSearchParam'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { assetsUrl } from 'utils'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import VoiceFlowPreview from '../flows/VoiceFlowPreview'
import { SUCCESSFUL_ONBOARDING_PARAM } from './constants'

import css from './VoiceAddedSuccessModal.less'

function VoiceAddedSuccessModal() {
    const [value, setSearchParam] = useSearchParam(SUCCESSFUL_ONBOARDING_PARAM)
    const integrationId = Number(value)

    const [isOpen, setIsOpen] = useState(!!value)

    const onClose = () => {
        setIsOpen(false)
        setSearchParam(null)
    }

    if (!integrationId) {
        return <></>
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={'large'}>
            <ModalHeader title={''} className={css.header} />
            <ModalBody className={css.body}>
                <div className={css.title}>
                    <span>
                        <img
                            alt="success icon"
                            src={assetsUrl('/img/icons/party-popper.png')}
                            width={24}
                        />{' '}
                        Great job!
                    </span>
                    <span>Your voice integration is ready.</span>
                </div>
                <VoiceFlowPreview integrationId={integrationId} />
                <div>
                    Use the <b>Call Flow Editor</b> to visually manage routing
                    logic, create multi-level IVR menus, apply queue-specific
                    schedules, configure fallback routes like overflow or
                    voicemail, and route calls based on customer fields.
                </div>
            </ModalBody>
            <ModalFooter className={css.footer}>
                <div className={css.buttonGroup}>
                    <Link
                        to={`${PHONE_INTEGRATION_BASE_URL}/${value}/preferences`}
                    >
                        <Button intent={'secondary'}>
                            Go To General Settings
                        </Button>
                    </Link>
                    <Link to={`${PHONE_INTEGRATION_BASE_URL}/${value}/flow`}>
                        <Button>Edit Call Flow</Button>
                    </Link>
                </div>
            </ModalFooter>
        </Modal>
    )
}

export default VoiceAddedSuccessModal
