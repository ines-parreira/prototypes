import React, {useEffect, useReducer} from 'react'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    Row,
    Table,
    Alert,
} from 'reactstrap'

import classnames from 'classnames'

import PageHeader from '../../../../common/components/PageHeader'
import {updateOrCreateIntegration} from '../../../../../state/integrations/actions'
import ToggleButton from '../../../../common/components/ToggleButton.js'
import {getIconFromUrl} from '../../../../../state/integrations/helpers'

import {RootState} from '../../../../../state/types'
import {getIntegrationsByTypes} from '../../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../../models/integration/types'

import ChatIntegrationNavigation from './GorgiasChatIntegrationNavigation.js'

type OwnProps = {
    integration: Map<any, any>
    shopifyIntegrations: Immutable.List<any>
}

const selfServiceMock = getIconFromUrl('integrations/self_service_mock.png')
const SHOPIFY_DOMAIN_SUFFIX = '.myshopify.com'

interface SelfServiceConfiguration {
    base_url: string
    enabled: boolean
    integration_id: number[]
}

const initialState = {
    isUpdating: false,
    isInitialized: false,
    outdatedSSPEnabled: false,
}

type ActionTypes =
    | {type: 'toggle'; shopDomain: string}
    | {type: 'ready'}
    | {type: 'updating'}
    | {type: 'updated'}
type States = typeof initialState

function reducer(state: States, action: ActionTypes): States {
    switch (action.type) {
        case 'updating':
            return {
                ...state,
                isUpdating: true,
            }
        case 'updated':
            return {
                ...state,
                isUpdating: false,
            }
        case 'ready':
            return {
                ...state,
                isInitialized: true,
            }
        default:
            throw new Error()
    }
}

