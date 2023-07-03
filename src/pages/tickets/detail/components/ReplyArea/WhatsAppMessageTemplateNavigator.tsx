import React, {useState} from 'react'
import classNames from 'classnames'
import {ReactCountryFlag} from 'react-country-flag'
import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import WhatsAppMessageTemplateMessage from 'pages/integrations/integration/components/whatsapp/WhatsAppMessageTemplateMessage'
import {whatsAppFlagCodes} from 'pages/integrations/integration/components/whatsapp/constants'
import {useListWhatsAppMessageTemplates} from 'models/whatsAppMessageTemplates/queries'
import Loader from 'pages/common/components/Loader/Loader'

import css from './WhatsAppMessageTemplateNavigator.less'

type Props = {
    onItemClick: (template: WhatsAppMessageTemplate) => void
    templates: WhatsAppMessageTemplate[]
    isLoading?: boolean
}

export default function WhatsAppMessageTemplateNavigator({
    onItemClick,
    templates,
    isLoading,
}: Props) {
    const [currentTemplate, setCurrentTemplate] =
        useState<WhatsAppMessageTemplate>(templates[0])
    const {refetch} = useListWhatsAppMessageTemplates()

    // TODO check if template can ever be disabled
    const isDisabled = false

    if (isLoading) {
        return (
            <div className={css.container}>
                <Loader inline minHeight="50px" />
            </div>
        )
    }

    if (!templates.length) {
        return (
            <div className={classNames(css.container, css.noResults)}>
                <p>No templates found</p>
                <p>
                    You may want to try using a different template name or check
                    for typos.
                </p>
            </div>
        )
    }

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
