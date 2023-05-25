import React, {useState} from 'react'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import CountryFlag from 'pages/phoneNumbers/CountryFlag'
import {WhatsAppTemplate} from 'models/integration/types'
import WhatsAppTemplateStatusLabel from './WhatsAppTemplateStatusLabel'
import WhatsAppTemplateCategoryLabel from './WhatsAppTemplateCategoryLabel'
import {whatsAppFlagCodes} from './constants'
import WhatsAppTemplateDetailsDrawer from './WhatsAppTemplateDetailsDrawer'

import css from './WhatsAppTemplatesList.less'

const mockTemplates = [
    {
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
        language: 'en_US',
        name: 'sample_purchase_feedback',
        status: 'REJECTED',
        rejected_reason: 'INVALID_FORMAT',
        quality_score: 'UNKNOWN',
        waba_id: '123128413183132',
        created_datetime: 'datetime',
        updated_datetime: 'datetime',
        deactivated_datetime: 'datetime',
    } as WhatsAppTemplate,
] as WhatsAppTemplate[]

export default function WhatsAppTemplatesList() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [currentTemplate, setCurrentTemplate] = useState<WhatsAppTemplate>()
    return (
        <div>
            <p className={css.intro}>
                Use a message template to start a conversation with a new
                customer or to continue one outside of the 24 hour response
                window.Only templates with an "Active" status from WhatsApp can
                be sent to customers.
            </p>
            <TableWrapper className={css.tableWrapper}>
                <TableHead>
                    <HeaderCellProperty title="Template name" />
                    <HeaderCellProperty title="Category" />
                    <HeaderCellProperty title="Status" />
                    <HeaderCellProperty title="Language" />
                </TableHead>
                <TableBody>
                    {mockTemplates.map((template) => (
                        <TableBodyRow
                            key={template.id}
                            onClick={() => {
                                setCurrentTemplate(template)
                                setIsDrawerOpen(true)
                            }}
                        >
                            <BodyCell>
                                <strong>{template.name}</strong>
                            </BodyCell>
                            <BodyCell>
                                <WhatsAppTemplateCategoryLabel
                                    category={template.category}
                                />
                            </BodyCell>
                            <BodyCell>
                                <WhatsAppTemplateStatusLabel
                                    status={template.status}
                                />
                            </BodyCell>
                            <BodyCell>
                                <CountryFlag
                                    countryCode={
                                        whatsAppFlagCodes[template.language]
                                    }
                                    withRoundFlag
                                />
                            </BodyCell>
                        </TableBodyRow>
                    ))}
                </TableBody>
            </TableWrapper>
            {currentTemplate && (
                <WhatsAppTemplateDetailsDrawer
                    isOpen={isDrawerOpen}
                    setIsOpen={setIsDrawerOpen}
                    template={currentTemplate}
                />
            )}
        </div>
    )
}
