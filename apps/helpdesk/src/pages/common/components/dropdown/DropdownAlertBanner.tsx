import { useEffect } from 'react'

import { useTimeout } from '@repo/hooks'

import type { BannerType } from '@gorgias/axiom'
import { Banner } from '@gorgias/axiom'

import css from './DropdownAlertBanner.less'

const DEFAULT_DISMISS_DURATION = 5000

export type AlertBannerData = {
    message: string
    type: BannerType
}

type Props = {
    data: AlertBannerData | null
    onClear: () => void
    autoDismiss?: boolean
    autoDismissDuration?: number
}

export const DropdownAlertBanner = ({
    data,
    onClear,
    autoDismiss = false,
    autoDismissDuration = DEFAULT_DISMISS_DURATION,
}: Props) => {
    const [setTimeout, clearTimeout] = useTimeout()

    const clearData = () => {
        clearTimeout()
        onClear()
    }

    useEffect(() => {
        if (data && autoDismiss && autoDismissDuration > 0) {
            setTimeout(() => {
                onClear()
            }, autoDismissDuration)
        }
        return () => clearTimeout()
    }, [
        data,
        autoDismiss,
        autoDismissDuration,
        onClear,
        setTimeout,
        clearTimeout,
    ])

    return (
        <div className={css.container}>
            {data && (
                <div onClick={clearData}>
                    <Banner
                        variant="inline"
                        icon
                        type={data.type}
                        className={css.alertBanner}
                    >
                        {data.message}
                    </Banner>
                </div>
            )}
        </div>
    )
}

export default DropdownAlertBanner
