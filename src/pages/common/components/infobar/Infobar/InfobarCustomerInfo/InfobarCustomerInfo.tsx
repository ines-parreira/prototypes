import React, {useEffect, useState} from 'react'
import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import Clipboard from 'clipboard'

import {EditionContext} from 'providers/infobar/EditionContext'
import Button from 'pages/common/components/button/Button'
import {RootState} from 'state/types'
import {itemsWithContext} from 'state/widgets/utils'
import {getDisplayName} from 'state/customers/helpers'
import {IntegrationType} from 'models/integration/types'
import {CustomerContext} from 'providers/infobar/CustomerContext'

import Avatar from 'pages/common/components/Avatar/Avatar'
import css from 'pages/common/components/infobar/Infobar.less'
import {
    areSourcesReady,
    canDrop,
    jsonToWidgets,
} from 'pages/common/components/infobar/utils'

import {getIntegrationsByTypes} from 'state/integrations/selectors'
import CustomerChannels from './CustomerChannels'
import CustomerNote from './CustomerNote/CustomerNote'
import InfobarWidgets from './InfobarWidgets/InfobarWidgets.js'
import AddIntegrationSuggestion from './AddIntegrationSuggestion'

type GenerateButtonProps = {
    setEditedWidgets: (items: Map<any, any>[]) => void
    setEditionAsDirty: () => void
    widgets?: Maybe<Map<any, any>>
    sources: Map<any, any>
}

/**
 * Render a button that generates a widget template as edited template
 */
const GenerateButton = ({
    setEditedWidgets,
    setEditionAsDirty,
    sources,
    widgets,
}: GenerateButtonProps) => {
    const generateWidgets = () => {
        const context = widgets ? widgets.get('currentContext', '') : ''

        const items = jsonToWidgets(sources.toJS(), context)
        setEditedWidgets(items)
        setEditionAsDirty()
    }

    return (
        <div className="no-result-container mt-5">
            <p>You're not showing any widgets here yet.</p>
            <Button type="button" onClick={generateWidgets}>
                Generate default widgets
            </Button>
        </div>
    )
}

type OwnProps = {
    actions: {
        setEditedWidgets: (items: Map<any, any>[]) => void
        setEditionAsDirty: () => void
        resetWidgets: () => void
        generateAndSetWidgets: (sources: Map<any, any>, context: string) => void
        removeEditedWidget: (
            templatePath: string,
            absolutePath: string[]
        ) => void
    }
    customer: Map<any, any>
    displayTabs?: boolean
    hasIntegrations: boolean
    isEditing: boolean
    sources: Map<any, any>
    widgets: Map<any, any>
}

export type Editing = {
    isEditing: boolean
    isDragging: boolean
    actions: OwnProps['actions']
    state: Map<any, any>
    canDrop: (arg: string) => boolean
}

