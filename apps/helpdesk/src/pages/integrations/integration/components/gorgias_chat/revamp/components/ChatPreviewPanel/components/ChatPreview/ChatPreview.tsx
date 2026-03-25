import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'
import type { RefObject } from 'react'

import { useGetInstallationSnippet } from 'models/integration/queries'

import { ChatPreviewErrorState } from '../ChatPreviewErrorState/ChatPreviewErrorState'
import { ChatPreviewLoading } from '../ChatPreviewLoading/ChatPreviewLoading'
import iframeBootstrapScript from './ChatPreviewBootstrapScript.js?raw'

import css from './ChatPreview.less'

type Props = {
    appId: string
}

export type ChatPreviewHandle = {
    iframeRef: RefObject<HTMLIFrameElement>
    isLoaded: boolean
    hasError: boolean
}

export const ChatPreview = forwardRef<ChatPreviewHandle, Props>(
    ({ appId }, ref) => {
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
            <html>
                <body>
                    <script type="application/javascript">${iframeBootstrapScript}</script>
                    ${script.outerHTML}
                </body>
            </html>
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
                    style={{ display: isLoaded ? undefined : 'none' }}
                />
            </>
        )
    },
)
