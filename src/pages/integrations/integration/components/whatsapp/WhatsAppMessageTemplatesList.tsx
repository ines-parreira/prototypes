import React, {useState} from 'react'
import {Tooltip} from '@gorgias/ui-kit'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import CountryFlag from 'pages/phoneNumbers/CountryFlag'
import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'
import useAppSelector from 'hooks/useAppSelector'
import {getNewPhoneNumber} from 'state/entities/phoneNumbers/selectors'
import {useListWhatsAppMessageTemplates} from 'models/whatsAppMessageTemplates/queries'
import {getLanguageDisplayName} from 'utils'
import useOrderBy from 'hooks/useOrderBy'
import WhatsAppMessageTemplateStatusLabel from './WhatsAppMessageTemplateStatusLabel'
import WhatsAppMessageTemplateCategoryLabel from './WhatsAppMessageTemplateCategoryLabel'
import {whatsAppFlagCodes} from './constants'
import WhatsAppMessageTemplateDetailsDrawer from './WhatsAppMessageTemplateDetailsDrawer'
import {normalizeLocale} from './utils'

import css from './WhatsAppMessageTemplatesList.less'

type Props = {
    phoneNumberId: number
}

export default function WhatsAppMessageTemplatesList({phoneNumberId}: Props) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [currentTemplate, setCurrentTemplate] =
        useState<WhatsAppMessageTemplate>()
    const phoneNumber = useAppSelector(getNewPhoneNumber(phoneNumberId))

    const {orderDirection, orderBy, orderParam, toggleOrderBy} = useOrderBy<
        'name' | 'language' | 'status' | 'category'
    >('status')

    const request = useListWhatsAppMessageTemplates({
        waba_id: phoneNumber?.whatsapp_phone_number?.waba_id,
        ...(orderParam && {order_by: orderParam}),
    })

    return (
        <div className={css.container}>
            <div className={css.intro}>
                <p>
                    Use a message template to start a conversation with a new
                    customer or to continue one outside of the 24 hour response
                    window.
                </p>
                <p>
                    Only templates with an "Active" status from WhatsApp can be
                    sent to customers.
                </p>
            </div>
            <TableWrapper className={css.tableWrapper}>
                <TableHead>
                    <HeaderCellProperty
                        title="Template name"
                        direction={orderDirection}
                        isOrderedBy={orderBy === 'name'}
                        onClick={() => toggleOrderBy('name')}
                    />
                    <HeaderCellProperty
                        title="Category"
                        direction={orderDirection}
                        isOrderedBy={orderBy === 'category'}
                        onClick={() => toggleOrderBy('category')}
                    />
                    <HeaderCellProperty
                        title="Status"
                        direction={orderDirection}
                        isOrderedBy={orderBy === 'status'}
                        onClick={() => toggleOrderBy('status')}
                    />
                    <HeaderCellProperty
                        title="Language"
                        direction={orderDirection}
                        isOrderedBy={orderBy === 'language'}
                        onClick={() => toggleOrderBy('language')}
                    />
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
                                    showTooltip
                                />
                            </BodyCell>
                            <BodyCell>
                                <CountryFlag
                                    countryCode={
                                        whatsAppFlagCodes[template.language]
                                    }
                                    withRoundFlag
                                    id={`template-language-country-flag-${template.id}`}
                                />
                                <Tooltip
                                    target={`template-language-country-flag-${template.id}`}
                                    placement="top"
                                >
                                    {getLanguageDisplayName(
                                        normalizeLocale(template.language)
                                    )}
                                </Tooltip>
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
