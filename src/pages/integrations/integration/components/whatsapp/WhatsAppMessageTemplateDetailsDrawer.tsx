import React, {useState} from 'react'
import {ReactCountryFlag} from 'react-country-flag'
import IconButton from 'pages/common/components/button/IconButton'
import {Drawer} from 'pages/common/components/Drawer'
import Label from 'pages/common/forms/Label/Label'
import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'
import Alert from 'pages/common/components/Alert/Alert'
import Card from 'pages/stats/Card'

import {getLanguageDisplayName} from 'utils'
import css from './WhatsAppMessageTemplateDetailsDrawer.less'
import WhatsAppMessageTemplateMessage from './WhatsAppMessageTemplateMessage'
import {templateAlertContent, whatsAppFlagCodes} from './constants'
import WhatsAppMessageTemplateStatusLabel from './WhatsAppMessageTemplateStatusLabel'
import WhatsAppMessageTemplateCategoryLabel from './WhatsAppMessageTemplateCategoryLabel'
import {normalizeLocale} from './utils'

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

    const alertContent =
        templateAlertContent[
            template.status as keyof typeof templateAlertContent
        ]

    return (
        <Drawer
            name="voice-message"
            open={isOpen}
            fullscreen={false}
            isLoading={false}
            portalRootId="app-root"
            onBackdropClick={() => setIsOpen(false)}
        >
            <Drawer.Header>
                <h3 className={css.headerTitle}>{template.name}</h3>
                <Drawer.HeaderActions>
                    <IconButton
                        fillStyle="ghost"
                        intent="secondary"
                        onClick={() => setIsOpen(false)}
                    >
                        keyboard_tab
                    </IconButton>
                </Drawer.HeaderActions>
            </Drawer.Header>
            <Drawer.Content>
                {alertContent && isAlertVisible && (
                    <Alert
                        type={alertContent.type}
                        onClose={() => setIsAlertVisible(false)}
                        customActions={
                            <a
                                href={alertContent.learnMore}
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
                                    normalizeLocale(template.language)
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <Label>Message</Label>
                <p className={css.messageDescription}>
                    Template content can be managed in your{' '}
                    <a href="TODO" target="_blank" rel="noreferrer noopener">
                        WhatsApp Business Manager
                    </a>
                    .
                </p>
                <Card className={css.messageContainer}>
                    <WhatsAppMessageTemplateMessage template={template} />
                </Card>
            </Drawer.Content>
        </Drawer>
    )
}
