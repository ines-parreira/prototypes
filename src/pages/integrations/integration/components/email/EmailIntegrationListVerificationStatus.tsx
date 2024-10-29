import {Tooltip} from '@gorgias/ui-kit'
import classNames from 'classnames'
import React from 'react'

import useId from 'hooks/useId'
import Button from 'pages/common/components/button/Button'

type Props = {
    active: boolean
    isGmail: boolean
    isOutlook: boolean
    isVerified: boolean
    isRowSubmitting: boolean
    redirectURI?: string
    isDomainVerificationWarningVisible: boolean
    isDomainVerificationWarningGmailOutlookVisible: boolean
    isOutboundVerificationWarningVisible: boolean
}

export default function EmailIntegrationListVerificationStatus({
    active,
    isGmail,
    isOutlook,
    isVerified,
    isRowSubmitting,
    redirectURI,
    isDomainVerificationWarningVisible,
    isDomainVerificationWarningGmailOutlookVisible,
    isOutboundVerificationWarningVisible,
}: Props) {
    const id = useId()
    const buttonId = `reconnect-button-${id}`

    return (
        <div>
            {!active && (isGmail || isOutlook) && (
                <>
                    <Button
                        id={buttonId}
                        type="submit"
                        color="ghost"
                        fillStyle="ghost"
                        isLoading={isRowSubmitting}
                        onClick={(e) => {
                            e.preventDefault()
                            window.open(redirectURI)
                        }}
                    >
                        Reconnect
                    </Button>
                    <Tooltip placement="top-end" target={buttonId}>
                        Login credentials required to reconnect email
                    </Tooltip>
                </>
            )}
            {!isGmail && !isOutlook && !isVerified && (
                <div>
                    <i className={classNames('material-icons mr-2 red')}>
                        cancel
                    </i>
                    Not verified
                </div>
            )}
            {(isDomainVerificationWarningVisible ||
                isDomainVerificationWarningGmailOutlookVisible) && (
                <div>
                    <i className={classNames('material-icons mr-2 orange')}>
                        warning
                    </i>
                    Pending domain verification
                </div>
            )}
            {isOutboundVerificationWarningVisible && (
                <div>
                    <i className={classNames('material-icons mr-2 orange')}>
                        warning
                    </i>
                    Pending outbound verification
                </div>
            )}
        </div>
    )
}
