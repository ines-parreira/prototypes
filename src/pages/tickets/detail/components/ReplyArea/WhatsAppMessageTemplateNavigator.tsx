import React, {useState} from 'react'
import classNames from 'classnames'
import {ReactCountryFlag} from 'react-country-flag'
import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import WhatsAppMessageTemplateMessage from 'pages/integrations/integration/components/whatsapp/WhatsAppMessageTemplateMessage'
import {whatsAppFlagCodes} from 'pages/integrations/integration/components/whatsapp/constants'
import {useListWhatsAppMessageTemplates} from 'models/whatsAppMessageTemplates/queries'

import css from './WhatsAppMessageTemplateNavigator.less'

type Props = {
    onItemClick: (template: WhatsAppMessageTemplate) => void
    templates: WhatsAppMessageTemplate[]
}

export default function WhatsAppMessageTemplateNavigator({
    onItemClick,
    templates,
}: Props) {
    const [currentTemplate, setCurrentTemplate] =
        useState<WhatsAppMessageTemplate>(templates[0])
    const {refetch} = useListWhatsAppMessageTemplates()

    // TODO check if template can ever be disabled
    const isDisabled = false

    return (
        <div className={css.container}>
            {/* TODO handle onLoad */}
            {/* eslint-disable-next-line prettier/prettier */}
            <InfiniteScroll
                className={css.list}
                shouldLoadMore={false}
                onLoad={refetch}
            >
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className={classNames(css.item, {
                            [css.active]: currentTemplate?.id === template.id,

                            [css.disabled]: false,
                        })}
                        onClick={() => {
                            if (isDisabled) return

                            onItemClick(template)
                        }}
                        onMouseEnter={() => setCurrentTemplate(template)}
                    >
                        <div className={css.name}>{template.name}</div>

                        <div className={css.flag}>
                            <ReactCountryFlag
                                countryCode={
                                    whatsAppFlagCodes[template.language]
                                }
                            />
                        </div>
                    </div>
                ))}
            </InfiniteScroll>
            {currentTemplate && (
                <div className={css.templateMessage}>
                    <WhatsAppMessageTemplateMessage
                        template={currentTemplate}
                    />
                </div>
            )}
        </div>
    )
}
