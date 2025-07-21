import gorgiasChatSendMessageIcon from 'assets/img/integrations/gorgias-chat-send-message-icon-grey.svg'

import css from './SelfServiceChatIntegrationArticleRecommendationFooter.less'

type Props = {
    sspTexts: Record<string, string>
}

const SelfServiceChatIntegrationArticleRecommendationFooter = ({
    sspTexts,
}: Props) => {
    return (
        <div className={css.container}>
            {sspTexts.articleRecommendationInputPlaceholder}
            <img className={css.icon} src={gorgiasChatSendMessageIcon} alt="" />
        </div>
    )
}

export default SelfServiceChatIntegrationArticleRecommendationFooter
