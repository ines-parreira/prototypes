import React, {useState} from 'react'
import {useListWhatsAppMessageTemplates} from 'models/whatsAppMessageTemplates/queries'

import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import CountryFlag from 'pages/phoneNumbers/CountryFlag'
import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'
import WhatsAppMessageTemplateStatusLabel from './WhatsAppMessageTemplateStatusLabel'
import WhatsAppMessageTemplateCategoryLabel from './WhatsAppMessageTemplateCategoryLabel'
import {whatsAppFlagCodes} from './constants'
import WhatsAppMessageTemplateDetailsDrawer from './WhatsAppMessageTemplateDetailsDrawer'

import css from './WhatsAppMessageTemplatesList.less'

export default function WhatsAppMessageTemplatesList() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [currentTemplate, setCurrentTemplate] =
        useState<WhatsAppMessageTemplate>()
    const request = useListWhatsAppMessageTemplates()
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
                    {request.data?.data.map((template) => (
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
                                <WhatsAppMessageTemplateCategoryLabel
                                    category={template.category}
                                />
                            </BodyCell>
                            <BodyCell>
                                <WhatsAppMessageTemplateStatusLabel
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
                <WhatsAppMessageTemplateDetailsDrawer
                    isOpen={isDrawerOpen}
                    setIsOpen={setIsDrawerOpen}
                    template={currentTemplate}
                />
            )}
        </div>
    )
}
