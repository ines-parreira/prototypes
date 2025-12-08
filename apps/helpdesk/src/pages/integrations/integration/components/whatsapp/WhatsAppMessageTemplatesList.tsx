import { useState } from 'react'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import IconLink from 'core/ui/components/IconLink'
import useAppSelector from 'hooks/useAppSelector'
import useOrderBy from 'hooks/useOrderBy'
import { useListWhatsAppMessageTemplates } from 'models/whatsAppMessageTemplates/queries'
import type { WhatsAppMessageTemplate } from 'models/whatsAppMessageTemplates/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import CountryFlag from 'pages/phoneNumbers/CountryFlag'
import { getNewPhoneNumber } from 'state/entities/phoneNumbers/selectors'
import { getLanguageDisplayName } from 'utils'

import { whatsAppFlagCodes } from './constants'
import { normalizeLocale } from './utils'
import WhatsAppMessageTemplateCategoryLabel from './WhatsAppMessageTemplateCategoryLabel'
import WhatsAppMessageTemplateDetailsDrawer from './WhatsAppMessageTemplateDetailsDrawer'
import WhatsAppMessageTemplateStatusLabel from './WhatsAppMessageTemplateStatusLabel'

import css from './WhatsAppMessageTemplatesList.less'

type Props = {
    phoneNumberId: number
}

export default function WhatsAppMessageTemplatesList({ phoneNumberId }: Props) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [currentTemplate, setCurrentTemplate] =
        useState<WhatsAppMessageTemplate>()
    const phoneNumber = useAppSelector(getNewPhoneNumber(phoneNumberId))

    const { orderDirection, orderBy, orderParam, toggleOrderBy } = useOrderBy<
        'name' | 'language' | 'status' | 'category'
    >('status')

    const request = useListWhatsAppMessageTemplates({
        waba_id: phoneNumber?.whatsapp_phone_number?.waba_id,
        ...(orderParam && { order_by: orderParam }),
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
                    {`Only templates with an "Active" status from WhatsApp can be
                    sent to customers.`}
                </p>
                <IconLink
                    className="mt-2"
                    href="https://link.gorgias.com/5ba90d"
                    icon="menu_book"
                    content="How To Use WhatsApp Message Templates"
                />
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
                                        normalizeLocale(template.language),
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
