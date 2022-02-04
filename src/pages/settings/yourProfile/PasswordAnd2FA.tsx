import React, {useMemo} from 'react'
import {Container} from 'reactstrap'

import {useSelector} from 'react-redux'
import PageHeader from '../../common/components/PageHeader'
import css from '../settings.less'

import {getCurrentAccountState} from '../../../state/currentAccount/selectors'
import {getCurrentUserState} from '../../../state/currentUser/selectors'
import ChangePassword from './ChangePassword'
import TwoFactorAuthenticationSection from './twoFactorAuthentication/TwoFactorAuthenticationSection'
import {
    buildPasswordAnd2FaText,
    checkAccessTo2FA,
} from './twoFactorAuthentication/utils'

export default function PasswordAnd2FA() {
    const currentAccount = useSelector(getCurrentAccountState)
    const currentUser = useSelector(getCurrentUserState)

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
