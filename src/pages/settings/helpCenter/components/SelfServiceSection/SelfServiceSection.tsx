import React, {useEffect, useState} from 'react'
import {Label} from 'reactstrap'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Map} from 'immutable'
import {useAsyncFn} from 'react-use'

import settingsCss from 'pages/settings/settings.less'
import ToggleInput from '../../../../common/forms/ToggleInput'

import {
    HelpCenter,
    UpdateHelpCenterDto,
} from '../../../../../models/helpCenter/types'

import {fetchSelfServiceConfiguration} from '../../../../../models/selfServiceConfiguration/resources'

import css from './SelfServiceSection.less'

interface Props {
    helpCenter: HelpCenter
    updateHelpCenter: (payload: Partial<UpdateHelpCenterDto>) => Promise<void>
    updating: boolean
    shopifyIntegration: Map<any, any> | undefined
}

export const SelfServiceSection = ({
    helpCenter,
    updateHelpCenter,
    updating,
    shopifyIntegration,
}: Props): JSX.Element | null => {
    const [sspShopState, setSspShopState] = useState<
        'no_shop_integration' | 'shop_ssp_disabled' | 'shop_ssp_enabled'
    >(helpCenter.shop_name ? 'shop_ssp_enabled' : 'no_shop_integration')

    const [selfServiceDeactivated, setSelfServiceDeactivated] = useState(
        helpCenter.self_service_deactivated_datetime !== null
    )

    const [{loading}, fetchGlobalSsp] = useAsyncFn(async () => {
        if (shopifyIntegration && helpCenter.shop_name) {
            try {
                const shopifyIntegrationId: number =
                    shopifyIntegration.get('id')

                const {deactivated_datetime} =
                    await fetchSelfServiceConfiguration(
                        `${shopifyIntegrationId}`
                    )

                setSspShopState(
                    deactivated_datetime
                        ? 'shop_ssp_disabled'
                        : 'shop_ssp_enabled'
                )
            } catch (e) {
                console.error(e)
            }
        }
    }, [])

    useEffect(() => void fetchGlobalSsp(), [fetchGlobalSsp])

    const handleOnChangeSwitch = () => {
        if (sspShopState === 'shop_ssp_enabled') {
            setSelfServiceDeactivated(!selfServiceDeactivated)
            void updateHelpCenter({
                self_service_deactivated: !selfServiceDeactivated,
            })
        }
    }

    const isSwitchDisabled =
        updating || loading || sspShopState !== 'shop_ssp_enabled'

    return (
        <section className={settingsCss.mb40}>
            <div className={css.heading}>
                <h3>Enable Self-service</h3>
                <p>
                    Enabling{' '}
                    <Link to="/app/settings/self-service">self-service</Link>{' '}
                    will let your customers track their orders, request a return
                    or cancellation and report issues they might have with an
                    order. It will then create an email ticket for your team.
                </p>
            </div>

            <div className="d-flex mt-4">
                <ToggleInput
                    isToggled={!selfServiceDeactivated}
                    isDisabled={isSwitchDisabled}
                    onClick={handleOnChangeSwitch}
                />
                <Label
                    className="control-label ml-2 clickable"
                    onClick={handleOnChangeSwitch}
                >
                    <p
                        className={classnames(
                            css['enable-self-service-label'],
                            sspShopState === 'shop_ssp_enabled'
                                ? undefined
                                : css['force-disabled']
                        )}
                    >
                        Enable self-service for this Help Center
                    </p>

                    {sspShopState === 'shop_ssp_disabled' && (
                        <p
                            className={classnames(
                                css['connect-shopify-shop-hint'],
                                css['force-disabled']
                            )}
                        >
                            <Link to={'/app/settings/self-service'}>
                                Enable Self-service
                            </Link>{' '}
                            at the store level to enable self-service for the
                            Help Center.
                        </p>
                    )}

                    {sspShopState === 'no_shop_integration' && (
                        <p
                            className={classnames(
                                css['connect-shopify-shop-hint']
                            )}
                        >
                            <Link
                                to={`/app/settings/help-center/${helpCenter.id}/installation`}
                            >
                                Connect a Shopify store
                            </Link>{' '}
                            to enable self-service for this Help Center.
                        </p>
                    )}
                </Label>
            </div>
        </section>
    )
}

export default SelfServiceSection
