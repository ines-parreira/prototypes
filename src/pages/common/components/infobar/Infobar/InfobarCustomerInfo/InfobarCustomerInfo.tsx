import React, { useEffect, useMemo, useState } from 'react'

import Clipboard from 'clipboard'
import { fromJS, List, Map } from 'immutable'
import { Link } from 'react-router-dom'

import { Separator } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import Avatar from 'pages/common/components/Avatar/Avatar'
import Button from 'pages/common/components/button/Button'
import {
    areSourcesReady,
    jsonToWidgets,
} from 'pages/common/components/infobar/utils'
import ShopifyCustomerProfileSync from 'pages/common/components/ShopifyCustomerProfileSync/ShopifyCustomerProfileSync'
import { CustomerContext } from 'providers/infobar/CustomerContext'
import { EditionContext } from 'providers/infobar/EditionContext'
import { getDisplayName } from 'state/customers/helpers'
import { getIntegrationsByTypes } from 'state/integrations/selectors'
import * as actions from 'state/widgets/actions'
import { itemsWithContext } from 'state/widgets/utils'

import AddAppSuggestion from './AddAppSuggestion'
import CustomerChannels from './CustomerChannels'
import CustomerFields from './CustomerFields'
import CustomerNote from './CustomerNote'
import CustomerOptionsDropdownButton from './CustomerOptionsDropdown'
import { CustomerTimelineWidget } from './CustomerTimelineWidget'
import { useShouldShowProfileSync } from './helpers'
import InfobarWidgets from './InfobarWidgets/InfobarWidgets'

import css from './InfobarCustomerInfo.less'

type GenerateButtonProps = {
    widgets?: Maybe<Map<any, any>>
    sources: Map<any, any>
}

/**
 * Render a button that generates a widget template as edited template
 */
const GenerateWidgetsButton = ({ sources, widgets }: GenerateButtonProps) => {
    const dispatch = useAppDispatch()
    const generateWidgets = () => {
        const context = widgets ? widgets.get('currentContext', '') : ''

        const items = jsonToWidgets(sources.toJS(), context)
        dispatch(actions.setEditedWidgets(items))
        dispatch(actions.setEditionAsDirty())
    }

    return (
        <div className="no-result-container mt-5">
            <p>{`You're not showing any widgets here yet.`}</p>
            <Button type="button" onClick={generateWidgets}>
                Generate default widgets
            </Button>
        </div>
    )
}

type OwnProps = {
    customer?: Map<any, any>
    displayTabs?: boolean
    isEditing: boolean
    sources: Map<any, any>
    widgets: Map<any, any>
}

