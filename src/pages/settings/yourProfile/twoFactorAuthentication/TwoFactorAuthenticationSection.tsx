import React, {useState} from 'react'
import classnames from 'classnames'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Button from 'pages/common/components/button/Button'
import css from 'pages/settings/settings.less'
import TwoFactorAuthenticationModal from './TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'

export default function TwoFactorAuthenticationSection() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <div
                className={classnames('heading-subsection-semibold', css.mb16)}
            >
                Two-Factor Authentication
                <Badge className="ml-3 " type={ColorType.Error}>
                    Disabled
                </Badge>
            </div>
            <div className={classnames('body-regular', css.mb16)}>
                For an added layer of security, your admin requires you to use
                two-factor authentication (2FA) when you sign in to Gorgias.
                <a href={''}> Learn more</a>
            </div>

            <Button type="button" onClick={() => setIsModalOpen(true)}>
                Enable Two-Factor Authentication
            </Button>
            <TwoFactorAuthenticationModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
            />
        </>
    )
}
