import classnames from 'classnames'

import graphicTShirt from 'assets/img/self-service/graphic-t-shirt.png'
import {
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_SSP_TEXTS,
} from 'config/integrations/gorgias_chat'
import { GorgiasChatIntegration } from 'models/integration/types'

import useOrderDates from './hooks/useOrderDates'
import { useSelfServicePreviewContext } from './SelfServicePreviewContext'

import css from './SelfServiceChatIntegrationTrackUnfulfillResponsePage.less'

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationTrackUnfilFillResponsePage = ({
    integration,
}: Props) => {
    const language = getPrimaryLanguageFromChatConfig(integration.meta)
    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[language]

    const { automatedResponseMessageContent } = useSelfServicePreviewContext()

    const { etaDate, inTransitDate } = useOrderDates(language)

    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.titleContainer}>
                    <div className={css.title}>{sspTexts.order} #3089</div>
                    <span className={css.description}>
                        {sspTexts.fulfillment} 1 {sspTexts.of} 1 –{' '}
                        <span className={css.descriptionSeeItems}>
                            {sspTexts.seeItems}
                        </span>
                    </span>
                </div>
                <img
                    className={css.thumbnail}
                    src={graphicTShirt}
                    height={48}
                    width={48}
                    alt=""
                />
            </div>
            <div className={css.separator} />
            <div className={css.timelineContainer}>
                <div className={css.timelineItems}>
                    <div className={css.timelineItem}>
                        <div className={css.timeline}>
                            <div
                                className={classnames(
                                    css.timelineDot,
                                    css.isCurrent,
                                )}
                            />
                            <div className={css.timelineLine} />
                        </div>
                        <div className={css.timelineItemContent}>
                            <div>
                                <div
                                    className={classnames(
                                        css.timelineItemStatus,
                                        css.isCurrent,
                                    )}
                                >
                                    {sspTexts.checkpointOrderPlaced}
                                </div>
                                <div className={css.timelineItemTimestamp}>
                                    {inTransitDate.format('L - hh:mm a')}
                                </div>
                            </div>
                            <div
                                className={css.timelineItemDescription}
                                dangerouslySetInnerHTML={{
                                    __html:
                                        automatedResponseMessageContent?.html ||
                                        '',
                                }}
                            ></div>
                        </div>
                    </div>
                    <div className={css.timelineItem}>
                        <div className={css.timeline}>
                            <div
                                className={classnames(
                                    css.timelineDot,
                                    css.isUpcoming,
                                )}
                            />
                        </div>
                        <div className={css.timelineItemContent}>
                            <div
                                className={classnames(
                                    css.timelineItemStatus,
                                    css.isUpcoming,
                                )}
                            >
                                {sspTexts.confirmed}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={css.timelineLastUpdated}>
                    {sspTexts.lastUpdated}{' '}
                    {etaDate.clone().subtract(2, 'hours').from(etaDate.clone())}
                </div>
            </div>
            <div className={css.separator} />
        </div>
    )
}

export default SelfServiceChatIntegrationTrackUnfilFillResponsePage