export const InfobarCustomerInfoContainer = ({
    actions,
    customer = fromJS({}),
    displayTabs = true,
    hasIntegrations,
    isEditing,
    sources,
    widgets,
}: OwnProps & ConnectedProps<typeof connector>) => {
    const [contextWidgets, setContextWidgets] = useState<List<any>>(fromJS([]))
    const [isInitialized, setIsInitialized] = useState(false)

    let clipboard: Maybe<Clipboard> = null

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clipboard = new Clipboard('.js-clipboard-copy')

        return () => {
            actions.resetWidgets()

            if (clipboard) {
                clipboard.destroy()
            }
        }
    }, [])

    useEffect(() => {
        initWidgets()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing, widgets, sources])

    const initWidgets = () => {
        const context = widgets.get('currentContext', '')

        const currentItems = itemsWithContext(
            widgets.get('items', fromJS([])),
            context
        )

        // null = should generate a new widgets template
        // empty array = user wanted no widgets
        const hasWidgets = !currentItems.isEmpty()

        setContextWidgets(hasWidgets ? currentItems : fromJS([]))

        if (widgets.getIn(['_internal', 'hasFetchedWidgets'])) {
            const shouldGenerateWidgets =
                areSourcesReady(sources, context) &&
                !hasWidgets &&
                !widgets.getIn(['_internal', 'hasGeneratedWidgets'])

            // if no widgets, generate them from incoming json
            if (shouldGenerateWidgets) {
                actions.generateAndSetWidgets(sources, context)
            }

            const shouldSetEditedItems =
                !isInitialized && isEditing && hasWidgets

            // if editing, set template to edit when ready
            if (shouldSetEditedItems) {
                // start edition mode
                actions.setEditedWidgets(currentItems.toJS())
                setIsInitialized(true)
            }
        }
    }

    const renderWidgets = () => {
        const renderedContextWidgets: List<any> = isEditing
            ? widgets.getIn(['_internal', 'editedItems'])
            : contextWidgets

        const isDragging = widgets.getIn(
            ['_internal', 'drag', 'isDragging'],
            false
        ) as boolean

        const shouldSuggestTemplateGeneration =
            isEditing &&
            !isDragging &&
            (!renderedContextWidgets ||
                (renderedContextWidgets.size <= 1 &&
                    (
                        renderedContextWidgets.getIn(
                            [0, 'template'],
                            fromJS({})
                        ) as Map<any, any>
                    ).isEmpty()))

        if (shouldSuggestTemplateGeneration) {
            return (
                <GenerateButton
                    setEditedWidgets={actions.setEditedWidgets}
                    setEditionAsDirty={actions.setEditionAsDirty}
                    widgets={widgets}
                    sources={sources}
                />
            )
        }

        const allWidgetsTemplatesAreEmpty =
            !renderedContextWidgets ||
            renderedContextWidgets.every((widget: Map<any, any>) =>
                (widget.get('template', fromJS({})) as Map<any, any>).isEmpty()
            )

        if (!isEditing && allWidgetsTemplatesAreEmpty) {
            return null
        }

        const editing: Editing | undefined = isEditing
            ? {
                  isEditing,
                  isDragging,
                  actions,
                  state: widgets,
                  canDrop: (targetAbsolutePath: string) => {
                      const group = widgets.getIn([
                          '_internal',
                          'drag',
                          'group',
                      ])
                      return canDrop(group, targetAbsolutePath)
                  },
              }
            : undefined

        return (
            <EditionContext.Provider value={{isEditing}}>
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
                        editing={editing}
                    />
                </CustomerContext.Provider>
            </EditionContext.Provider>
        )
    }

    const renderSuggestion = () => {
        if (hasIntegrations) {
            return null
        }

        return <AddIntegrationSuggestion />
    }

    if (!customer || customer.isEmpty()) {
        return null
    }

    const customerIntegrationsData: Map<any, any> = customer.get('integrations')
    let chatIntegrationData: Map<any, any> | null = null
    if (customerIntegrationsData) {
        chatIntegrationData = customerIntegrationsData.find(
            (customerIntegrationData: Map<any, any>) => {
                return (
                    customerIntegrationData.get('__integration_type__') ===
                    IntegrationType.GorgiasChat
                )
            }
        )
    }

    let lastSeenOnChat
    if (chatIntegrationData) {
        lastSeenOnChat = chatIntegrationData.get(
            'chat_recent_activity_timestamp'
        )
    }

    return (
        <div
            className={classnames(css.widgetsList, 'd-flex flex-column')}
            data-candu-id={`infobar-widgets-list-${
                isEditing ? 'edition' : 'view'
            }`}
        >
            <div className={css.customerInfo}>
                <div className={css.customerProfile}>
                    <Avatar
                        className="mr-3 rounded"
                        name={customer.get('name', '')}
                        email={customer.get('email', '')}
                        url={customer.getIn(['meta', 'profile_picture_url'])}
                    />
                    <Link
                        to={`/app/customer/${customer.get('id') as string}`}
                        className={css.displayName}
                    >
                        {getDisplayName(customer)}
                    </Link>
                </div>
                <div className={css.detail}>
                    <CustomerChannels
                        channels={customer.get('channels') || fromJS([])}
                        customerLocationInfo={customer.getIn([
                            'meta',
                            'location_info',
                        ])}
                        customerLastSeenOnChat={lastSeenOnChat}
                        customerId={customer.get('id') || ''}
                        customerName={customer.get('name') || ''}
                    >
                        <CustomerNote customer={customer} />
                    </CustomerChannels>
                </div>
            </div>
            {areSourcesReady(sources, widgets.get('currentContext', ''))
                ? renderWidgets()
                : renderSuggestion()}
        </div>
    )
}

const connector = connect((state: RootState) => ({
    hasIntegrations:
        getIntegrationsByTypes([
            IntegrationType.Http,
            IntegrationType.Magento2,
            IntegrationType.Recharge,
            IntegrationType.Shopify,
            IntegrationType.Smile,
            IntegrationType.BigCommerce,
        ])(state).length > 0,
}))

export default connector(InfobarCustomerInfoContainer)
