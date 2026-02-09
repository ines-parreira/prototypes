import type React from 'react'
import { useState } from 'react'

import { history } from '@repo/routing'
import { useLocation } from 'react-router-dom'

import SuccessModalRevamped from './SuccessModal'
import type SuccessModal from './SuccessModal'

export enum NavigatedSuccessModalNameRevamped {
    GorgiasChatManualInstallation = 'gorgias-chat-manual-installation',
    GorgiasChatAutoInstallation = 'gorgias-chat-auto-installation',
    ConvertOnboarding = 'convert-onboarding',
}

export type NavigatedSuccessModalLocationState = {
    showModal?: NavigatedSuccessModalNameRevamped
}

type Props = {
    name: NavigatedSuccessModalNameRevamped
} & Omit<React.ComponentProps<typeof SuccessModal>, 'isOpen' | 'onClose'>

const NavigatedSuccessModal: React.FC<Props> = ({ name, ...props }) => {
    const { pathname, state } =
        useLocation<NavigatedSuccessModalLocationState | null>()

    const [isOpen, setIsOpen] = useState(state?.showModal === name)

    const onClose = () => {
        history.replace(pathname, { ...state, showModal: undefined })
        setIsOpen(false)
    }

    return <SuccessModalRevamped {...props} isOpen={isOpen} onClose={onClose} />
}

export default NavigatedSuccessModal
