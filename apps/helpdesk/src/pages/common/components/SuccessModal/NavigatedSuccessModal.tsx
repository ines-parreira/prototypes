import type React from 'react'
import { useState } from 'react'

import { history } from '@repo/routing'
import { useLocation } from 'react-router-dom'

import SuccessModal from './SuccessModal'

export enum NavigatedSuccessModalName {
    GorgiasChatManualInstallation = 'gorgias-chat-manual-installation',
    GorgiasChatAutoInstallation = 'gorgias-chat-auto-installation',
    ConvertOnboarding = 'convert-onboarding',
}

export type NavigatedSuccessModalLocationState = {
    showModal?: NavigatedSuccessModalName
}

type Props = {
    name: NavigatedSuccessModalName
} & Omit<React.ComponentProps<typeof SuccessModal>, 'isOpen' | 'onClose'>

const NavigatedSuccessModal: React.FC<Props> = ({ name, ...props }) => {
    const { pathname, state } =
        useLocation<NavigatedSuccessModalLocationState | null>()

    const [isOpen, setIsOpen] = useState(state?.showModal === name)

    const onClose = () => {
        history.replace(pathname, { ...state, showModal: undefined })
        setIsOpen(false)
    }

    return <SuccessModal {...props} isOpen={isOpen} onClose={onClose} />
}

export default NavigatedSuccessModal
