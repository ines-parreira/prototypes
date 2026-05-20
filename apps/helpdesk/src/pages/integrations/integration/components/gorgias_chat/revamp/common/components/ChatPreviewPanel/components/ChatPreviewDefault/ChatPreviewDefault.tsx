import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'

import { useGetPreviewInstallationSnippet } from 'models/integration/queries'

import type { ChatPreviewHandle } from '../ChatPreview/ChatPreview'
import iframeBootstrapScript from '../ChatPreview/ChatPreviewBootstrapScript.js?raw'
import { ChatPreviewErrorState } from '../ChatPreviewErrorState/ChatPreviewErrorState'
import { ChatPreviewLoading } from '../ChatPreviewLoading/ChatPreviewLoading'

import css from '../ChatPreview/ChatPreview.less'

/**
 * Renders the chat preview widget without requiring a real application ID.
 *
 * Instead of calling `getInstallationSnippet` (which needs a real app),
 * it fetches the preview bundle-loader script URL via
 * `useGetPreviewInstallationSnippet` and constructs the iframe directly.
 */
type Props = {
    onLoaded?: (gorgiasChat: NonNullable<Window['GorgiasChat']>) => void
}

export const ChatPreviewDefault = forwardRef<ChatPreviewHandle, Props>(
    ({ onLoaded }, ref) => {
        const iframeRef = useRef<HTMLIFrameElement>(null)
        const [isLoaded, setIsLoaded] = useState(false)
        const [hasError, setHasError] = useState(false)

        const {
            data: installationSnippet,
            isLoading: installationSnippetLoading,
            isError: installationSnippetError,
            refetch: refetchInstallationSnippet,
        } = useGetPreviewInstallationSnippet()

        const isLoading = useMemo(() => {
            return installationSnippetLoading || !isLoaded
        }, [installationSnippetLoading, isLoaded])

        useEffect(() => {
            const handleMessage = (event: MessageEvent) => {
                if (event.data?.type === 'helpdesk-chat-preview-loaded') {
                    setIsLoaded(true)
                    const gorgiasChat =
                        iframeRef.current?.contentWindow?.GorgiasChat
                    if (gorgiasChat) {
                        onLoaded?.(gorgiasChat)
                    }
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
                'rev',
                String(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
            )

            script.src = scriptSrc.toString()
            return `
            <html>
                <body>
                    <script type="application/javascript">
                        ${iframeBootstrapScript}
                    </script>
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
            setIsLoaded(false)
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
