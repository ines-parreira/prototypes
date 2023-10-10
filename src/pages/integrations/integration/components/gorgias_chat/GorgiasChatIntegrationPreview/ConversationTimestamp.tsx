import classnames from 'classnames'
import moment from 'moment'

import React from 'react'

import {GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT} from 'config/integrations/gorgias_chat'

import {languageToLocale} from './utils/date'

import css from './ChatIntegrationPreview.less'

type Props = {
    language?: string
}

const ConversationTimestamp: React.FC<Props> = ({language}) => {
    const locale = languageToLocale(
        language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
    )

    return (
        <div className={classnames(css.conversationTimestamp)}>
            {moment().locale(locale).format('MMMM D')}
        </div>
    )
}

export default ConversationTimestamp
