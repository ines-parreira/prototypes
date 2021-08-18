import React from 'react'

import {
    LocaleCode,
    LocalNavigationLink,
} from '../../../../../models/helpCenter/types'
import {validLocaleCode} from '../../../../../models/helpCenter/utils'

import SelectField from '../../../../common/forms/SelectField/SelectField'
import {Option} from '../../../../common/forms/SelectField/types'

import {LinkList, LinkItemEventHandlers} from '../LinkList'

import css from './NavSection.less'

type Props = {
    availableLocales: Option[]
    description: string
    items: LocalNavigationLink[]
    name: string
    selectedLocale: LocaleCode
    title: string
    onChangeLink: LinkItemEventHandlers['onChange']
    onChangeLocale: (value: LocaleCode) => void
    onClickAdd: () => void
    onClickRemove: LinkItemEventHandlers['onDelete']
}

export const NavSection = ({
    availableLocales,
    description,
    items,
    name,
    title,
    selectedLocale,
    onChangeLink,
    onClickAdd,
    onChangeLocale,
    onClickRemove,
}: Props): JSX.Element => {
    const handleOnSelect = (value: React.ReactText) => {
        onChangeLocale(validLocaleCode(value))
    }
    return (
        <div className={css.wrapper}>
            <div className={css.heading}>
                <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>
                {availableLocales?.length > 0 && (
                    <div>
                        <SelectField
                            options={availableLocales}
                            value={selectedLocale}
                            onChange={handleOnSelect}
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
                list={items.map((item) => ({
                    id: item.id,
                    key: item.key,
                    value: item.translation.value,
                    label: item.translation.label,
                }))}
                onChange={onChangeLink}
                onDelete={onClickRemove}
                onAddNew={onClickAdd}
            />
        </div>
    )
}
