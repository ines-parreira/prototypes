import React, { useMemo } from 'react'

import { ContactForm } from 'models/contactForm/types'
import { Locale } from 'models/helpCenter/types'
import { IntegrationType } from 'models/integration/constants'
import { LanguageTagList } from 'pages/common/components/LanguageTagList'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { getIconFromType } from 'state/integrations/helpers'

import css from './ContactFormTableRow.less'

export type ContactFormTableRowProps = {
    key: React.Key
    onClick: () => void
    form: ContactForm
}

const STORE_NOT_CONNECTED_LABEL = 'No store connected'

const StoreNameContent = (props: { name: string | null }) => {
    return props.name ? (
        <div>
            <img
                height={16}
                width={16}
                // we only support Shopify shops for now
                src={getIconFromType(IntegrationType.Shopify)}
                alt="logo"
            />
            <span className={css.storeNameLabel}>{props.name}</span>
        </div>
    ) : (
        <div className={css.noStore}>{STORE_NOT_CONNECTED_LABEL}</div>
    )
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

        return {
            code: defaultLocDto.code,
            name: defaultLocDto.name,
        }
    }, [form.default_locale, locales])

    return (
        <TableBodyRow key={key} onClick={onClick}>
            <BodyCell>
                <b>{form.name}</b>
            </BodyCell>
            <BodyCell>
                <StoreNameContent name={form.shop_name} />
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