const InfobarCustomerInfo = ({
    customer = fromJS({}),
    displayTabs = true,
    isEditing,
    sources,
    widgets,
}: OwnProps) => {
    const shopifyCustomerProfileCreationFeatureEnabled = useFlag(
        FeatureFlagKey.ShopifyCustomerProfileCreation,
        false,
    )
    const dispatch = useAppDispatch()
    const hasIntegrations =
        useAppSelector(
            getIntegrationsByTypes([
                IntegrationType.Http,
                IntegrationType.Magento2,
                IntegrationType.Recharge,
                IntegrationType.Shopify,
                IntegrationType.Smile,
                IntegrationType.BigCommerce,
            ]),
        ).length > 0

    const customerIntegrationsData: Map<any, any> = customer.get('integrations')

    const shouldSuggestCustomerProfileShopifySync = useShouldShowProfileSync(
        shopifyCustomerProfileCreationFeatureEnabled,
        isEditing,
        customerIntegrationsData,
    )

    const editionContextObject = useMemo(
        () => ({
            isEditing,
        }),
        [isEditing],
    )

    const [isInitialized, setIsInitialized] = useState(false)

    let clipboard: Maybe<Clipboard> = null

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clipboard = new Clipboard('.js-clipboard-copy')

        return () => {
            dispatch(actions.resetWidgets())

            if (clipboard) {
                clipboard.destroy()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const contextWidgets = useMemo(() => {
        const context = widgets.get('currentContext', '')
        const currentItems = itemsWithContext(
            widgets.get('items', fromJS([])),
            context,
        )

        return !currentItems.isEmpty()
            ? currentItems
            : (fromJS([]) as List<any>)
    }, [widgets])

    useEffect(() => {
        const context = widgets.get('currentContext', '')
        const hasWidgets = !contextWidgets.isEmpty()
        if (widgets.getIn(['_internal', 'hasFetchedWidgets'])) {
            const shouldGenerateWidgets =
                areSourcesReady(sources, context) &&
                !hasWidgets &&
                !widgets.getIn(['_internal', 'hasGeneratedWidgets'])

            // if no widgets, generate them from incoming json
            if (shouldGenerateWidgets) {
                dispatch(actions.generateAndSetWidgets(sources, context))
            }

            const shouldSetEditedItems =
                !isInitialized && isEditing && hasWidgets

            // if editing, set template to edit when ready
            if (shouldSetEditedItems) {
                // start edition mode
                dispatch(actions.setEditedWidgets(contextWidgets.toJS()))
                if (!isInitialized) {
                    setIsInitialized(true)
                }
            }
        }
    }, [widgets, contextWidgets, sources, isEditing, isInitialized, dispatch])

    const renderWidgets = () => {
        const renderedContextWidgets: List<any> = isEditing
            ? widgets.getIn(['_internal', 'editedItems'])
            : contextWidgets

        const shouldSuggestTemplateGeneration =
            isEditing &&
            !widgets.getIn(['_internal', 'drag', 'isDragging'], false) &&
            (!renderedContextWidgets ||
                (renderedContextWidgets.size <= 1 &&
                    (
                        renderedContextWidgets.getIn(
                            [0, 'template'],
                            fromJS({}),
                        ) as Map<any, any>
                    ).isEmpty()))

        if (shouldSuggestTemplateGeneration) {
            return <GenerateWidgetsButton widgets={widgets} sources={sources} />
        }

        const allWidgetsTemplatesAreEmpty =
            !renderedContextWidgets ||
            renderedContextWidgets.every((widget: Map<any, any>) =>
                (widget.get('template', fromJS({})) as Map<any, any>).isEmpty(),
            )

        if (!isEditing && allWidgetsTemplatesAreEmpty) {
            return null
        }

        return (
            <EditionContext.Provider value={editionContextObject}>
                <CustomerContext.Provider
                    value={{
                        customerId: customer.get('id'),
                    }}
                >
                    <InfobarWidgets
                        context={widgets.get('currentContext', '')}
                        source={sources}
                        widgets={renderedContextWidgets}
                        displayTabs={displayTabs}
                    />
                </CustomerContext.Provider>
            </EditionContext.Provider>
        )
    }

    const renderSuggestion = () => {
        if (hasIntegrations) {
            return null
        }

        return <AddAppSuggestion />
    }

    if (!customer || customer.isEmpty()) {
        return null
    }
    let chatIntegrationData: Map<any, any> | null = null
    if (customerIntegrationsData) {
        chatIntegrationData = customerIntegrationsData.find(
            (customerIntegrationData: Map<any, any>) => {
                return (
                    customerIntegrationData.get('__integration_type__') ===
                    IntegrationType.GorgiasChat
                )
            },
        )
    }

    let lastSeenOnChat
    if (chatIntegrationData) {
        lastSeenOnChat = chatIntegrationData.get(
            'chat_recent_activity_timestamp',
        )
    }

    return (
        <div
            className={'d-flex flex-column'}
            data-candu-id={`infobar-widgets-list-${
                isEditing ? 'edition' : 'view'
            }`}
        >
            <div className={css.customerInfo}>
                <div className={css.customerProfile}>
                    <Avatar
                        name={customer.get('name', '')}
                        email={customer.get('email', '')}
                        url={customer.getIn(['meta', 'profile_picture_url'])}
                        size={36}
                    />
                    <div className={css.customerLink}>
                        <Link
                            to={`/app/customer/${customer.get('id') as string}`}
                            className={css.displayName}
                        >
                            {getDisplayName(customer)}
                        </Link>
                    </div>
                    {shopifyCustomerProfileCreationFeatureEnabled && (
                        <div className={css.customerOptions}>
                            <CustomerOptionsDropdownButton
                                activeCustomer={customer}
                            />
                        </div>
                    )}
                </div>
                <CustomerFields customerId={Number(customer.get('id'))} />
                <Separator className={css.separator} />
                <CustomerChannels
                    channels={customer.get('channels') || fromJS([])}
                    customerLocationInfo={customer.getIn([
                        'meta',
                        'location_info',
                    ])}
                    customerLastSeenOnChat={lastSeenOnChat}
                    customerId={customer.get('id', '')}
                    customerName={customer.get('name', '')}
                >
                    <CustomerNote customer={customer} />
                </CustomerChannels>
                <Separator className={css.separator} />
                <CustomerTimelineWidget
                    isEditing={isEditing}
                    customerId={Number(customer.get('id'))}
                />
            </div>

            {shouldSuggestCustomerProfileShopifySync && (
                <ShopifyCustomerProfileSync activeCustomer={customer} />
            )}

            {areSourcesReady(sources, widgets.get('currentContext', ''))
                ? renderWidgets()
                : renderSuggestion()}
        </div>
    )
}

export default InfobarCustomerInfo
