import React, { useMemo } from 'react'

import { ContactForm } from 'models/contactForm/types'
import { Locale } from 'models/helpCenter/types'
import { LanguageTagList } from 'pages/common/components/LanguageTagList'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import StoreName from 'pages/settings/helpCenter/components/StoreName'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'

export type ContactFormTableRowProps = {
    key: React.Key
    onClick: () => void
    form: ContactForm
}

export const ContactFormTableRow = ({
    key,
    onClick,
    form,
}: ContactFormTableRowProps) => {
    const locales = useSupportedLocales()
    const language: Locale | undefined = useMemo(() => {
        const defaultLocDto = locales.find(
            (locale) => locale.code === form.default_locale,
        )

        if (!defaultLocDto) return undefined

        return { code: defaultLocDto.code, name: defaultLocDto.name }
    }, [form.default_locale, locales])

    return (
        <TableBodyRow key={key} onClick={onClick}>
            <BodyCell>
                <b>{form.name}</b>
            </BodyCell>
            <BodyCell>
                <StoreName
                    name={form.shop_integration?.shop_name ?? null}
                    shopIntegrationId={form.shop_integration?.integration_id}
                />
            </BodyCell>

            <BodyCell>
                {language ? (
                    <LanguageTagList
                        id={form.id}
                        defaultLanguage={language}
                        languageList={[language]}
                    />
                ) : null}
            </BodyCell>
            <BodyCell>
                <i className="material-icons md-2">keyboard_arrow_right</i>
            </BodyCell>
        </TableBodyRow>
    )
}
