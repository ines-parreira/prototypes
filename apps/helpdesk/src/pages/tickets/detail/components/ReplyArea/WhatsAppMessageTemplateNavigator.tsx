import React, { useEffect, useState } from 'react'

import classNames from 'classnames'
import { ReactCountryFlag } from 'react-country-flag'

import useAppSelector from 'hooks/useAppSelector'
import { isWhatsAppIntegration } from 'models/integration/types'
import { SourceAddress } from 'models/ticket/types'
import { useListWhatsAppMessageTemplates } from 'models/whatsAppMessageTemplates/queries'
import {
    WhatsAppMessageTemplate,
    WhatsAppMessageTemplateStatus,
} from 'models/whatsAppMessageTemplates/types'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import Loader from 'pages/common/components/Loader/Loader'
import { whatsAppFlagCodes } from 'pages/integrations/integration/components/whatsapp/constants'
import useWhatsAppEditor from 'pages/integrations/integration/components/whatsapp/useWhatsAppEditor'
import WhatsAppMessageTemplateMessage from 'pages/integrations/integration/components/whatsapp/WhatsAppMessageTemplateMessage'
import { getNewPhoneNumberByNumber } from 'state/entities/phoneNumbers/selectors'
import { getIntegrations } from 'state/integrations/selectors'
import { makeGetNewMessageSourceProperty } from 'state/newMessage/selectors'

import css from './WhatsAppMessageTemplateNavigator.less'

export default function WhatsAppMessageTemplateNavigator() {
    const [currentTemplate, setCurrentTemplate] =
        useState<WhatsAppMessageTemplate>()

    const fromPhoneNumber = useAppSelector(makeGetNewMessageSourceProperty)(
        'from',
    )?.toJS?.() as SourceAddress
    const phoneNumber = useAppSelector(
        getNewPhoneNumberByNumber(fromPhoneNumber?.address),
    )
    const integrations = useAppSelector(getIntegrations)
    const currentIntegration = integrations?.find(
        (integration) =>
            isWhatsAppIntegration(integration) &&
            integration.meta.routing?.phone_number === fromPhoneNumber?.address,
    )

    const { searchFilter, selectNewTemplate } = useWhatsAppEditor()
    const { data, isLoading, refetch } = useListWhatsAppMessageTemplates({
        is_supported: true,
        waba_id: phoneNumber?.whatsapp_phone_number?.waba_id,
        status: WhatsAppMessageTemplateStatus.Approved,
        language: searchFilter.language,
        search: searchFilter.name,
    })

    const templates = data?.data ?? []

    useEffect(() => {
        if (data?.data?.length) {
            setCurrentTemplate(data?.data[0])
        }
    }, [data?.data])

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
                {searchFilter.language.length || searchFilter.name ? (
                    <>
                        <p>No templates found</p>
                        <p>
                            You may want to try using a different template name
                            or check for typos.
                        </p>
                    </>
                ) : (
                    <div data-testid="missing-templates-instructions">
                        <p>
                            The 24-hour window to respond to this WhatsApp
                            message has expired. Re-engage the customer using
                            approved message templates in order to reset the
                            reply window.
                        </p>
                        <p>
                            {currentIntegration?.name ?? 'This integration'}{' '}
                            does not currently have any approved templates. To
                            create new message templates, please visit the{' '}
                            <a
                                href="https://business.facebook.com/wa/manage/message-templates/"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                WhatsApp Business Manager
                            </a>
                            .
                        </p>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={css.container}>
            {/* TODO handle onLoad */}
            <InfiniteScroll
                className={css.list}
                shouldLoadMore={false}
                onLoad={() => refetch()}
            >
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className={classNames(css.item, {
                            [css.active]: currentTemplate?.id === template.id,

                            [css.disabled]: false,
                        })}
                        onClick={() => {
                            selectNewTemplate(template)
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
