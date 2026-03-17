import { useEffect } from 'react'

import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { ConnectedChannelsPreviewPanel } from '../components/ConnectedChannelsPreviewPanel/ConnectedChannelsPreviewPanel'

export const useConnectedChannelsPreviewPanel = () => {
    const { setCollapsibleColumnChildren, setIsCollapsibleColumnOpen } =
        useCollapsibleColumn()

    useEffect(() => {
        setIsCollapsibleColumnOpen(true)
        setCollapsibleColumnChildren(<ConnectedChannelsPreviewPanel />)

        return () => {
            setIsCollapsibleColumnOpen(false)
            setCollapsibleColumnChildren(null)
        }
    }, [setCollapsibleColumnChildren, setIsCollapsibleColumnOpen])
}
