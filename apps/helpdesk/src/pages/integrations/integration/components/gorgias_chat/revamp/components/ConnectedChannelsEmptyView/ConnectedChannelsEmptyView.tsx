import { useHistory, useRouteMatch } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import AutomatePaywallView from 'pages/automate/common/components/AutomatePaywallView'
import { AutomateFeatures } from 'pages/automate/common/types'

import css from './ConnectedChannelsEmptyView.less'

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

type Props = {
    view: ConnectedChannelViewKind
}

export const ConnectedChannelsEmptyView = ({ view }: Props) => {
    const match = useRouteMatch()
    const history = useHistory()

    const isSpecificChannelView = match.url.split('/')?.pop() === 'automate'
    const url = isSpecificChannelView
        ? getUrlByView(view, match.params)
        : `/app/settings/${getIntegrationTypeByView(view)}`

    return (
        <div className={css.emptyView}>
            <AutomatePaywallView
                automateFeature={view}
                customCta={
                    <Button onClick={() => history.push(url)}>
                        {isSpecificChannelView
                            ? `Go To Connect Store`
                            : `Go To ${getNameByView(view)}`}
                    </Button>
                }
            />
        </div>
    )
}
