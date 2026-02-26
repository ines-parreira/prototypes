import { Button } from '@gorgias/axiom'

import gorgiasChatSendMessageIcon from 'assets/img/integrations/gorgias-chat-send-message-icon.svg'
import {
    CONSTRAST_COLORS,
    getTextColorBasedOnBackground,
} from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/color-utils'

import css from './SelfServiceChatIntegrationFooter.less'

type Props = {
    sspTexts: Record<string, string>
    color: string
}

const SelfServiceChatIntegrationFooter = ({ sspTexts, color }: Props) => {
    const textColor = getTextColorBasedOnBackground(color)
    return (
        <div className={css.container}>
            {sspTexts.needHelp}
            <Button
                style={{
                    backgroundColor: color,
                    borderColor: color,
                    color: textColor,
                }}
            >
                <img
                    className={css.icon}
                    src={gorgiasChatSendMessageIcon}
                    alt=""
                    style={{
                        filter: `invert(${
                            textColor === CONSTRAST_COLORS.LIGHT ? 0 : 1
                        })`,
                    }}
                />
                {sspTexts.sendUsAMessage}
            </Button>
        </div>
    )
}

export default SelfServiceChatIntegrationFooter
