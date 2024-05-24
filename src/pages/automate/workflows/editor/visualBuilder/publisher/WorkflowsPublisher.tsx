import React from 'react'

import {useParams} from 'react-router-dom'
import {Drawer} from 'pages/common/components/Drawer'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import useSelfServiceHelpCenterChannels from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import useSelfServiceStandaloneContactFormChannels from 'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {TicketChannel} from 'business/types/ticket'
import useKey from 'hooks/useKey'
import EditorDrawerHeader from '../EditorDrawerHeader'
import nodeEditorCss from '../NodeEditorDrawer.less'
import ChatChannels from './channels/ChatChannels'
import HelpCenterChannels from './channels/HelpCenterChannels'
import ContactFormChannels from './channels/ContactFormChannels'
import css from './WorkflowsPublisher.less'
import ChannelsLink from './helper/ChannelLink'
import NoChannelsAlert from './helper/NoChannelAlert'

export default function WorkflowsPublisher() {
    const {
        setFlowPublishingInChannels,
        isFlowPublishingInChannels,
        configuration,
    } = useWorkflowEditorContext()
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)
    const {selfServiceConfiguration} = useSelfServiceConfiguration(
        shopType,
        shopName
    )
    const enabledQuickResponsesCount =
        selfServiceConfiguration?.quick_response_policies.filter(
            (quickResponse) => !quickResponse.deactivated_datetime
        ).length ?? 0
    const helpCentersChannels = useSelfServiceHelpCenterChannels(
        shopType,
        shopName
    )
    const standaloneContactFormsChannels =
        useSelfServiceStandaloneContactFormChannels(shopType, shopName)
    const hasAtleastOneChannel =
        chatChannels.length ||
        helpCentersChannels.length ||
        standaloneContactFormsChannels.length

    useKey(
        'Escape',
        (event) => {
            event.stopPropagation()
            setFlowPublishingInChannels(false)
        },
        undefined,
        [setFlowPublishingInChannels]
    )
    return (
        <Drawer
            className={nodeEditorCss.drawer}
            name="flow-publisher-drawer"
            open={isFlowPublishingInChannels}
            fullscreen={false}
            isLoading={false}
            portalRootId="app-root"
            transitionDurationMs={300}
        >
            <EditorDrawerHeader
                label={'Display in channels'}
                onClose={() => setFlowPublishingInChannels(false)}
            />

            {isFlowPublishingInChannels && (
                <Drawer.Content>
                    <div className={css.headerDescription}>
                        {hasAtleastOneChannel ? (
                            <>
                                Select the channels you want this Flow to appear
                                in. You can always enable and manage the Flow
                                later in your{' '}
                                <ChannelsLink linkText="Channels" /> page.
                            </>
                        ) : (
                            <>
                                Select where customers can see this Flow. You
                                can always manage and reorder Flows from the{' '}
                                <ChannelsLink linkText="Channels" /> page.
                            </>
                        )}
                    </div>

                    {chatChannels.length ? (
                        <ChatChannels
                            configuration={configuration}
                            chatChannels={chatChannels}
                            enabledQuickResponsesCount={
                                enabledQuickResponsesCount
                            }
                        />
                    ) : (
                        <NoChannelsAlert
                            showLabel={!!hasAtleastOneChannel}
                            channelType={TicketChannel.Chat}
                        />
                    )}
                    {helpCentersChannels.length ? (
                        <HelpCenterChannels
                            configuration={configuration}
                            helpCentersChannels={helpCentersChannels}
                        />
                    ) : (
                        <NoChannelsAlert
                            showLabel={!!hasAtleastOneChannel}
                            channelType={TicketChannel.HelpCenter}
                        />
                    )}
                    {standaloneContactFormsChannels.length ? (
                        <ContactFormChannels
                            configuration={configuration}
                            standaloneContactFormsChannels={
                                standaloneContactFormsChannels
                            }
                        />
                    ) : (
                        <NoChannelsAlert
                            showLabel={!!hasAtleastOneChannel}
                            channelType={TicketChannel.ContactForm}
                        />
                    )}
                </Drawer.Content>
            )}
        </Drawer>
    )
}
