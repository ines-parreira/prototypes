import { useEffect } from 'react'

import { useParams } from 'react-router-dom'

import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { ConnectedChannelsPreviewPanel } from '../components/ConnectedChannelsPreviewPanel/ConnectedChannelsPreviewPanel'

export const useConnectedChannelsPreviewPanel = () => {
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)
    const hasChatChannels = chatChannels.length > 0

    const { setCollapsibleColumnChildren, setIsCollapsibleColumnOpen } =
        useCollapsibleColumn()

    useEffect(() => {
        if (!hasChatChannels) {
            setIsCollapsibleColumnOpen(false)
            setCollapsibleColumnChildren(null)
            return
        }

        setIsCollapsibleColumnOpen(true)
        setCollapsibleColumnChildren(<ConnectedChannelsPreviewPanel />)

        return () => {
            setIsCollapsibleColumnOpen(false)
            setCollapsibleColumnChildren(null)
        }
    }, [
        hasChatChannels,
        setCollapsibleColumnChildren,
        setIsCollapsibleColumnOpen,
    ])
}
