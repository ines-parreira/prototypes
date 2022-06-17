import React, {
    useContext,
    useCallback,
    useRef,
    useState,
    MouseEvent,
    FormEvent,
    memo,
} from 'react'
import {Iterable, List, Map, fromJS} from 'immutable'
import {Form, FormGroup} from 'reactstrap'

import {IntegrationType} from 'models/integration/constants'
import useAppDispatch from 'hooks/useAppDispatch'
import {updateEditedWidget, stopWidgetEdition} from 'state/widgets/actions'
import Button from 'pages/common/components/button/Button'
import ColorField from 'pages/common/forms/ColorField'
import {isSimpleTemplateWidget} from 'pages/common/components/infobar/utils'
import CheckBox from 'pages/common/forms/CheckBox'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import FileField, {UploadType} from 'pages/common/forms/FileField'
import {IntegrationContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/IntegrationContext'
import {PartialTemplate} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/types'

type EditionHiddenField = 'link' | 'displayCard'

type Props = {
    template: Map<string, unknown>
    parent: Map<string, unknown>
    editionHiddenFields: EditionHiddenField[]
    isParentList: boolean
    isRootWidget: boolean
}

type FormState = {
    title: string
    link: string
    pictureUrl: string
    color: string
    displayCard: boolean
    limit: string
    orderBy: string
}

const WidgetEdit = ({
    template,
    parent,
    editionHiddenFields = [],
    isParentList = false,
    isRootWidget = false,
}: Props) => {
    const dispatch = useAppDispatch()
    const wrapperRef = useRef<HTMLDivElement>(null)
    const {integration} = useContext(IntegrationContext)
    const [formState, setFormState] = useState<FormState>({
        title: template.get('title', '') as string,
        link: template.getIn(['meta', 'link'], ''),
        pictureUrl: template.getIn(['meta', 'pictureUrl'], ''),
        color: template.getIn(['meta', 'color'], ''),
        displayCard: true,
        limit: isParentList ? parent.getIn(['meta', 'limit'], '') : '',
        orderBy: isParentList ? parent.getIn(['meta', 'orderBy'], '') : '',
    })

    const handleClose = useCallback(
        (evt?: MouseEvent<HTMLButtonElement>) => {
            if (evt) {
                evt.stopPropagation()
            }
            dispatch(stopWidgetEdition())
        },
        [dispatch]
    )

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const card: PartialTemplate = {
                type: 'card',
                title: formState.title,
                meta: {
                    link: formState.link,
                    displayCard: formState.displayCard,
                    pictureUrl: formState.pictureUrl,
                    color: formState.color,
                },
            }

            if (isParentList) {
                const list: PartialTemplate = {
                    title: parent.get('title') as string,
                    type: 'list',
                    meta: {
                        limit: formState.limit,
                        orderBy: formState.orderBy,
                    },
                    widgets: [card],
                }
                // saving the parent list AND the card inside that list
                dispatch(updateEditedWidget(list))
            } else {
                // saving only the card
                dispatch(updateEditedWidget(card))
            }

            handleClose()
        },
        [formState, isParentList, parent, dispatch, handleClose]
    )

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
                <DEPRECATED_InputField
                    type="text"
                    name="card.title"
                    label="Title"
                    placeholder="Order {{id}}"
                    value={formState.title}
                    onChange={(title) =>
                        setFormState((formState) => ({...formState, title}))
                    }
                />
                {!editionHiddenFields.includes('link') && (
                    <DEPRECATED_InputField
                        type="text"
                        name="card.meta.link"
                        label="Link"
                        placeholder="http://myapi.com/{{id}}"
                        value={formState.link}
                        onChange={(link) =>
                            setFormState((formState) => ({...formState, link}))
                        }
                    />
                )}
                {isRootWidget &&
                    integration.get('type') === IntegrationType.Http && (
                        <>
                            <FileField
                                name="card.meta.pictureUrl"
                                label="Widget icon"
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
                                label="Widget color"
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
                            Display card
                        </CheckBox>
                    </FormGroup>
                )}
                {isParentList && (
                    <>
                        <DEPRECATED_InputField
                            key="limit"
                            type="number"
                            name="list.meta.limit"
                            label="Limit"
                            placeholder="ex: 0"
                            value={formState.limit}
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
                            label="Order by"
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
                        Submit
                    </Button>
                    <Button
                        intent="secondary"
                        type="button"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                </div>
            </Form>
        </div>
    )
}

export default memo(WidgetEdit)
