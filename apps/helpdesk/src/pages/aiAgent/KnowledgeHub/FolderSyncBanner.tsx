import { Banner, Loader } from '@gorgias/axiom'

import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'

export type FolderSyncStatus = 'syncing' | 'success' | 'error'

type Props = {
    status: FolderSyncStatus
    folderType: KnowledgeType
}

export const FolderSyncBanner = ({ status, folderType }: Props) => {
    const sourceLabel =
        folderType === KnowledgeType.Domain ? 'store website' : 'URL'

    switch (status) {
        case 'syncing':
            return (
                <Banner
                    variant="inline"
                    intent="info"
                    icon={<Loader size="sm" aria-label="Syncing" />}
                    isClosable
                    description={`Your ${sourceLabel} is syncing. This may take a moment...`}
                />
            )
        case 'success':
            return (
                <Banner
                    variant="inline"
                    intent="success"
                    isClosable
                    description="URL has synced successfully and is in use by the AI Agent. Review generated content for accuracy."
                />
            )
        case 'error':
            return (
                <Banner
                    variant="inline"
                    intent="destructive"
                    isClosable
                    description="We couldn't sync your URL. AI Agent is using your previous content. Please try again or contact support if the issue persists."
                />
            )
        default:
            return null
    }
}
