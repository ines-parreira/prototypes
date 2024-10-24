import {Label, Tooltip} from '@gorgias/ui-kit'
import React, {useCallback, useRef} from 'react'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    EmailIntegration,
    GmailIntegration,
    OutlookIntegration,
} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {submitSetting} from 'state/currentAccount/actions'
import {getDefaultIntegrationSettings} from 'state/currentAccount/selectors'
import {AccountSettingType} from 'state/currentAccount/types'

import DefaultIntegrationBadge from '../DefaultIntegrationBadge'

import css from './EmailIntegrationAddressField.less'

type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
}

function EmailIntegrationAddressField({integration}: Props) {
    const isDefaultAddressFeatureEnabled = useFlag(
        FeatureFlagKey.DefaultEmailAddress,
        false
    )
    const buttonRef = useRef<HTMLButtonElement>(null)
    const dispatch = useAppDispatch()
    const currentSetting = useAppSelector(getDefaultIntegrationSettings)

    const handleUpdate = useCallback(() => {
        void dispatch(
            submitSetting({
                id: currentSetting?.id,
                type: AccountSettingType.DefaultIntegration,
                data: {
                    ...(currentSetting?.data ?? {}),
                    email: integration.id,
                },
            })
        )
    }, [currentSetting, dispatch, integration.id])

    if (!isDefaultAddressFeatureEnabled) {
        return null
    }

    const address = integration.meta?.address ?? ''
    const isDefault = currentSetting?.data?.email === integration.id

    return (
        <>
            <Label>Email Address</Label>
            <div className={css.fieldValue}>
                <span className={css.address}>{address}</span>
                {isDefault ? (
                    <DefaultIntegrationBadge />
                ) : (
                    <>
                        <Button
                            ref={buttonRef}
                            fillStyle="ghost"
                            onClick={handleUpdate}
                        >
                            <ButtonIconLabel
                                icon="check_circle_outline"
                                iconClassName="material-icons-outlined"
                            >
                                Set As Default
                            </ButtonIconLabel>
                        </Button>
                        <Tooltip target={buttonRef}>
                            Set this email address as your default when creating
                            email tickets or switching to the email channel.
                        </Tooltip>
                    </>
                )}
            </div>
        </>
    )
}

export default EmailIntegrationAddressField
