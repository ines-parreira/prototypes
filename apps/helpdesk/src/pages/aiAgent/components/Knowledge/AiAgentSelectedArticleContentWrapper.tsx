import { toast } from '@gorgias/axiom'

import { useGetHelpCenterArticle } from 'models/helpCenter/queries'
import type { HelpCenter } from 'models/helpCenter/types'
import type { IngestedResourceStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { CONTENT_TYPE } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import ScrapedDomainSelectedContent from 'pages/aiAgent/AiAgentScrapedDomainContent/ScrapedDomainSelectedContent'
import type { BaseArticle } from 'pages/aiAgent/AiAgentScrapedDomainContent/types'

type Props = {
    shopName: string
    isOpened: boolean
    handleOnClose: () => void
    article: BaseArticle | null
    helpCenter: HelpCenter
    onUpdateStatus?: (
        id: number,
        { status }: { status: IngestedResourceStatus },
    ) => Promise<void>
    isUpdatingStatus: boolean
}

const AiAgentSelectedArticleContentWrapper = ({
    shopName,
    isOpened,
    handleOnClose,
    article,
    helpCenter,
    onUpdateStatus,
}: Props) => {
    const { isError, data, isLoading } = useGetHelpCenterArticle(
        article?.id ?? 0,
        helpCenter.id,
        helpCenter.default_locale,
        'current',
        {
            enabled: !!article?.id,
        },
    )

    if (isError) {
        toast.error('Error loading article details')
        handleOnClose()
    }

    return (
        <ScrapedDomainSelectedContent
            shopName={shopName}
            isOpened={isOpened}
            onClose={handleOnClose}
            selectedContent={article}
            contentType={CONTENT_TYPE.QUESTION}
            onUpdateStatus={onUpdateStatus}
            detail={data}
            isLoading={isOpened && isLoading && !data}
        />
    )
}

export default AiAgentSelectedArticleContentWrapper
