import React, { useState } from 'react'

import { ReactCountryFlag } from 'react-country-flag'

import { Card } from '@gorgias/analytics-ui-kit'
import { Label } from '@gorgias/axiom'

import { WhatsAppMessageTemplate } from 'models/whatsAppMessageTemplates/types'
import Alert from 'pages/common/components/Alert/Alert'
import { Drawer } from 'pages/common/components/Drawer'
import { getLanguageDisplayName } from 'utils'

import { templateAlertContent, whatsAppFlagCodes } from './constants'
import { normalizeLocale } from './utils'
import WhatsAppMessageTemplateCategoryLabel from './WhatsAppMessageTemplateCategoryLabel'
import WhatsAppMessageTemplateMessage from './WhatsAppMessageTemplateMessage'
import WhatsAppMessageTemplateStatusLabel from './WhatsAppMessageTemplateStatusLabel'

import css from './WhatsAppMessageTemplateDetailsDrawer.less'

type Props = {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    template: WhatsAppMessageTemplate
}

export default function WhatsAppMessageTemplateDetailsDrawer({
    isOpen,
    setIsOpen,
    template,
}: Props) {
    const [isAlertVisible, setIsAlertVisible] = useState(true)

    const alertContent = templateAlertContent[template.status]

    return (
        <Drawer
            aria-label="Voice message"
            open={isOpen}
            fullscreen={false}
            isLoading={false}
            portalRootId="app-root"
            onBackdropClick={() => setIsOpen(false)}
            withFooter={false}
        >
            <Drawer.Header>
                <h3 className={css.headerTitle}>{template.name}</h3>
                <Drawer.HeaderActions
                    onClose={() => setIsOpen(false)}
                    closeButtonId="close-button"
                />
            </Drawer.Header>
            <Drawer.Content>
                {alertContent && isAlertVisible && (
                    <Alert
                        type={alertContent.type}
                        onClose={() => setIsAlertVisible(false)}
                        customActions={
                            <a
                                href={
                                    'https://developers.facebook.com/docs/whatsapp/message-templates/guidelines/'
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Learn more
                            </a>
                        }
                    >
                        {alertContent.message}
                    </Alert>
                )}
                <div className={css.propertiesWrapper}>
                    <div className={css.property}>
                        <Label>Status</Label>
                        <WhatsAppMessageTemplateStatusLabel
                            status={template.status}
                        />
                    </div>
                    <div className={css.property}>
                        <Label>Category</Label>
                        <WhatsAppMessageTemplateCategoryLabel
                            category={template.category}
                        />
                    </div>
                    <div className={css.property}>
                        <Label>Language</Label>
                        <div className={css.countryValue}>
                            <ReactCountryFlag
                                countryCode={
                                    whatsAppFlagCodes[template.language]
                                }
                            />
                            <div>
                                {getLanguageDisplayName(
                                    normalizeLocale(template.language),
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <Label>Message</Label>
                <p className={css.messageDescription}>
                    Template content can be managed in your{' '}
                    <a
                        href="https://business.facebook.com/wa/manage/message-templates/"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        WhatsApp Business Manager
                    </a>
                    .
                </p>
                <Card className={css.messageContainer}>
                    <WhatsAppMessageTemplateMessage
                        template={template}
                        isPreview
                    />
                </Card>
            </Drawer.Content>
        </Drawer>
    )
}
