import React, {useState} from 'react'

import classnames from 'classnames'
import {Button} from 'reactstrap'
import css from '../../settings.less'
import TwoFactorAuthenticationModal from './TwoFactorAuthenticationModal/TwoFactorAuthenticationModal'

export default function TwoFactorAuthenticationSection() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <div
                className={classnames('heading-subsection-semibold', css.mb16)}
            >
                Two-Factor Authentication
                <span className="badge badge-pill badge-danger ml-3 align-middle">
                    DISABLED
                </span>
            </div>
            <div className={classnames('body-regular', css.mb16)}>
                For an added layer of security, your admin requires you to use
                two-factor authentication (2FA) when you sign in to Gorgias.
                <a href={''}>Learn more</a>
            </div>

            <Button
                type="button"
                color="primary"
                onClick={() => setIsModalOpen(true)}
            >
                Enable Two-Factor Authentication
            </Button>
            <TwoFactorAuthenticationModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
            />
        </>
    )
}
