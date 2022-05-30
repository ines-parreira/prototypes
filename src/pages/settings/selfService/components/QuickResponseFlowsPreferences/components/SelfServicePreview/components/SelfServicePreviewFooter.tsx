import React from 'react'
import {Button} from 'reactstrap'
import gorgiasChatSendMessageIcon from 'assets/img/integrations/gorgias-chat-send-message-icon.svg'
import css from '../SelfServicePreview.less'

type Props = {
    sspTexts: {[key: string]: string}
    backgroundColor?: string
}

export const SelfServicePreviewFooter = ({
    sspTexts,
    backgroundColor,
}: Props) => {
    return (
        <div className={css.footer}>
            <span className={css.needHelpText}>{sspTexts.needHelp}</span>
            <Button
                color="primary"
                style={{
                    backgroundColor,
                    borderColor: backgroundColor,
                }}
            >
                <img
                    className={css.sendMessageIcon}
                    src={gorgiasChatSendMessageIcon}
                    alt="send message icon"
                />

                {sspTexts.sendUsAMessage}
            </Button>
        </div>
    )
}
