import React, {useRef, useState, FormEvent} from 'react'
import {Iterable, List, Map, fromJS} from 'immutable'
import {Form, FormGroup} from 'reactstrap'

import {UploadType} from 'common/types'
import Button from 'pages/common/components/button/Button'
import ColorField from 'pages/common/forms/ColorField'
import {isSimpleTemplateWidget} from 'pages/common/components/infobar/utils'
import CheckBox from 'pages/common/forms/CheckBox'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import FileField from 'pages/common/forms/FileField'
import NumberInput from 'pages/common/forms/input/NumberInput'
import Label from 'pages/common/forms/Label/Label'

export const TITLE_FIELD_LABEL = 'Title'
export const LINK_FIELD_LABEL = 'Link'
export const ICON_FIELD_LABEL = 'Icon'
export const ICON_BACKGROUND_FIELD_LABEL = 'Icon background'
export const DISPLAY_CARD_FIELD_LABEL = 'Display card'
export const LIMIT_FIELD_LABEL = 'Limit'
export const ORDER_FIELD_LABEL = 'Order by'
export const SUBMIT_BUTTON_TEXT = 'Submit'
export const CANCEL_BUTTON_TEXT = 'Cancel'

export type EditionHiddenField = 'title' | 'link' | 'displayCard' | 'icon'

export type CardEditFormState = {
    title: string
    link: string
    pictureUrl: string
    color: string
    displayCard: boolean
    limit?: number | string // existing data might have it stored as a string, though it should always be a number
    orderBy: string
}

type Props = {
    template: Map<string, unknown>
    parent: Map<string, unknown>
    editionHiddenFields: EditionHiddenField[]
    isParentList: boolean
    onSubmit: (formState: CardEditFormState) => void
    onCancel: () => void
}

const CardEdit = ({
    template,
    parent,
    editionHiddenFields = [],
    isParentList = false,
    onSubmit,
    onCancel,
}: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [formState, setFormState] = useState<CardEditFormState>({
        title: template.get('title', '') as string,
        link: template.getIn(['meta', 'link'], ''),
        pictureUrl: template.getIn(['meta', 'pictureUrl'], ''),
        color: template.getIn(['meta', 'color'], ''),
        displayCard: template.getIn(['meta', 'displayCard'], true),
        limit: isParentList
            ? parent.getIn(['meta', 'limit'], undefined) || undefined
            : undefined,
        orderBy: isParentList ? parent.getIn(['meta', 'orderBy'], '') : '',
    })

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        onSubmit(formState)
    }

    let orderByOptions = fromJS([]) as Iterable<
        number,
        {label: string; value: string}
    >
    if (isParentList) {
        orderByOptions = (
            template.get('widgets', fromJS([])) as List<Map<string, unknown>>
        )
            .filter(isSimpleTemplateWidget)
            .map((widget) => ({
                label: widget?.get('title', '') as string,
                value: widget?.get('path', '') as string,
            }))
    }

    return (
        <div ref={wrapperRef}>
            <Form onSubmit={handleSubmit}>
                {!editionHiddenFields.includes('title') && (
                    <DEPRECATED_InputField
                        type="text"
                        name="card.title"
                        label={TITLE_FIELD_LABEL}
                        placeholder="Order {{id}}"
                        value={formState.title}
                        onChange={(title) =>
                            setFormState((formState) => ({...formState, title}))
                        }
                    />
                )}
                {!editionHiddenFields.includes('link') && (
                    <DEPRECATED_InputField
                        type="text"
                        name="card.meta.link"
                        label={LINK_FIELD_LABEL}
                        placeholder="http://myapi.com/{{id}}"
                        value={formState.link}
                        onChange={(link) =>
                            setFormState((formState) => ({...formState, link}))
                        }
                    />
                )}
                {!editionHiddenFields.includes('icon') && (
                    <>
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
                    </>
                )}
                {!editionHiddenFields.includes('displayCard') && (
                    <FormGroup>
                        <CheckBox
                            name="card.meta.displayCard"
                            isChecked={formState.displayCard}
                            onChange={(displayCard) =>
                                setFormState((formState) => ({
                                    ...formState,
                                    displayCard,
                                }))
                            }
                        >
                            {DISPLAY_CARD_FIELD_LABEL}
                        </CheckBox>
                    </FormGroup>
                )}
                {isParentList && (
                    <>
                        <Label htmlFor="list.meta.limit">
                            {LIMIT_FIELD_LABEL}
                        </Label>
                        <NumberInput
                            key="limit"
                            id="list.meta.limit"
                            className="mt-2, mb-2"
                            min={0}
                            value={
                                formState.limit
                                    ? Number(formState.limit)
                                    : undefined
                            }
                            placeholder="0"
                            onChange={(limit) =>
                                setFormState((formState) => ({
                                    ...formState,
                                    limit,
                                }))
                            }
                        />
                        <DEPRECATED_InputField
                            key="order"
                            type="select"
                            name="list.meta.orderBy"
                            label={ORDER_FIELD_LABEL}
                            value={formState.orderBy}
                            onChange={(orderBy) =>
                                setFormState((formState) => ({
                                    ...formState,
                                    orderBy,
                                }))
                            }
                        >
                            {orderByOptions.map(
                                (option = {label: '', value: ''}) => {
                                    return ['-', '+'].map((order) => {
                                        const value = `${order}${option.value}`
                                        const label = `${option.label} (${
                                            order === '-' ? 'DESC' : 'ASC'
                                        })`

                                        return (
                                            <option value={value} key={value}>
                                                {label}
                                            </option>
                                        )
                                    })
                                }
                            )}
                        </DEPRECATED_InputField>
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
            </Form>
        </div>
    )
}

export default CardEdit
