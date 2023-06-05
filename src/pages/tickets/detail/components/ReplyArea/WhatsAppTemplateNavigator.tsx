import React, {useState} from 'react'
import classNames from 'classnames'
import {ReactCountryFlag} from 'react-country-flag'
import {WhatsAppTemplate} from 'models/integration/types'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import WhatsAppTemplateMessage from 'pages/integrations/integration/components/whatsapp/WhatsAppTemplateMessage'
import {whatsAppFlagCodes} from 'pages/integrations/integration/components/whatsapp/constants'

import css from './WhatsAppTemplateNavigator.less'

const mockTemplate = {
    components: {
        header: {
            type: 'text',
            value: 'LOGIN ATTEMPT',
        },
        body: {
            type: 'text',
            value: "Hey {{1}},\\nHere's your https://www.google.com one-time password:  *{{2}}*\\nCode expires in 30 minutes.",
        },
        footer: {
            type: 'text',
            value: 'If you never requested this code, please ignore the message.',
        },
        button: {
            type: 'url',
            value: 'https://app.mobile.me.app/{{1}}',
        },
    },
    category: 'MARKETING',
    id: '100500',
    external_id: '1184662202111735',
    language: 'ca',
    name: 'sample_purchase_feedback',
    status: 'REJECTED',
    rejected_reason: 'INVALID_FORMAT',
    quality_score: 'UNKNOWN',
    waba_id: '123128413183132',
    created_datetime: 'datetime',
    updated_datetime: 'datetime',
    deactivated_datetime: 'datetime',
} as WhatsAppTemplate

const mockTemplates = Array(5)
    .fill(mockTemplate)
    .map(
        (template, index) =>
            ({
                ...template,
                id: index.toString(),
            } as WhatsAppTemplate)
    )

type Props = {
    onItemClick: (template: WhatsAppTemplate) => void
    templates: WhatsAppTemplate[]
}

export default function WhatsAppTemplateNavigator({
    onItemClick,
    templates = mockTemplates,
}: Props) {
    const [currentTemplate, setCurrentTemplate] = useState<WhatsAppTemplate>(
        templates[0]
    )

    // TODO check if template can ever be disabled
    const isDisabled = false

    return (
        <div className={css.container}>
            {/* TODO handle onLoad */}
            {/* eslint-disable-next-line prettier/prettier */}
            <InfiniteScroll
                className={css.list}
                shouldLoadMore
                onLoad={function (): Promise<any> {
                    throw new Error('Function not implemented.')
                }}
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
                    <WhatsAppTemplateMessage template={currentTemplate} />
                </div>
            )}
        </div>
    )
}
