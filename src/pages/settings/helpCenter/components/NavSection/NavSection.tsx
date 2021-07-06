import React from 'react'

import {LocaleCode} from '../../../../../models/helpCenter/types'

import SelectField from '../../../../common/forms/SelectField/SelectField.js'
import {Option} from '../../../../common/forms/SelectField/types'

import {LinkList, LinkEntity} from '../LinkList'

import css from './NavSection.less'

type Props = {
    availableLocales: Option[]
    description: string
    items: LinkEntity[]
    name: string
    selectedLocale: LocaleCode
    title: string
    onBlurLink: (
        ev: React.FocusEvent<HTMLInputElement>,
        key: string,
        id: number
    ) => void
    onChangeLocale: (value: LocaleCode) => void
    onClickAdd: () => void
    onClickRemove: (id: number) => void
}

export const NavSection = ({
    availableLocales,
    description,
    items,
    name,
    title,
    selectedLocale,
    onBlurLink,
    onClickAdd,
    onChangeLocale,
    onClickRemove,
}: Props): JSX.Element => (
    <div className={css.wrapper}>
        <div className={css.heading}>
            <div>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
            {availableLocales.length > 0 && (
                <div>
                    <SelectField
                        options={availableLocales}
                        value={selectedLocale}
                        onChange={onChangeLocale}
                        style={{display: 'inline-block'}}
                    />
                </div>
            )}
        </div>

        <h4>Links</h4>
        <LinkList
            name={name}
            titlePlaceholder="Link title"
            urlPlaceholder="Link URL"
            list={items}
            onBlurInput={onBlurLink}
            onDelete={onClickRemove}
            onAddNew={onClickAdd}
        />
    </div>
)
