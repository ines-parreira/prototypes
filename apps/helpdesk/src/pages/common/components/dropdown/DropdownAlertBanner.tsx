import { useEffect } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useTimeout } from '@repo/hooks'

import type { LegacyBannerType as BannerType } from '@gorgias/axiom'
import { LegacyBanner as Banner } from '@gorgias/axiom'

import css from './DropdownAlertBanner.less'

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

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Banner />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
export const DropdownAlertBanner = ({
    data,
    onClear,
    autoDismiss = false,
    autoDismissDuration = Duration.seconds(5),
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
