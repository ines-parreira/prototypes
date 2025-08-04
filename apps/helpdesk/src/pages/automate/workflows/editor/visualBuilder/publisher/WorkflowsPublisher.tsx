import { useKey } from '@repo/hooks'
import { useParams } from 'react-router-dom'

import { TicketChannel } from 'business/types/ticket'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useSelfServiceHelpCenterChannels from 'pages/automate/common/hooks/useSelfServiceHelpCenterChannels'
import useSelfServiceStandaloneContactFormChannels from 'pages/automate/common/hooks/useSelfServiceStandaloneContactFormChannels'
import { useWorkflowEditorContext } from 'pages/automate/workflows/hooks/useWorkflowEditor'
import { Drawer } from 'pages/common/components/Drawer'

import EditorDrawerHeader from '../EditorDrawerHeader'
import ChatChannels from './channels/ChatChannels'
import ContactFormChannels from './channels/ContactFormChannels'
import HelpCenterChannels from './channels/HelpCenterChannels'
import ChannelsLink from './helper/ChannelLink'
import NoChannelsAlert from './helper/NoChannelAlert'

import nodeEditorCss from '../NodeEditorDrawer.less'
import css from './WorkflowsPublisher.less'

export default function WorkflowsPublisher() {
    const {
        setFlowPublishingInChannels,
        isFlowPublishingInChannels,
        configuration,
    } = useWorkflowEditorContext()
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const helpCentersChannels = useSelfServiceHelpCenterChannels(
        shopType,
        shopName,
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
        [setFlowPublishingInChannels],
    )
    return (
        <Drawer
            className={nodeEditorCss.drawer}
            aria-label="Flow publisher"
            open={isFlowPublishingInChannels}
            fullscreen={false}
            isLoading={false}
            portalRootId="app-root"
            transitionDurationMs={300}
            onBackdropClick={() => setFlowPublishingInChannels(false)}
        >
            <EditorDrawerHeader
                testId="publisher"
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
