import React, {useEffect, useState, useMemo} from 'react'
import {Label} from 'reactstrap'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import {Map} from 'immutable'
import {useAsyncFn} from 'react-use'

import ToggleButton from '../../../../common/components/ToggleButton'

import {HelpCenter} from '../../../../../models/helpCenter/types'

import {fetchSelfServiceConfiguration} from '../../../../../models/selfServiceConfiguration/resources'

import css from './SelfServiceSection.less'

interface Props {
    helpCenter: HelpCenter
    updateHelpCenter: (payload: Partial<HelpCenter>) => Promise<void>
    updating: boolean
    shopifyIntegration: Map<any, any> | undefined
}

export const SelfServiceSection = ({
    helpCenter,
    updateHelpCenter,
    updating,
    shopifyIntegration,
}: Props): JSX.Element | null => {
    const [sspForceDisabled, setSspForceDisabled] = useState(
        !helpCenter.shop_name
    )

    const [selfServiceEnabled, setSelfServiceEnabled] = useState(
        helpCenter.self_service_enabled
    )

    const [{loading}, fetchGlobalSsp] = useAsyncFn(async () => {
        if (shopifyIntegration !== undefined && helpCenter.shop_name) {
            try {
                const shopifyIntegrationId: number =
                    shopifyIntegration.get('id')

                const {deactivated_datetime} =
                    await fetchSelfServiceConfiguration(
                        `${shopifyIntegrationId}`
                    )

                const sspGloballyDeactivated =
                    deactivated_datetime !== null &&
                    deactivated_datetime !== undefined

                setSspForceDisabled(
                    sspGloballyDeactivated || !helpCenter.shop_name
                )
            } catch (e) {
                console.error(e)
            }
        }
    }, [])

    useEffect(() => void fetchGlobalSsp(), [fetchGlobalSsp])

    const handleOnChangeSwitch = () => {
        if (helpCenter.shop_name && !sspForceDisabled) {
            setSelfServiceEnabled(!selfServiceEnabled)
            void updateHelpCenter({self_service_enabled: !selfServiceEnabled})
        }
    }

    const isSwitchDisabled = useMemo(() => {
        return updating || loading || sspForceDisabled
    }, [updating, loading, sspForceDisabled])

    return (
        <section>
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
                <ToggleButton
                    value={selfServiceEnabled}
                    disabled={isSwitchDisabled}
                    onChange={handleOnChangeSwitch}
                />
                <Label
                    className="control-label ml-2 clickable"
                    onClick={handleOnChangeSwitch}
                >
                    <p
                        className={classNames(
                            css['enable-self-service-label'],
                            sspForceDisabled ? css['force-disabled'] : undefined
                        )}
                    >
                        Enable self-service for this Help Center
                    </p>
                    {helpCenter.shop_name ? null : (
                        <p
                            className={classNames(
                                css['connect-shopify-shop-hint'],
                                sspForceDisabled
                                    ? css['force-disabled']
                                    : undefined
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