export function GorgiasChatIntegrationSelfServiceComponent({
    updateOrCreateIntegration,
    integration,
    shopifyIntegrations,
}: OwnProps & ConnectedProps<typeof connector>) {
    const shopDomains = shopifyIntegrations
        .map(
            (integration: Map<any, any>) =>
                integration.getIn(['meta', 'shop_domain']) as string
        )
        .toArray()
        .filter((shop_domain: string) =>
            shop_domain.includes(SHOPIFY_DOMAIN_SUFFIX)
        )
    const [states, dispatch] = useReducer(reducer, initialState)
    const {isUpdating, isInitialized} = states

    const initState = () => {
        dispatch({type: 'ready'})
    }

    useEffect(() => {
        if (!integration.isEmpty() && !isInitialized) {
            initState()
        }
    }, [initState, integration, isInitialized])

    const onToggleSelfService = async (toggledShopDomain: string) => {
        dispatch({type: 'updating'})

        const existingMeta: Map<any, any> =
            integration.get('meta') || fromJS({})

        const isEnabledOutdatedField = !!integration.getIn([
            'meta',
            'self_service',
            'enabled',
        ])

        const previousConfigurations = integration.getIn(
            ['meta', 'self_service', 'configurations'],
            []
        ) as Immutable.List<Map<any, any>>

        const newMeta = existingMeta.set(
            'self_service',
            fromJS({
                enabled: false, // need to explicitly set it to false since it's being replaced by the new config
                configurations: shopDomains.map((shopDomain) => {
                    // find the previous configuration if it exists
                    const previousConfig = previousConfigurations.find(
                        (config) => config?.get('base_url') === shopDomain
                    )
                    const isEnabled = previousConfig
                        ? previousConfig.get('enabled')
                        : isEnabledOutdatedField
                    const shopifyIntegration = shopifyIntegrations.find(
                        (shopInt: Map<any, any>) => {
                            return (
                                shopInt.getIn(['meta', 'shop_domain']) ===
                                shopDomain
                            )
                        }
                    ) as Map<any, any>

                    return {
                        base_url: shopDomain,
                        integration_id: shopifyIntegration.get('id'),
                        enabled: !shopDomain.includes(SHOPIFY_DOMAIN_SUFFIX)
                            ? false
                            : shopDomain === toggledShopDomain
                            ? !isEnabled
                            : isEnabled,
                    } as SelfServiceConfiguration
                }),
            })
        )

        const payload: Map<any, any> = fromJS({
            id: integration.get('id'),
            meta: newMeta,
        })

        try {
            await updateOrCreateIntegration(payload)
        } finally {
            dispatch({type: 'updated'})
        }
    }

    const integrationType: string = integration.get('type')

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
                        <BreadcrumbItem active>Self-service</BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <ChatIntegrationNavigation integration={integration} />

            <Container fluid className="page-container">
                <Row>
                    <Col>
                        <div className="mb-4">
                            <h4>Self-service</h4>
                            <p>
                                Most e-commerce support requests are about the
                                same 20 types of issues.
                                <br />
                                <br />
                                Self-service enables your customers to browse
                                their orders and select the type of issue they
                                are having. It will create a chat ticket for
                                your team to handle.
                            </p>
                        </div>

                        {shopDomains.length === 0 ? (
                            <Alert color="warning">
                                No active Shopify store detected. Please make
                                sure to add a Shopify store integration to
                                enable the Self-service features.
                            </Alert>
                        ) : (
                            <>
                                <h5>Enable Self-service</h5>
                                <Table
                                    className="table-integrations mt-3"
                                    hover
                                >
                                    <tbody>
                                        {shopifyIntegrations.map(
                                            (
                                                shopifyIntegration: Map<
                                                    any,
                                                    any
                                                >
                                            ) => {
                                                const shopDomain = shopifyIntegration.getIn(
                                                    ['meta', 'shop_domain']
                                                ) as string

                                                if (
                                                    !shopDomain.includes(
                                                        SHOPIFY_DOMAIN_SUFFIX
                                                    )
                                                ) {
                                                    return null
                                                }

                                                const isEnabledOutdatedField = !!integration.getIn(
                                                    [
                                                        'meta',
                                                        'self_service',
                                                        'enabled',
                                                    ]
                                                )

                                                const configurations = integration.getIn(
                                                    [
                                                        'meta',
                                                        'self_service',
                                                        'configurations',
                                                    ],
                                                    []
                                                ) as Immutable.List<any>
                                                const previousConfig: Map<
                                                    any,
                                                    any
                                                > = configurations.find(
                                                    (config: Map<any, any>) =>
                                                        config.get(
                                                            'base_url'
                                                        ) === shopDomain
                                                )
                                                const isEnabled = previousConfig
                                                    ? previousConfig.get(
                                                          'enabled'
                                                      )
                                                    : isEnabledOutdatedField

                                                // display only real shopify stores
                                                const toggleValue = shopDomain.includes(
                                                    SHOPIFY_DOMAIN_SUFFIX
                                                )
                                                    ? isEnabled
                                                    : false

                                                return (
                                                    <tr
                                                        key={shopifyIntegration.get(
                                                            'id'
                                                        )}
                                                    >
                                                        <td className="pl-0">
                                                            <b>
                                                                {shopifyIntegration.get(
                                                                    'name'
                                                                )}
                                                            </b>
                                                        </td>
                                                        <td className="smallest align-middle">
                                                            <ToggleButton
                                                                className={classnames(
                                                                    {
                                                                        'btn-loading': isUpdating,
                                                                    }
                                                                )}
                                                                disabled={
                                                                    isUpdating
                                                                }
                                                                label={`Enable Self-service for ${shopDomain}`}
                                                                value={
                                                                    toggleValue
                                                                }
                                                                onChange={() =>
                                                                    onToggleSelfService(
                                                                        shopDomain
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        )}
                                    </tbody>
                                </Table>
                            </>
                        )}
                    </Col>

                    <Col>
                        <img src={selfServiceMock} alt="Self-service Mock" />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

const mapStateToProps = (state: RootState) => {
    return {
        shopifyIntegrations: getIntegrationsByTypes(
            IntegrationType.ShopifyIntegrationType
        )(state),
    }
}

const connector = connect(mapStateToProps, {
    updateOrCreateIntegration,
})

export default connector(GorgiasChatIntegrationSelfServiceComponent)
