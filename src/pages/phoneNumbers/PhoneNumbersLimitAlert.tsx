import React from 'react'
import {Link} from 'react-router-dom'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

type Props = {
    maxPhoneNumbers: Maybe<number>
    currentPhoneNumbers: Maybe<number>
}

export default function PhoneNumbersLimitAlert({
    maxPhoneNumbers,
    currentPhoneNumbers,
}: Props): JSX.Element | null {
    if (
        typeof currentPhoneNumbers !== 'number' ||
        typeof maxPhoneNumbers !== 'number'
    ) {
        return null
    }

    const isLimitAlmostReached =
        maxPhoneNumbers > 1 && currentPhoneNumbers === maxPhoneNumbers - 1
    const isLimitReached = currentPhoneNumbers >= maxPhoneNumbers

    if (!isLimitAlmostReached && !isLimitReached) {
        return null
    }

    return (
        <Alert
            type={isLimitAlmostReached ? AlertType.Warning : AlertType.Error}
            className="mt-3"
            icon
        >
            <span className="d-flex align-items-center">
                You have reached {currentPhoneNumbers}/{maxPhoneNumbers} phone
                numbers. To add more, you must
                <Link to="/app/settings/billing/plans" className="ml-1 mr-1">
                    upgrade
                </Link>
                to a higher plan.
            </span>
        </Alert>
    )
}
