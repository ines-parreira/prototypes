import React, {useMemo} from 'react'

import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'
import {getCurrentUserState} from 'state/currentUser/selectors'
import useAppSelector from 'hooks/useAppSelector'

import ChangePassword from './ChangePassword'
import TwoFactorAuthenticationSection from './twoFactorAuthentication/TwoFactorAuthenticationSection'
import {buildPasswordAnd2FaText} from './twoFactorAuthentication/utils'

export default function PasswordAnd2FA() {
    const currentUser = useAppSelector(getCurrentUserState)

    const hasPassword = useMemo(() => {
        return !!currentUser.get('has_password')
    }, [currentUser])

    const pageHeaderTitle = useMemo(() => {
        return buildPasswordAnd2FaText(hasPassword)
    }, [hasPassword])

    return (
        <div className="full-width">
            <PageHeader title={pageHeaderTitle} />
            <div className={css.pageContainer}>
                <div className={css.contentWrapper}>
                    {hasPassword && <ChangePassword />}
                    <TwoFactorAuthenticationSection />
                </div>
            </div>
        </div>
    )
}
