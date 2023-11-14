import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {isAdmin} from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import useGetConvertStatus, {
    BundleOnboardingStatus,
} from 'pages/settings/revenue/hooks/useGetConvertStatus'

type Props = {
    classes?: string
}

export const ConvertSetupBanner = ({classes}: Props): JSX.Element => {
    const currentUser = useAppSelector((state) => state.currentUser)

    const convertStatus = useGetConvertStatus()

    const isBundleNotInstalled = useMemo(
        () =>
            convertStatus &&
            convertStatus.bundle_status ===
                BundleOnboardingStatus.NOT_INSTALLED,
        [convertStatus]
    )

    const isButtonVisible = useMemo(
        () => isBundleNotInstalled && isAdmin(currentUser),
        [currentUser, isBundleNotInstalled]
    )

    if (!isBundleNotInstalled) return <></>

    return (
        <div className={classNames(classes)}>
            <Alert
                customActions={
                    isButtonVisible ? (
                        <div>
                            <Link
                                className="mr-3"
                                to={`/app/settings/convert/installations`}
                            >
                                Continue Setup
                            </Link>
                        </div>
                    ) : undefined
                }
                type={AlertType.Warning}
            >
                You have activated the Convert product, but for the campaigns to
                work properly, you need to finish setting it up.
            </Alert>
        </div>
    )
}

export default ConvertSetupBanner
