import { useEffect } from 'react'

import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { ChatPreviewPanel } from '../components/ChatPreviewPanel/ChatPreviewPanel'

export const useChatPreviewPanel = () => {
    const { setCollapsibleColumnChildren, setIsCollapsibleColumnOpen } =
        useCollapsibleColumn()

    useEffect(() => {
        setIsCollapsibleColumnOpen(true)
        setCollapsibleColumnChildren(<ChatPreviewPanel />)

        return () => {
            setIsCollapsibleColumnOpen(false)
            setCollapsibleColumnChildren(null)
        }
    }, [setCollapsibleColumnChildren, setIsCollapsibleColumnOpen])
}
