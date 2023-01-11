import React from 'react'

import ReactPlayer from 'react-player'

import {extractGorgiasVideoDivFromHtmlContent} from 'utils'
import Avatar from 'pages/common/components/Avatar/Avatar'
import GorgiasChatPoweredBy from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/GorgiasChatPoweredBy'

import {CampaignProduct} from '../../../../types/CampaignProduct'

import {ProductCarousel} from '../ProductCarousel'

import css from './ChatCampaign.less'

type Props = {
    authorAvatarUrl?: string
    authorName?: string
    html: string
    products?: CampaignProduct[]
    translatedTexts: Record<string, string>
}

export const ChatCampaign = ({
    authorAvatarUrl,
    authorName,
    html,
    products = [],
    translatedTexts,
}: Props) => {
    const {videoUrls, htmlCleaned} = extractGorgiasVideoDivFromHtmlContent(html)

    return (
        <div className={css.campaign}>
            <div className={css.content}>
                <div className={css.header}>
                    <div className={css.author}>
                        <Avatar
                            key={authorAvatarUrl}
                            className={css.authorAvatar}
                            name={authorName || 'Random agent'}
                            url={authorAvatarUrl}
                        />
                    </div>
                    <div className={css.message}>
                        <div className={css.authorName}>
                            <b>{authorName || "[Random agent's name]"}</b>
                        </div>
                        <div
                            className={css.messageText}
                            dangerouslySetInnerHTML={{
                                __html: htmlCleaned,
                            }}
                        />
                    </div>
                </div>
            </div>
            {videoUrls.length > 0 && (
                <div className={css.videos}>
                    {videoUrls.map((url, idx) => (
                        <div key={idx} className={css.video}>
                            <ReactPlayer
                                url={url}
                                controls={true}
                                light={false}
                                width="100%"
                                height="100%"
                            />
                        </div>
                    ))}
                </div>
            )}
            {products.length > 0 && (
                <div>
                    <ProductCarousel products={products} />
                </div>
            )}

            <GorgiasChatPoweredBy translatedTexts={translatedTexts} />

            <div className={css.footer}>
                {translatedTexts.campaignClickToReply}
            </div>
        </div>
    )
}
