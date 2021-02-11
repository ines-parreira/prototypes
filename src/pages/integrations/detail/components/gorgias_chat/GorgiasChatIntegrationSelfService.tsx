import React, {useEffect, useReducer} from 'react'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
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
    integration_id: number
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

function computeToggleValue(
    integration: Map<any, any>,
    shopifyIntegration: Map<any, any>
): boolean {
    const configurations: List<Map<any, any>> = integration.getIn(
        ['meta', 'self_service', 'configurations'],
        []
    )
    const hasNewConfigurations = configurations.size > 0

    if (hasNewConfigurations) {
        const shopName = shopifyIntegration.getIn([
            'meta',
            'shop_name',
        ]) as string
        const permanentDomain = `${shopName}${SHOPIFY_DOMAIN_SUFFIX}`

        return configurations.some((config) => {
            const isEnabled = config?.get('enabled')
            const baseUrl = config?.get('base_url')
            return isEnabled && baseUrl === permanentDomain
        })
    }

    const isOldConfigurationActive = !!integration.getIn(
        ['meta', 'self_service', 'enabled'],
        false
    )
    if (!isOldConfigurationActive) {
        return false
    }
    const shopify_integration_ids: number[] = integration.getIn(
        ['meta', 'shopify_integration_ids'],
        []
    )
    return shopify_integration_ids.includes(shopifyIntegration.get('id'))
}

export function GorgiasChatIntegrationSelfServiceComponent({
    updateOrCreateIntegration,
    integration,
    shopifyIntegrations,
}: OwnProps & ConnectedProps<typeof connector>) {
    const shopNames = shopifyIntegrations
        .map(
            (integration: Map<any, any>) =>
                integration.getIn(['meta', 'shop_name']) as string
        )
        .toArray()

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

        const newMeta = existingMeta.set(
            'self_service',
            fromJS({
                enabled: false, // need to explicitly set it to false since it's being replaced by the new config
                configurations: shopNames.map((shopName) => {
                    const permanentDomain = `${shopName}${SHOPIFY_DOMAIN_SUFFIX}`
                    const shopifyIntegration = shopifyIntegrations.find(
                        (shopInt: Map<any, any>) => {
                            return (
                                shopInt.getIn(['meta', 'shop_name']) ===
                                shopName
                            )
                        }
                    ) as Map<any, any>

                    const currentToggleValue = computeToggleValue(
                        integration,
                        shopifyIntegration
                    )

                    return {
                        base_url: permanentDomain,
                        integration_id: shopifyIntegration.get('id'),
                        enabled:
                            toggledShopDomain === permanentDomain
                                ? !currentToggleValue
                                : currentToggleValue,
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

                        {shopNames.length === 0 ? (
                            <Alert color="warning">
                                No active Shopify store detected. Please make
                                sure to add a Shopify integration to access the
                                Self-service features.
                            </Alert>
                        ) : (
                            <>
                                <h5>Enable Self-service</h5>
                                <p>
                                    Self-service is only available for Shopify
                                    stores with an active chat integration. If
                                    you installed the chat widget manually,
                                    please refer to{' '}
                                    <a href="https://docs.gorgias.com/article/48muw8we2j-installing-and-using-the-self-service-chat-portal">
                                        this documentation
                                    </a>{' '}
                                    for the extra steps required to enable the
                                    Self-service feature.
                                </p>
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
                                                const shopName = shopifyIntegration.getIn(
                                                    ['meta', 'shop_name']
                                                ) as string
                                                const permanentDomain = `${shopName}${SHOPIFY_DOMAIN_SUFFIX}`

                                                const toggleValue = computeToggleValue(
                                                    integration,
                                                    shopifyIntegration
                                                )

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
                                                                label={`Enable Self-service for ${shopName}`}
                                                                value={
                                                                    toggleValue
                                                                }
                                                                onChange={() =>
                                                                    onToggleSelfService(
                                                                        permanentDomain
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
