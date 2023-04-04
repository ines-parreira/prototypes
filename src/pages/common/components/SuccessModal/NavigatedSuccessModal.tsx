import React, {useState} from 'react'

import {useLocation} from 'react-router-dom'

import history from 'pages/history'

import SuccessModal from './SuccessModal'

export enum NavigatedSuccessModalName {
    GorgiasChatManualInstallation = 'gorgias-chat-manual-installation',
    GorgiasChatAutoInstallation = 'gorgias-chat-auto-installation',
}

export type NavigatedSuccessModalLocationState = {
    showModal?: NavigatedSuccessModalName
}

type Props = {
    name: NavigatedSuccessModalName
} & Omit<React.ComponentProps<typeof SuccessModal>, 'isOpen' | 'onClose'>

const NavigatedSuccessModal: React.FC<Props> = ({name, ...props}) => {
    const {pathname, state} =
        useLocation<NavigatedSuccessModalLocationState | null>()

    const [isOpen, setIsOpen] = useState(state?.showModal === name)

    const onClose = () => {
        history.replace(pathname, {...state, showModal: undefined})
        setIsOpen(false)
    }

    return <SuccessModal {...props} isOpen={isOpen} onClose={onClose} />
}

export default NavigatedSuccessModal
