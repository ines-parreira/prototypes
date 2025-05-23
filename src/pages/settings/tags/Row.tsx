import React, { FormEvent, useEffect, useState } from 'react'

import classNames from 'classnames'
import { Map } from 'immutable'
import { Form } from 'reactstrap'

import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import { Tag, TagDecoration } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import ColorPicker from 'pages/common/components/ColorPicker/ColorPicker'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import TicketTag from 'pages/common/components/TicketTag'
import CheckBox from 'pages/common/forms/CheckBox'
import TextInput from 'pages/common/forms/input/TextInput'
import css from 'pages/settings/tags/Row.less'
import { cancel, edit, remove, save, select } from 'state/tags/actions'

type Props = {
    row: Tag
    meta: Map<any, any>
    refresh: () => void
}

export default function Row({ meta, refresh, row }: Props) {
    const dispatch = useAppDispatch()
    const [decoration, setDecoration] = useState<TagDecoration>({ color: '' })
    const [description, setDescription] = useState<string | null>('')
    const [name, setName] = useState('')

    useEffect(() => {
        setDecoration(
            row.decoration || {
                color: '',
            },
        )
        setDescription(row.description || '')
        setName(row.name)
    }, [row])

    const onEdit = () => {
        dispatch(edit(row))
    }

    const onSave = async (event: FormEvent) => {
        event.preventDefault()

        const decorationValue = {
            color: decoration.color || colors['🤍 Light'].Neutral.Grey_3.value,
        }

        if (!decoration.color) {
            setDecoration(decorationValue)
        }

        const updatedRow = {
            ...row,
            name,
            description,
            decoration: decorationValue,
        }

        await dispatch(save(updatedRow))
        refresh()
    }

    const onCancel = () => {
        dispatch(cancel(row))
    }

    const onRemove = async () => {
        try {
            await dispatch(remove(row.id.toString()))
            refresh()
        } catch {}
    }

    const onSelect = () => {
        dispatch(select(row))
    }

    const changeColor = (value: string) => {
        setDecoration({ color: value })
    }

    return meta.get('edit') ? (
        <tr>
            <td
                className="cell-wrapper cell-short clickable"
                onClick={onSelect}
            >
                <CheckBox
                    labelClassName={css.checkBoxLabel}
                    className={css.checkBox}
                    isChecked={meta.get('selected', false)}
                />
            </td>

            <td colSpan={100}>
                <Form
                    className={classNames('cell-wrapper', css.form)}
                    onSubmit={onSave}
                >
                    <TextInput value={name} onChange={setName} isRequired />
                    <TextInput
                        size={100}
                        value={description ?? undefined}
                        onChange={setDescription}
                    />
                    <ColorPicker
                        className={css.colorPicker}
                        value={decoration.color}
                        defaultValue={colors['🤍 Light'].Neutral.Grey_3.value}
                        onChange={changeColor}
                    />
                    <Button intent="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                </Form>
            </td>
        </tr>
    ) : (
        <tr className={css.row}>
            <td
                className="cell-wrapper cell-short clickable smallest"
                onClick={onSelect}
            >
                <CheckBox
                    labelClassName={css.checkBoxLabel}
                    className={css.checkBox}
                    isChecked={meta.get('selected', false)}
                />
            </td>

            <td>
                <div className="cell-wrapper">
                    <TicketTag text={row.name} decoration={row.decoration} />
                </div>
            </td>

            <td>
                <div className={classNames('cell-wrapper', css.cell)}>
                    {row.description}
                </div>
            </td>

            <td>
                <div className={classNames('cell-wrapper', css.cell)}>
                    {row.usage}
                </div>
            </td>

            <td>
                <div className={classNames('cell-wrapper', css.actions)}>
                    <IconButton
                        fillStyle="ghost"
                        intent="secondary"
                        onClick={onEdit}
                    >
                        edit
                    </IconButton>

                    <ConfirmationPopover
                        buttonProps={{
                            intent: 'destructive',
                        }}
                        content={
                            <>
                                Are you sure you want to delete this tag?
                                <ul className={css.listWrapper}>
                                    <li>It will be removed from all tickets</li>

                                    <li>
                                        Historical Statistics for this tag will
                                        be lost
                                    </li>

                                    <li>
                                        It will not be possible to add the tag
                                        back to the tickets it was previously on
                                    </li>
                                    <li>
                                        The tag will have to be removed from
                                        Saved Filters manually
                                    </li>
                                </ul>
                            </>
                        }
                        id={`remove-button-${row.id}`}
                        onConfirm={onRemove}
                        placement="left"
                    >
                        {({ uid, onDisplayConfirmation }) => (
                            <IconButton
                                id={uid}
                                fillStyle="ghost"
                                intent="destructive"
                                onClick={onDisplayConfirmation}
                                className="css.actionButton"
                            >
                                delete
                            </IconButton>
                        )}
                    </ConfirmationPopover>
                </div>
            </td>
        </tr>
    )
}
