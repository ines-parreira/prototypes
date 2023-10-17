import React, {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {isAdmin} from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import {hasConvertBundleInstalled} from 'pages/settings/revenue/utils/hasConvertBundleInstalled'

type Props = {
    classes?: string
}

export const SetupConvertBanner = ({classes}: Props): JSX.Element => {
    const isConvertSubscriber = useIsConvertSubscriber()
    const currentUser = useAppSelector((state) => state.currentUser)

    const [hasBundleInstalled, setBundleInstalled] = useState<boolean | null>(
        null
    )

    useEffect(() => {
        if (isConvertSubscriber && hasBundleInstalled === null) {
            void (async () => {
                setBundleInstalled(await hasConvertBundleInstalled())
            })()
        }
    }, [isConvertSubscriber, hasBundleInstalled])

    const isVisible = useMemo(
        () => isConvertSubscriber && hasBundleInstalled === false,
        [hasBundleInstalled, isConvertSubscriber]
    )

    const isButtonVisible = useMemo(
        () => isVisible && isAdmin(currentUser),
        [isVisible, currentUser]
    )

    if (!isVisible) return <></>

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

export default SetupConvertBanner
