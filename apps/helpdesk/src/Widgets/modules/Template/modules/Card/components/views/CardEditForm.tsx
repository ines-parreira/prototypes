import React, { FormEvent, useRef, useState } from 'react'

import { LegacyButton as Button, LegacyLabel as Label } from '@gorgias/axiom'

import { UploadType } from 'common/types'
import CheckBox from 'pages/common/forms/CheckBox'
import ColorField from 'pages/common/forms/ColorField'
import FileField from 'pages/common/forms/FileField'
import InputField from 'pages/common/forms/input/InputField'
import NumberInput from 'pages/common/forms/input/NumberInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { DEFAULT_LIST_ITEM_DISPLAYED_NUMBER } from 'Widgets/modules/Template/config/template'

import { CardEditFormState, HiddenField } from '../../types'

import css from './CardEditForm.less'

export const TITLE_FIELD_LABEL = 'Title'
export const LINK_FIELD_LABEL = 'Link'
export const ICON_FIELD_LABEL = 'Icon'
export const ICON_BACKGROUND_FIELD_LABEL = 'Icon background'
export const DISPLAY_CARD_FIELD_LABEL = 'Display card'
export const LIMIT_FIELD_LABEL = 'Limit'
export const ORDER_FIELD_LABEL = 'Order by'
export const SUBMIT_BUTTON_TEXT = 'Submit'
export const CANCEL_BUTTON_TEXT = 'Cancel'

type Props = {
    initialData: CardEditFormState
    hiddenFields: HiddenField[]
    orderByOptions: { label: string; value: string }[]
    onSubmit: (formState: CardEditFormState) => void
    onCancel: () => void
}

const CardEdit = ({
    initialData,
    hiddenFields,
    orderByOptions,
    onSubmit,
    onCancel,
}: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [formState, setFormState] = useState<CardEditFormState>(initialData)

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        onSubmit(formState)
    }

    return (
        <div ref={wrapperRef}>
            <form onSubmit={handleSubmit}>
                {!hiddenFields.includes('title') && (
                    <InputField
                        name="card.title"
                        label={TITLE_FIELD_LABEL}
                        placeholder="Order {{id}}"
                        value={formState.title}
                        onChange={(title) =>
                            setFormState((formState) => ({
                                ...formState,
                                title,
                            }))
                        }
                        className={css.field}
                    />
                )}
                {!hiddenFields.includes('link') && (
                    <InputField
                        name="card.meta.link"
                        label={LINK_FIELD_LABEL}
                        placeholder="http://myapi.com/{{id}}"
                        value={formState.link}
                        onChange={(link) =>
                            setFormState((formState) => ({
                                ...formState,
                                link,
                            }))
                        }
                        className={css.field}
                    />
                )}
                {!hiddenFields.includes('pictureUrl') && (
                    <FileField
                        name="card.meta.pictureUrl"
                        label={ICON_FIELD_LABEL}
                        value={formState.pictureUrl}
                        onChange={(pictureUrl: string) => {
                            setFormState((formState) => ({
                                ...formState,
                                pictureUrl,
                            }))
                        }}
                        uploadType={UploadType.Widget}
                        maxSize={500 * 1024}
                        placeholder="Upload Icon"
                        help="Less than 500kB, .png or .jpg"
                        isRemovable
                    />
                )}
                {!hiddenFields.includes('color') && (
                    <ColorField
                        name="card.meta.color"
                        label={ICON_BACKGROUND_FIELD_LABEL}
                        value={formState.color}
                        onChange={(color: string) => {
                            setFormState((formState) => ({
                                ...formState,
                                color,
                            }))
                        }}
                        popupContainer={wrapperRef}
                    />
                )}
                {!hiddenFields.includes('displayCard') && (
                    <CheckBox
                        name="card.meta.displayCard"
                        isChecked={
                            formState.displayCard === undefined
                                ? true
                                : formState.displayCard
                        }
                        onChange={(displayCard) =>
                            setFormState((formState) => ({
                                ...formState,
                                displayCard,
                            }))
                        }
                        className={css.field}
                    >
                        {DISPLAY_CARD_FIELD_LABEL}
                    </CheckBox>
                )}
                {!hiddenFields.includes('limit') && (
                    <>
                        <Label htmlFor="list.meta.limit" className={css.label}>
                            {LIMIT_FIELD_LABEL}
                        </Label>
                        <NumberInput
                            id="list.meta.limit"
                            className={css.field}
                            min={0}
                            value={formState.limit}
                            placeholder="0"
                            onChange={(
                                limit = DEFAULT_LIST_ITEM_DISPLAYED_NUMBER,
                            ) =>
                                setFormState((formState) => ({
                                    ...formState,
                                    limit,
                                }))
                            }
                        />
                    </>
                )}
                {!hiddenFields.includes('orderBy') && (
                    <>
                        <Label
                            htmlFor="list.meta.orderBy"
                            className={css.label}
                        >
                            {ORDER_FIELD_LABEL}
                        </Label>
                        <SelectField
                            id="list.meta.orderBy"
                            className={css.field}
                            showSelectedOption
                            value={formState.orderBy}
                            options={orderByOptions}
                            onChange={(orderBy) =>
                                setFormState((formState) => ({
                                    ...formState,
                                    orderBy: orderBy?.toString(),
                                }))
                            }
                        />
                    </>
                )}

                <div>
                    <Button type="submit" className="mr-2">
                        {SUBMIT_BUTTON_TEXT}
                    </Button>
                    <Button intent="secondary" type="button" onClick={onCancel}>
                        {CANCEL_BUTTON_TEXT}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default CardEdit
