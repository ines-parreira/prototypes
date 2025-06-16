import useAppDispatch from 'hooks/useAppDispatch'
import { useGetHelpCenterArticle } from 'models/helpCenter/queries'
import { HelpCenter } from 'models/helpCenter/types'
import {
    CONTENT_TYPE,
    IngestedResourceStatus,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import ScrapedDomainSelectedContent from 'pages/aiAgent/AiAgentScrapedDomainContent/ScrapedDomainSelectedContent'
import { BaseArticle } from 'pages/aiAgent/AiAgentScrapedDomainContent/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type Props = {
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
    isOpened,
    handleOnClose,
    article,
    helpCenter,
    onUpdateStatus,
}: Props) => {
    const dispatch = useAppDispatch()

    const { isError, data, isLoading } = useGetHelpCenterArticle(
        article?.id ?? 0,
        helpCenter.id,
        helpCenter.default_locale,
        {
            enabled: !!article?.id,
        },
    )

    if (isError) {
        void dispatch(
            notify({
                status: NotificationStatus.Error,
                message: 'Error loading article details',
                showDismissButton: true,
            }),
        )
        handleOnClose()
    }

    return (
        <ScrapedDomainSelectedContent
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
