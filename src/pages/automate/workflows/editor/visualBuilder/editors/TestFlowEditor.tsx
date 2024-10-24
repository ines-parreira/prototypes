import classNames from 'classnames'
import _throttle from 'lodash/throttle'
import React, {useEffect, useState, useMemo, useRef} from 'react'
import {useParams} from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useEffectOnce from 'hooks/useEffectOnce'
import useKey from 'hooks/useKey'
import {useGetInstallationSnippet} from 'models/integration/queries'
import SelfServicePreviewChannelSelect from 'pages/automate/common/components/preview/SelfServicePreviewChannelSelect'
import useSelfServiceChatChannels, {
    SelfServiceChatChannel,
} from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import LanguageSelector from 'pages/automate/workflows/components/LanguageSelector'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {VisualBuilderNode} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {Drawer} from 'pages/common/components/Drawer'
import Spinner from 'pages/common/components/Spinner'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import EditorDrawerHeader from '../EditorDrawerHeader'
import nodeEditorCss from '../NodeEditorDrawer.less'
import css from './TestFlowEditor.less'

const TIMEOUT_FLOW_INTERPRETER_STARTED = 40_000

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
    const dispatch = useAppDispatch()
    const {shopType, shopName, editWorkflowId} = useParams<{
        shopType: string
        shopName: string
        editWorkflowId: string
    }>()

    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const availableChatChannels = useMemo(
        () =>
            chatChannels.filter(
                (chat) =>
                    !chat.value.deactivated_datetime &&
                    !chat.value.deleted_datetime
            ),
        [chatChannels]
    )
    const {
        currentLanguage,
        translateKey,
        visualBuilderGraph: {available_languages, wfConfigurationOriginal},
    } = useWorkflowEditorContext()

    const [selectedTestLanguage, setSelectedTestLanguage] =
        // one of the languages from available_languages
        useState<(typeof available_languages)[number]>()
    const [isFlowInterpreterStarted, setIsFlowInterpreterStarted] =
        useState<boolean>(false)
    const [
        isFlowInterpreterStartedTimeout,
        setIsFlowInterpreterStartedTimeout,
    ] = useState(false)
    const [selectedChatChannel, setSelectedChatChannel] =
        useState<SelfServiceChatChannel>()

    const chatIFrameElement = useRef<HTMLIFrameElement | null>(null)

    const selectedChannelApplicationId = selectedChatChannel
        ? (selectedChatChannel.value.meta?.app_id ?? '')
        : (availableChatChannels?.[0]?.value.meta?.app_id ?? '')

    const {data: installationSnippet} = useGetInstallationSnippet({
        applicationId: selectedChannelApplicationId,
    })

    useKey(
        'Escape',
        (event) => {
            if (isTesting) {
                event.stopPropagation()
                onClose()
            }
        },
        undefined,
        [onClose, isTesting]
    )

    const selectedLanguage = selectedTestLanguage
        ? selectedTestLanguage
        : (currentLanguage ?? available_languages[0])

    const label =
        translateKey(
            wfConfigurationOriginal.entrypoint?.label_tkey ?? '',
            selectedLanguage
        ) ||
        (startFlowNode.type === 'channel_trigger'
            ? startFlowNode.data.label
            : '')

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
            !chatIFrameElement.current ||
            !chatIFrameElement.current.contentWindow ||
            !chatIFrameElement.current.contentWindow?.GorgiasChat
        )
            return

        const gorgiasChat = chatIFrameElement.current.contentWindow.GorgiasChat
        gorgiasChat.setPage('homepage')
        gorgiasChat.previewFlow({
            flowLabel: label,
            flowLanguage: language,
            flowId: id,
        })
    }

    useEffect(() => {
        if (
            isFlowInterpreterStartedTimeout &&
            !isFlowInterpreterStarted &&
            isTesting
        ) {
            setIsFlowInterpreterStartedTimeout(false)
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Failed Loading Flow Testing. Please try again later',
                })
            )
        }
    }, [
        dispatch,
        isFlowInterpreterStarted,
        isFlowInterpreterStartedTimeout,
        isTesting,
    ])

    useEffectOnce(() => {
        const timeoutId = window.setTimeout(() => {
            if (!isFlowInterpreterStarted) {
                setIsFlowInterpreterStartedTimeout(true)
            }
        }, TIMEOUT_FLOW_INTERPRETER_STARTED)
        return window.clearTimeout(timeoutId)
    })

    useEffectOnce(() => {
        window.addEventListener('message', (e) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (e.data.type === 'flow-interpreter-started') {
                setIsFlowInterpreterStarted(true)
            }
        })
        return () => {
            window.removeEventListener('message', () => {
                setIsFlowInterpreterStarted(false)
            })
        }
    })

    useEffect(() => {
        if (!isTesting || !isFlowInterpreterStarted) return
        resetChatFlow({
            label,
            language: selectedLanguage,
            id: editWorkflowId,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLanguage, isTesting])

    return (
        <Drawer
            className={nodeEditorCss.drawer}
            aria-label="Visual builder test editor"
            open={isTesting}
            fullscreen={false}
            isLoading={false}
            portalRootId="app-root"
            transitionDurationMs={300}
        >
            <EditorDrawerHeader
                testId="test"
                label="Test"
                onClose={onClose}
                isPreview
            >
                <div className={css.editorHeader}>
                    <SelfServicePreviewChannelSelect
                        className={css.channelSelector}
                        channels={availableChatChannels}
                        channel={selectedChatChannel}
                        onChange={(channel) => {
                            if (channel !== selectedChatChannel) {
                                setIsFlowInterpreterStartedTimeout(false)
                                setIsFlowInterpreterStarted(false)
                                chatIFrameElement.current?.remove()
                                setSelectedChatChannel(channel)
                            }
                        }}
                        isDisabled={!isFlowInterpreterStarted}
                    />
                    <LanguageSelector
                        languages={available_languages}
                        selected={selectedLanguage}
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
                                        href="https://link.gorgias.com/5je"
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
                        isDisabled={!isFlowInterpreterStarted}
                        onClick={_throttle(
                            () =>
                                resetChatFlow({
                                    label,
                                    language: selectedLanguage,
                                    id: editWorkflowId,
                                }),
                            2000
                        )}
                        intent="secondary"
                    >
                        <ButtonIconLabel icon="refresh" position="left">
                            Restart
                        </ButtonIconLabel>
                    </Button>

                    <div className={classNames(css['iframe-container'])}>
                        {!isFlowInterpreterStarted && (
                            <Spinner color="dark" size="big" />
                        )}

                        <div
                            id="iframe-wrapper"
                            className={classNames({
                                [css['hidden']]: !isFlowInterpreterStarted,
                            })}
                            ref={(el) => {
                                if (!el || !installationSnippet || !label)
                                    return
                                if (el.querySelector('#chat-iframe')) return

                                const snippet = new DOMParser().parseFromString(
                                    installationSnippet.snippet,
                                    'text/html'
                                )
                                const script = snippet.querySelector('script')

                                if (!script) {
                                    return
                                }

                                const scriptSrc = new URL(script.src)
                                scriptSrc.searchParams.set('source', 'manual')

                                script.src = scriptSrc.toString()

                                const iframe = document.createElement('iframe')
                                iframe.id = 'chat-iframe'
                                iframe.className = css.iframe

                                el.appendChild(iframe)
                                let loaded = false

                                const writeIframe = () => {
                                    const iframeSrcDoc = `
                                        <body>
                                            ${script.outerHTML}
                                            <script type="application/javascript">
                                            const mockLocalStorage = new Map()

                                            window.localStorage.setItem = function(keyName, keyValue) {
                                                mockLocalStorage.set(keyName, keyValue)
                                            }
                                            window.localStorage.getItem = function(keyName) {
                                                return mockLocalStorage.get(keyName)
                                            }
                                            window.localStorage.removeItem = function(keyName) {
                                                mockLocalStorage.delete(keyName)
                                            }
                                            window.localStorage.clear = function() {
                                                mockLocalStorage.clear()
                                            }
                                            window.WebSocket = function() {}

                                            GorgiasChat.init().then(() => {
                                                GorgiasChat.hideOnMobile(false);
                                                GorgiasChat.hideOutsideBusinessHours(false);
                                                GorgiasChat.open();
                                                gorgiasChatConfiguration.selfServiceConfiguration = {
                                                    ...gorgiasChatConfiguration.selfServiceConfiguration,
                                                    deleted: false,
                                                    enabled: true,
                                                    workflows_entrypoints: [${JSON.stringify(
                                                        {
                                                            label: label,
                                                            workflow_id:
                                                                editWorkflowId,
                                                            language:
                                                                selectedLanguage,
                                                        }
                                                    )}],
                                                }
                                                GorgiasChat.setShopifyContext();
                                                window.addEventListener('gorgias-widget-loaded', () => {
                                                    GorgiasChat.previewFlow(${JSON.stringify(
                                                        {
                                                            flowLabel: label,
                                                            flowLanguage:
                                                                selectedLanguage,
                                                            flowId: editWorkflowId,
                                                        }
                                                    )})
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

                                    const doc =
                                        iframe.contentDocument ||
                                        iframe.contentWindow?.document

                                    if (!doc) return
                                    doc.open()
                                    doc.write(iframeSrcDoc)
                                    doc.close()
                                }

                                iframe.addEventListener('load', () => {
                                    if (loaded) return
                                    loaded = true
                                    writeIframe()
                                })

                                setTimeout(() => {
                                    if (loaded) return
                                    loaded = true
                                    writeIframe()
                                }, 3000)

                                chatIFrameElement.current = iframe
                            }}
                        />
                    </div>
                </div>
            </Drawer.Content>
        </Drawer>
    )
}
