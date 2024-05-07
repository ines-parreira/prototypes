import React, {useEffect, useState} from 'react'

import {useParams} from 'react-router-dom'
import classNames from 'classnames'
import {Drawer} from 'pages/common/components/Drawer'

import {useGetInstallationSnippet} from 'models/integration/queries'
import useSelfServiceChatChannels, {
    SelfServiceChatChannel,
} from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useKey from 'hooks/useKey'
import {VisualBuilderNode} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Spinner from 'pages/common/components/Spinner'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import LanguageSelector from 'pages/automate/workflows/components/LanguageSelector'
import SelfServicePreviewChannelSelect from 'pages/automate/common/components/preview/SelfServicePreviewChannelSelect'
import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import {NotificationStatus} from 'state/notifications/types'
import nodeEditorCss from '../NodeEditorDrawer.less'
import EditorDrawerHeader from '../EditorDrawerHeader'
import css from './TestFlowEditor.less'

type Props = {
    isTesting: boolean
    onClose: () => void
    isAuthenticationBannerVisible?: boolean
    startFlowNode: VisualBuilderNode
}
export const TestFlowEditor = ({
    isTesting,
    onClose,
    isAuthenticationBannerVisible,
    startFlowNode,
}: Props) => {
    const {shopType, shopName, editWorkflowId} = useParams<{
        shopType: string
        shopName: string
        editWorkflowId: string
    }>()
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)
    const {
        visualBuilderGraph: {available_languages},
    } = useWorkflowEditorContext()
    const [selectedTestLanguage, setSelectedTestLanguage] =
        // one of the languages from available_languages
        useState<typeof available_languages[number]>()
    const [isLoading, setIsLoading] = useState(true)
    const [selectedChatChannel, setSelectedChatChannel] =
        useState<SelfServiceChatChannel>()

    const iframeRef = React.createRef<HTMLIFrameElement>()

    const selectedChannelApplicationId = selectedChatChannel
        ? selectedChatChannel.value.meta?.app_id ?? ''
        : chatChannels?.[0]?.value.meta?.app_id ?? ''

    const {data: installationSnippet} = useGetInstallationSnippet({
        applicationId: selectedChannelApplicationId,
    })

    useKey(
        'Escape',
        () => {
            if (isTesting) {
                onClose()
                setIsLoading(true)
            }
        },
        undefined,
        [onClose]
    )

    const label =
        startFlowNode.type === 'trigger_button' ? startFlowNode.data.label : ''

    const selectedLanguage = selectedTestLanguage
        ? selectedTestLanguage
        : available_languages[0]

    function resetChatFlow({
        label,
        language,
        id,
    }: {
        label: string
        language: string
        id: string
    }) {
        if (
            !iframeRef.current ||
            !iframeRef.current.contentWindow ||
            !iframeRef.current.contentWindow?.GorgiasChat
        )
            return

        const gorgiasChat = iframeRef.current.contentWindow.GorgiasChat
        gorgiasChat.setPage('homepage')
        gorgiasChat.previewFlow({
            flowLabel: label,
            flowLanguage: language,
            flowId: id,
        })
    }

    useEffect(() => {
        if (!installationSnippet) return
        setIsLoading(true)

        if (iframeRef.current) {
            iframeRef.current.srcdoc = `
        <body>
            ${installationSnippet.snippet}
            <script type="application/javascript">
            GorgiasChat.init().then(() => {
                GorgiasChat.open();
                gorgiasChatConfiguration.selfServiceConfiguration = {
                    ...gorgiasChatConfiguration.selfServiceConfiguration,
                    enabled: true,
                    workflows_entrypoints: [${JSON.stringify({
                        label: label,
                        workflow_id: editWorkflowId,
                        language: selectedLanguage,
                    })}],
                }
                GorgiasChat.setShopifyContext();
                window.addEventListener('gorgias-widget-loaded', () => {
                    GorgiasChat.previewFlow(${JSON.stringify({
                        flowLabel: label,
                        flowLanguage: selectedLanguage,
                        flowId: editWorkflowId,
                    })})
                })
                window.addEventListener('flow-interpreter-started', (e) => {
                    window.parent.postMessage({
                        type: 'flow-interpreter-started'
                    }, '*')
                })
            })
            </script>
         </body>
        `

            window.addEventListener('message', (e) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (e.data.type === 'flow-interpreter-started') {
                    setIsLoading(false)
                }
            })
        }

        return () => {
            window.removeEventListener('message', () => {
                setIsLoading(true)
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editWorkflowId, installationSnippet, label])

    useEffect(() => {
        resetChatFlow({
            label,
            language: selectedLanguage,
            id: editWorkflowId,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLanguage])

    return (
        <Drawer
            className={nodeEditorCss.drawer}
            name="visual-builder-test-editor-drawer"
            open={isTesting}
            fullscreen={false}
            isLoading={false}
            portalRootId="app-root"
            transitionDurationMs={300}
        >
            <EditorDrawerHeader label="Test" onClose={onClose} isPreview>
                <div className={css.editorHeader}>
                    <SelfServicePreviewChannelSelect
                        className={css.channelSelector}
                        channels={chatChannels}
                        channel={selectedChatChannel}
                        onChange={(channel) => {
                            setSelectedChatChannel(channel)
                        }}
                    />
                    <LanguageSelector
                        languages={available_languages}
                        selected={
                            selectedTestLanguage
                                ? selectedTestLanguage
                                : available_languages[0]
                        }
                        onSelect={(lang) => {
                            setSelectedTestLanguage(lang)
                        }}
                    />
                </div>
            </EditorDrawerHeader>

            <Drawer.Content>
                {isAuthenticationBannerVisible && (
                    <div className={css.banner}>
                        <BannerNotification
                            status={NotificationStatus.Info}
                            message={
                                <div className={css.bannerContent}>
                                    <span>
                                        To test customer login and order
                                        selection steps, use an email address
                                        you can access and create test orders in
                                        your store.
                                    </span>
                                    <a
                                        href="https://docs.gorgias.com/en-US/flows-101-252069"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        className={css.bannerContentLink}
                                    >
                                        <i className="material-icons mr-2">
                                            open_in_new
                                        </i>
                                        Learn more
                                    </a>
                                </div>
                            }
                            showIcon
                            allowHTML
                        />
                    </div>
                )}
                <div className={css.paper}>
                    <Button
                        fillStyle="ghost"
                        isDisabled={isLoading}
                        disabled={isLoading}
                        onClick={() => {
                            resetChatFlow({
                                label,
                                language: selectedLanguage,
                                id: editWorkflowId,
                            })
                        }}
                        intent="secondary"
                    >
                        <ButtonIconLabel icon="refresh" position="left">
                            Restart
                        </ButtonIconLabel>
                    </Button>

                    <div className={classNames(css['iframe-container'])}>
                        {isLoading && (
                            <Spinner color="dark" className={css.spinner} />
                        )}
                        <iframe
                            title="Test Flow Editor"
                            ref={iframeRef}
                            style={{
                                display: isLoading ? 'none' : 'block',
                            }}
                            className={css.iframe}
                        ></iframe>
                    </div>
                </div>
            </Drawer.Content>
        </Drawer>
    )
}
