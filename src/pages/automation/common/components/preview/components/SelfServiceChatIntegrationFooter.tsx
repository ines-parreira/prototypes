import React from 'react'

import Button from 'pages/common/components/button/Button'
import gorgiasChatSendMessageIcon from 'assets/img/integrations/gorgias-chat-send-message-icon.svg'

import css from './SelfServiceChatIntegrationFooter.less'

type Props = {
    sspTexts: Record<string, string>
}

const SelfServiceChatIntegrationFooter = ({sspTexts}: Props) => {
    return (
        <div className={css.container}>
            {sspTexts.needHelp}
            <Button>
                <img
                    className={css.icon}
                    src={gorgiasChatSendMessageIcon}
                    alt=""
                />
                {sspTexts.sendUsAMessage}
            </Button>
        </div>
    )
}

export default SelfServiceChatIntegrationFooter
