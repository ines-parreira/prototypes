import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import cn from 'classnames'
import Clipboard from 'clipboard'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { Link } from 'react-router-dom'

import { Button, Separator } from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import DEPRECATED_Avatar from 'pages/common/components/Avatar/Avatar'
import {
    areSourcesReady,
    jsonToWidgets,
} from 'pages/common/components/infobar/utils'
import ShopifyCustomerProfileSync from 'pages/common/components/ShopifyCustomerProfileSync/ShopifyCustomerProfileSync'
import { Avatar } from 'pages/tickets/detail/components/TicketMessages/Avatar'
import { CustomerContext } from 'providers/infobar/CustomerContext'
import { EditionContext } from 'providers/infobar/EditionContext'
import { getDisplayName } from 'state/customers/helpers'
import { getIntegrationsByTypes } from 'state/integrations/selectors'
import * as actions from 'state/widgets/actions'
import { itemsWithContext } from 'state/widgets/utils'
import { isCurrentlyOnCustomerPage } from 'utils'

import AddAppSuggestion from './AddAppSuggestion'
import CustomerChannels from './CustomerChannels'
import CustomerFields from './CustomerFields'
import CustomerNote from './CustomerNote'
import CustomerOptionsDropdownButton from './CustomerOptionsDropdown'
import { CustomerTimelineWidget } from './CustomerTimelineWidget'
import { useShouldShowProfileSync } from './helpers'
import InfobarWidgets from './InfobarWidgets/InfobarWidgets'
import { InstagramSection } from './InstagramSection'

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
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
}

const InfobarCustomerInfo = ({
    customer = fromJS({}),
    displayTabs = true,
    isEditing,
    sources,
    widgets,
    onEditCustomer,
    onSyncToShopify,
}: OwnProps) => {
    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()
    const hasTicketThreadRevamp = useFlag(FeatureFlagKey.TicketThreadRevamp)
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
        isEditing,
        customerIntegrationsData,
    )

    const ticketChannel = sources.getIn(['ticket', 'channel']) as
        | string
        | undefined
    const isInstagramTicket = ticketChannel?.startsWith('instagram')

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

    const channels = customer.get('channels')
    const igChannel = channels
        ? channels
              .toJS()
              .filter(({ type }: { type: string }) => type === 'instagram')
              .sort(
                  (
                      a: { updated_datetime: string },
                      b: { updated_datetime: string },
                  ) =>
                      new Date(b.updated_datetime).getTime() -
                      new Date(a.updated_datetime).getTime(),
              )?.[0]
        : null
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
            <div
                className={cn(css.customerInfo, {
                    [css.customerInfoWithPadding]:
                        !hasUIVisionMS1 ||
                        isCurrentlyOnCustomerPage(customer.get('id')),
                })}
            >
                {(!hasUIVisionMS1 ||
                    isCurrentlyOnCustomerPage(customer.get('id'))) && (
                    <>
                        <div className={css.customerProfile}>
                            {hasTicketThreadRevamp ? (
                                <Avatar name={customer.get('name') ?? ''} />
                            ) : (
                                <DEPRECATED_Avatar
                                    name={customer.get('name', '')}
                                    email={customer.get('email', '')}
                                    url={customer.getIn([
                                        'meta',
                                        'profile_picture_url',
                                    ])}
                                    size={36}
                                />
                            )}
                            <div className={css.customerLink}>
                                <Link
                                    to={`/app/customer/${customer.get('id') as string}`}
                                    className={css.displayName}
                                >
                                    {/* TODO(React18): Find a solution to casting to ReactNode once we upgrade to React 18 types */}
                                    {getDisplayName(customer) as ReactNode}
                                </Link>
                            </div>
                            <div className={css.customerOptions}>
                                <CustomerOptionsDropdownButton
                                    activeCustomer={customer}
                                    onEditCustomer={onEditCustomer}
                                    onSyncToShopify={onSyncToShopify}
                                />
                            </div>
                        </div>
                        <CustomerFields
                            customerId={Number(customer.get('id'))}
                        />
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
                            {igChannel && isInstagramTicket && (
                                <InstagramSection
                                    customer={customer}
                                    igChannel={igChannel}
                                />
                            )}
                            <CustomerNote
                                customerId={Number(customer.get('id'))}
                                initialNote={customer.get('note')}
                            />
                        </CustomerChannels>
                        <Separator className={css.separator} />
                    </>
                )}

                {(!hasUIVisionMS1 ||
                    isCurrentlyOnCustomerPage(customer.get('id'))) && (
                    <CustomerTimelineWidget
                        isEditing={isEditing}
                        shopperId={Number(customer.get('id'))}
                    />
                )}
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
