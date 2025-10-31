import { useCallback, useRef } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import {
    LegacyButton as Button,
    Label,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    EmailIntegration,
    GmailIntegration,
    OutlookIntegration,
} from 'models/integration/types'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import { submitSetting } from 'state/currentAccount/actions'
import { getDefaultIntegrationSettings } from 'state/currentAccount/selectors'
import { AccountSettingType } from 'state/currentAccount/types'

import DefaultIntegrationBadge from '../DefaultIntegrationBadge'

import css from './EmailIntegrationAddressField.less'

type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
}

function EmailIntegrationAddressField({ integration }: Props) {
    const isDefaultAddressFeatureEnabled = useFlag(
        FeatureFlagKey.DefaultEmailAddress,
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
                    ...currentSetting?.data,
                    email: integration.id,
                },
            }),
        )
    }, [currentSetting, dispatch, integration.id])

    if (!isDefaultAddressFeatureEnabled) {
        return null
    }

    const address = integration.meta?.address ?? ''
    const isDefault = currentSetting?.data?.email === integration.id

    return (
        <>
            <Label>Email</Label>
            <div className={css.fieldValue}>
                <input className={css.address} value={address} disabled />

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
