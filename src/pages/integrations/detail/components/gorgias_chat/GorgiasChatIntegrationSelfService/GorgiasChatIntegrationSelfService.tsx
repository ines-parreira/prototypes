import React, {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {fromJS, Map} from 'immutable'
import {Breadcrumb, BreadcrumbItem, Container, Label} from 'reactstrap'
import {useSelector} from 'react-redux'
import {useAsyncFn} from 'react-use'
import classnames from 'classnames'

import PageHeader from '../../../../../common/components/PageHeader'
import {getIntegrations} from '../../../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../../../models/integration/types'
import {fetchSelfServiceConfiguration} from '../../../../../../models/selfServiceConfiguration/resources'
import ToggleButton from '../../../../../common/components/ToggleButton'
import {updateOrCreateIntegration} from '../../../../../../state/integrations/actions'
import useAppDispatch from '../../../../../../hooks/useAppDispatch'
import Tooltip from '../../../../../common/components/Tooltip'
import settingsCss from '../../../../../settings/settings.less'
import ChatIntegrationNavigation from '../GorgiasChatIntegrationNavigation'

import css from './GorgiasChatIntegrationSelfService.less'

type OwnProps = {
    integration: Map<any, any>
}

export function GorgiasChatIntegrationSelfServiceComponent({
    integration,
}: OwnProps) {
    const integrationType: string = integration.get('type')
    const dispatch = useAppDispatch()

    const shopName: string | undefined | null = integration.getIn([
        'meta',
        'shop_name',
    ])

    const originalSSPEnabled: boolean = useMemo(() => {
        const sspDeactivatedDatetime: string | undefined | null =
            integration.getIn(['meta', 'self_service_deactivated_datetime'])

        return (
            sspDeactivatedDatetime === null ||
            sspDeactivatedDatetime === undefined
        )
    }, [integration])

    const [sspForceDisabled, setSspForceDisabled] = useState(!shopName)

    const [{loading: updating}, updateChatSSP] = useAsyncFn(
        async (sspEnabled: boolean) => {
            const oldMeta: Map<any, any> = integration.get('meta')

            const updatePayload = fromJS({
                ...integration.toJS(),
                meta: {
                    ...(oldMeta?.toJS() || {}),
                    self_service_deactivated_datetime: sspEnabled
                        ? null
                        : new Date().toISOString(),
                },
            })

            await dispatch(updateOrCreateIntegration(updatePayload))
        },
        [integration]
    )

    const integrations = useSelector(getIntegrations)

    const shopifyIntegration: Map<any, any> | undefined = integrations.find(
        (shopifyIntegration: Map<any, any>) => {
            return (
                shopifyIntegration.get('type') === IntegrationType.Shopify &&
                shopName ===
                    shopifyIntegration.getIn(['meta', 'shop_name'], null)
            )
        }
    )

    const [{loading}, fetchGlobalSsp] = useAsyncFn(async () => {
        if (shopifyIntegration !== undefined && shopName) {
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

                setSspForceDisabled(sspGloballyDeactivated || !shopName)
            } catch (e) {
                console.error(e)
            }
        }
    }, [shopifyIntegration, shopName])

    useEffect(() => void fetchGlobalSsp(), [fetchGlobalSsp])

    const handleOnChangeSwitch = () => {
        if (!sspForceDisabled) {
            void updateChatSSP(!originalSSPEnabled)
        }
    }

    const isSwitchDisabled = useMemo(() => {
        return updating || loading || sspForceDisabled
    }, [updating, loading, sspForceDisabled])

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">
                                Integrations
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/integrations/${integrationType}`}
                            >
                                Chat
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.get('name')}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <ChatIntegrationNavigation integration={integration} />

            <Container fluid className={settingsCss.pageContainer}>
                <h4>Enable Self-service</h4>
                <p>
                    Enabling{' '}
                    <Link to="/app/settings/self-service">self-service</Link>{' '}
                    will let your customers track their orders, request a return
                    or cancellation and report issues they might have with an
                    order. It will then create a chat ticket for your team.
                </p>
                <div className="d-flex my-4">
                    <span id="toggle-button">
                        <ToggleButton
                            value={originalSSPEnabled}
                            disabled={isSwitchDisabled}
                            onChange={handleOnChangeSwitch}
                        />
                    </span>
                    {sspForceDisabled ? (
                        <Tooltip
                            autohide={false}
                            placement="top"
                            delay={{show: 200, hide: 300}}
                            target="toggle-button"
                            style={{
                                textAlign: 'left',
                                width: 220,
                            }}
                        >
                            Self-service must be first enabled for this store
                            before you can enable it for this chat integration.
                            <br />
                            <Link to="/app/settings/self-service">
                                Click here to enable.
                            </Link>
                        </Tooltip>
                    ) : null}
                    <Label
                        className="control-label ml-2"
                        onClick={handleOnChangeSwitch}
                    >
                        <p
                            className={classnames(
                                css['enable-self-service-label'],
                                sspForceDisabled
                                    ? css['force-disabled']
                                    : undefined
                            )}
                        >
                            Enable self-service for this chat
                        </p>
                    </Label>
                </div>
            </Container>
        </div>
    )
}

export default GorgiasChatIntegrationSelfServiceComponent
