import React from 'react'
import {getIconFromType} from 'state/integrations/helpers'
import {Locale} from 'models/helpCenter/types'
import {ContactForm} from 'models/contactForm/types'
import {LanguageList} from 'pages/common/components/LanguageBulletList'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

import {IntegrationType} from 'models/integration/constants'
import css from './ContactFormTableRow.less'

export type ContactFormTableRowProps = {
    key: React.Key
    onClick: () => void
    form: ContactForm
}

const STORE_NOT_CONNECTED_LABEL = 'No store connected'

const StoreNameContent = (props: {name: string | null}) => {
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
    const language: Locale = {
        code: form.default_locale,
        name: '', // we don't display this label
    }

    return (
        <TableBodyRow key={key} onClick={onClick}>
            <BodyCell>
                <b>{form.name}</b>
            </BodyCell>
            <BodyCell>
                <StoreNameContent name={form.shop_name} />
            </BodyCell>

            <BodyCell>
                <LanguageList
                    id={form.id}
                    defaultLanguage={language}
                    languageList={[language]}
                />
            </BodyCell>
            <BodyCell>
                <i className="material-icons md-2">keyboard_arrow_right</i>
            </BodyCell>
        </TableBodyRow>
    )
}
