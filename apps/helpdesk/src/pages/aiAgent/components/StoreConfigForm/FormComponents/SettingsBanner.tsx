import React, { useState } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import Alert, { AlertType } from 'pages/common/components/Alert/Alert'

import type { SettingsBannerType } from '../constants'
import { BannerText } from '../constants'

import css from '../StoreConfigForm.less'

type SettingsBannerProps = {
    type: SettingsBannerType
    deactivatedDatetime?: string | null
}

export const SettingsBanner = ({
    deactivatedDatetime,
    type,
}: SettingsBannerProps) => {
    const initialValue = localStorage.getItem(
        `ai-settings-${type}-banner-acknowledged`,
    )
    const [bannerAcknowledge, setBannerAcknowledge] = useState(
        Boolean(initialValue),
    )

    return (
        <>
            {deactivatedDatetime && !bannerAcknowledge && (
                <Alert
                    className={css.storeConfigurationAlert}
                    icon
                    type={AlertType.Info}
                >
                    <div className={css.banner}>
                        {BannerText[type]}
                        <Button
                            size="small"
                            fillStyle="ghost"
                            className={css.callToActionButton}
                            onClick={() => {
                                localStorage.setItem(
                                    `ai-settings-${type}-banner-acknowledged`,
                                    'true',
                                )
                                setBannerAcknowledge(true)
                            }}
                        >
                            Got it
                        </Button>
                    </div>
                </Alert>
            )}
        </>
    )
}
