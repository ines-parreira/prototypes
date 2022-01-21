import React from 'react'

import poweredByGorgiasIcon from 'assets/img/integrations/gorgias-chat-powered-by.svg'

import css from './GorgiasChatPoweredBy.less'

interface Props {
    translatedTexts: Record<string, string>
}

const PoweredByGorgias: React.FC<Props> = ({translatedTexts}: Props) => (
    <div className={css.poweredBy}>
        <div>
            <span>{translatedTexts.poweredBy}</span>

            <img src={poweredByGorgiasIcon} alt="powered-by" />
        </div>
    </div>
)

export default PoweredByGorgias
