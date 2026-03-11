import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'

import { useGetInstallationSnippet } from 'models/integration/queries'
import { ChatPreviewErrorState } from 'pages/integrations/integration/components/gorgias_chat/components/revamp/ChatPreview/ChatPreviewErrorState'
import { ChatPreviewLoading } from 'pages/integrations/integration/components/gorgias_chat/components/revamp/ChatPreview/ChatPreviewLoading'

import iframeBootstrapScript from './ChatPreviewBootstrapScript.js?raw'

import css from './ChatPreview.less'

type Props = {
    appId: string
}

export type ChatPreviewHandle = {
    displayPage: (page: 'homepage' | 'conversation') => void
}

export const ChatPreview = forwardRef<ChatPreviewHandle, Props>(
    ({ appId }, ref) => {
        const iframeRef = useRef<HTMLIFrameElement>(null)
        const [isWidgetLoaded, setIsWidgetLoaded] = useState(false)
        const [hasError, setHasError] = useState(false)
        const {
            data: installationSnippet,
            isLoading: installationSnippetLoading,
            isError: installationSnippetError,
        } = useGetInstallationSnippet(
            {
                applicationId: appId,
            },
            { retry: 2 },
        )

        const isLoading = useMemo(() => {
            return installationSnippetLoading || !isWidgetLoaded
        }, [installationSnippetLoading, isWidgetLoaded])

        useEffect(() => {
            setIsWidgetLoaded(false)
            setHasError(false)
        }, [appId])

        useEffect(() => {
            const handleMessage = (event: MessageEvent) => {
                if (event.data?.type === 'helpdesk-chat-preview-loaded') {
                    setIsWidgetLoaded(true)
                } else if (event.data?.type === 'helpdesk-chat-preview-error') {
                    setHasError(true)
                }
            }

            window.addEventListener('message', handleMessage)
            return () => window.removeEventListener('message', handleMessage)
        }, [])

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

            script.src = scriptSrc.toString()

            return `
            <script type="application/javascript">${iframeBootstrapScript}</script>
            ${script.outerHTML}
        `
        }, [installationSnippet?.snippet])

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
            displayPage: (page: 'homepage' | 'conversation') => {
                iframeRef.current?.contentWindow?.GorgiasChat?.open()
                iframeRef.current?.contentWindow?.GorgiasChat?.setPage(page)
            },
        }))

        if (hasError) {
            return <ChatPreviewErrorState />
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
                    style={{ display: isWidgetLoaded ? undefined : 'none' }}
                />
            </>
        )
    },
)
