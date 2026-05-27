import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'
import type { RefObject } from 'react'

import { LANGUAGE_TO_LOCALE_MAPPING } from 'constants/languages'
import type { LANGUAGE } from 'constants/languages'
import { useGetInstallationSnippet } from 'models/integration/queries'

import { ChatPreviewErrorState } from '../ChatPreviewErrorState/ChatPreviewErrorState'
import { ChatPreviewLoading } from '../ChatPreviewLoading/ChatPreviewLoading'
import iframeBootstrapScript from './ChatPreviewBootstrapScript.js?raw'

import css from './ChatPreview.less'

type Props = {
    appId: string
    language?: LANGUAGE
    onLoaded: (
        gorgiasChat: Window['GorgiasChat'],
        gorgiasChatConfiguration: Window['gorgiasChatConfiguration'],
    ) => void
    /**
     * When true, injects a CSS override that constrains the legacy chat
     * window iframe (`#chat-window`) to fit inside its container minus the
     * launcher gap. Required when the preview shares vertical space with
     * additional UI (e.g. the business hours toggle); must stay off for the
     * chat 2.0 redesign which manages its own positioning.
     */
    fitChatWindowHeight?: boolean
}

export type ChatPreviewHandle = {
    iframeRef: RefObject<HTMLIFrameElement>
    isLoaded: boolean
    hasError: boolean
}

export const ChatPreview = forwardRef<ChatPreviewHandle, Props>(
    ({ appId, language, onLoaded, fitChatWindowHeight = false }, ref) => {
        const iframeRef = useRef<HTMLIFrameElement>(null)
        const [isLoaded, setIsWidgetLoaded] = useState(false)
        const [hasError, setHasError] = useState(false)
        const {
            data: installationSnippet,
            isLoading: installationSnippetLoading,
            isError: installationSnippetError,
            refetch: refetchInstallationSnippet,
        } = useGetInstallationSnippet(
            {
                applicationId: appId,
            },
            { retry: 2 },
        )

        const isLoading = useMemo(() => {
            return installationSnippetLoading || !isLoaded
        }, [installationSnippetLoading, isLoaded])

        useEffect(() => {
            setIsWidgetLoaded(false)
            setHasError(false)
        }, [appId])

        useEffect(() => {
            const handleMessage = (event: MessageEvent) => {
                if (event.data?.type === 'helpdesk-chat-preview-loaded') {
                    setIsWidgetLoaded(true)
                    onLoaded(
                        iframeRef.current?.contentWindow?.GorgiasChat,
                        iframeRef.current?.contentWindow
                            ?.gorgiasChatConfiguration,
                    )
                } else if (event.data?.type === 'helpdesk-chat-preview-error') {
                    setHasError(true)
                }
            }

            window.addEventListener('message', handleMessage)
            return () => window.removeEventListener('message', handleMessage)
        }, [onLoaded])

        const iframeSourceDoc = useMemo(() => {
            if (!installationSnippet?.snippet) {
                return null
            }

            const snippet = new DOMParser().parseFromString(
                installationSnippet.snippet,
                'text/html',
            )
            const script = snippet.querySelector('script')

            if (!script?.src) {
                return null
            }

            const scriptSrc = new URL(script.src)
            scriptSrc.searchParams.set('source', 'manual')
            scriptSrc.searchParams.set('preview', 'true')
            scriptSrc.searchParams.set(
                'rev', // rev param is set in order to prevent browser caching
                String(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
            )

            const fitChatWindowStyle = fitChatWindowHeight
                ? `<style>#chat-window { height: calc(100% - 100px) !important; }</style>`
                : ''

            script.src = scriptSrc.toString()
            return `
            <html>
                <head>
                    ${fitChatWindowStyle}
                </head>
                <body>
                    <script type="application/javascript">
                        ${iframeBootstrapScript}
                        window.GORGIASCHAT_LANGUAGE = "${language ? `'${LANGUAGE_TO_LOCALE_MAPPING[language]}'` : undefined};"
                        ${
                            language
                                ? `
                                    Object.defineProperty(navigator, 'language', { value: '${LANGUAGE_TO_LOCALE_MAPPING[language]}', configurable: true });
                                    Object.defineProperty(navigator, 'languages', { value: ['${LANGUAGE_TO_LOCALE_MAPPING[language]}'], configurable: true });
                                `
                                : ''
                        }
                    </script>
                    ${script.outerHTML}
                </body>
            </html>
        `
        }, [installationSnippet?.snippet, language, fitChatWindowHeight])

        useEffect(() => {
            if (
                installationSnippetError ||
                (installationSnippet?.snippet && !iframeSourceDoc)
            ) {
                setHasError(true)
            }
        }, [
            installationSnippet?.snippet,
            iframeSourceDoc,
            installationSnippetError,
        ])

        useImperativeHandle(ref, () => ({
            iframeRef,
            isLoaded,
            hasError,
        }))

        const handleReload = () => {
            setHasError(false)
            setIsWidgetLoaded(false)
            if (installationSnippetError) {
                refetchInstallationSnippet()
            }
        }

        if (hasError) {
            return <ChatPreviewErrorState onReload={handleReload} />
        }

        return (
            <>
                {isLoading && <ChatPreviewLoading />}
                <iframe
                    ref={iframeRef}
                    className={css.previewIframe}
                    srcDoc={iframeSourceDoc || ''}
                    title="helpdesk-chat-preview-iframe"
                    sandbox="allow-scripts allow-same-origin"
                    tabIndex={-1}
                    style={{ display: isLoaded ? undefined : 'none' }}
                />
            </>
        )
    },
)
