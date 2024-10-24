import React, {useCallback, useMemo} from 'react'
import {useHistory} from 'react-router-dom'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'
import {getCurrentUserState} from 'state/currentUser/selectors'

import ChangePassword from './ChangePassword'
import TwoFactorAuthenticationSection from './twoFactorAuthentication/TwoFactorAuthenticationSection'
import {buildPasswordAnd2FaText} from './twoFactorAuthentication/utils'
import {isRecentLogin} from './utils'

export default function PasswordAnd2FA() {
    const currentUser = useAppSelector(getCurrentUserState)
    const requireRecentLogin = useFlag(
        FeatureFlagKey.Setup2FAWithRecentLoginInsteadOfPassword,
        false
    )

    const hasPassword = useMemo(() => {
        return !!currentUser.get('has_password')
    }, [currentUser])

    const pageHeaderTitle = useMemo(() => {
        return buildPasswordAnd2FaText(hasPassword)
    }, [hasPassword])

    const requireLogin = requireRecentLogin && !isRecentLogin()

    const history = useHistory()
    const onModalBack = useCallback(() => {
        history.goBack()
    }, [history])

    const onModalContinue = () => {
        const next = window.location.pathname + window.location.search
        window.location.href = '/login/fresh?next=' + encodeURIComponent(next)
    }

    return (
        <div className="full-width">
            <PageHeader title={pageHeaderTitle} />
            <div className={css.pageContainer}>
                <div className={css.contentWrapper}>
                    {hasPassword && <ChangePassword />}
                    <TwoFactorAuthenticationSection />
                </div>
            </div>

            <Modal isOpen={requireLogin} isClosable={false} onClose={() => {}}>
                <ModalHeader title="Verify Your Identity" />
                <ModalBody>
                    <p>
                        For security, please verify your identity to continue to
                        the Password & 2FA Page.
                    </p>
                </ModalBody>
                <ModalActionsFooter>
                    <Button intent="secondary" onClick={onModalBack}>
                        Back
                    </Button>
                    <Button intent="primary" onClick={onModalContinue}>
                        Continue
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </div>
    )
}
