import { Link, useRouteMatch } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import AutomatePaywallView from 'pages/automate/common/components/AutomatePaywallView'
import { AutomateFeatures } from 'pages/automate/common/types'

import css from './EmptyView.less'

type ConnectedChannelViewKind =
    | AutomateFeatures.AutomateChat
    | AutomateFeatures.AutomateContactForm
    | AutomateFeatures.AutomateHelpCenter

const getIntegrationTypeByView = (view: ConnectedChannelViewKind) => {
    if (view === AutomateFeatures.AutomateChat) {
        return 'channels/gorgias_chat'
    }
    if (view === AutomateFeatures.AutomateContactForm) {
        return 'contact-form'
    }

    return 'help-center'
}

const getNameByView = (view: ConnectedChannelViewKind) => {
    if (view === AutomateFeatures.AutomateChat) {
        return 'Chat'
    }
    if (view === AutomateFeatures.AutomateContactForm) {
        return 'Contact Form'
    }

    return 'Help Center'
}

const getUrlByView = (
    view: ConnectedChannelViewKind,
    params: Record<string, string>,
) => {
    if (view === AutomateFeatures.AutomateChat) {
        return `/app/settings/channels/gorgias_chat/${params.integrationId}/installation`
    }
    if (view === AutomateFeatures.AutomateContactForm) {
        return `/app/settings/contact-form/${params.contactFormId}/publish`
    }

    return `/app/settings/help-center/${params.helpCenterId}/publish-track`
}

export const ConnectedChannelsEmptyView = ({
    view,
}: {
    view: ConnectedChannelViewKind
}) => {
    const match = useRouteMatch()

    // Since this component is used in multiple places, we need to check if the last segment of the URL is 'automate'
    // If it does, it means that it is being rendered in a specific channel view, and the way to retrieve the URL is different
    const isSpecificChannelView = match.url.split('/')?.pop() === 'automate'

    return (
        <div className={css.emptyView}>
            <AutomatePaywallView
                automateFeature={view}
                customCta={
                    <Link
                        to={
                            isSpecificChannelView
                                ? getUrlByView(view, match.params)
                                : `/app/settings/${getIntegrationTypeByView(
                                      view,
                                  )}`
                        }
                    >
                        <Button className={css.emptyChatViewButton}>
                            {isSpecificChannelView
                                ? `Go To Connect Store`
                                : `Go To ${getNameByView(view)}`}
                        </Button>
                    </Link>
                }
            />
        </div>
    )
}
