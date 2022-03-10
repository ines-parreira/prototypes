import React, {useMemo} from 'react'
import {Container} from 'reactstrap'

import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getCurrentUserState} from 'state/currentUser/selectors'
import useAppSelector from 'hooks/useAppSelector'

import ChangePassword from './ChangePassword'
import TwoFactorAuthenticationSection from './twoFactorAuthentication/TwoFactorAuthenticationSection'
import {
    buildPasswordAnd2FaText,
    checkAccessTo2FA,
} from './twoFactorAuthentication/utils'

export default function PasswordAnd2FA() {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUserState)

    const hasPassword = useMemo(() => {
        return !!currentUser.get('has_password')
    }, [currentUser])

    const hasAccessTo2FA = useMemo(() => {
        return checkAccessTo2FA(currentAccount.get('domain'))
    }, [currentAccount])

    const pageHeaderTitle = useMemo(() => {
        return buildPasswordAnd2FaText(hasPassword, hasAccessTo2FA)
    }, [hasPassword, hasAccessTo2FA])

    return (
        <div className="full-width">
            <PageHeader title={pageHeaderTitle} />
            <Container fluid className={css.pageContainer}>
                <div className={css.contentWrapper}>
                    {hasPassword && <ChangePassword />}
                    {hasAccessTo2FA && <TwoFactorAuthenticationSection />}
                </div>
            </Container>
        </div>
    )
}
