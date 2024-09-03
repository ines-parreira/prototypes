import React, {Component, FormEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {Form} from 'reactstrap'
import classNames from 'classnames'
import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import {Tag, TagDecoration} from '@gorgias/api-queries'

import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import ColorPicker from 'pages/common/components/ColorPicker/ColorPicker'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import TicketTag from 'pages/common/components/TicketTag'
import CheckBox from 'pages/common/forms/CheckBox'
import TextInput from 'pages/common/forms/input/TextInput'
import {cancel, edit, remove, save, select} from 'state/tags/actions'
import {REMOVE_TAG_ERROR} from 'state/tags/constants'
import {ServerErrorAction} from 'store/middlewares/serverErrorHandler'
import {WithColorTokens, withThemedColorTokens} from 'theme'
import {toJS} from 'utils'

import css from './Row.less'

type Props = {
    row: Tag
    meta: Map<any, any>
    refresh: () => void
} & ConnectedProps<typeof connector> &
    WithColorTokens

type State = {
    name: string
    description: string | null
    decoration: TagDecoration
}

export class Row extends Component<Props, State> {
    state: State = {
        name: '',
        description: '',
        decoration: {
            color: '',
        },
    }

    _setStateFromRow = (row: Tag) => {
        this.setState({
            name: row.name,
            description: row.description || '',
            decoration: row.decoration || {
                color: '',
            },
        })
    }

    componentWillReceiveProps(nextProps: Props) {
        // when adding new items, update the form inputs
        if (nextProps.row !== this.props.row) {
            this._setStateFromRow(nextProps.row)
        }
    }

    componentDidMount() {
        this._setStateFromRow(this.props.row)
    }

    _onEdit = () => {
        this.props.edit(this.props.row)
    }

    _onSave = (event: FormEvent) => {
        event.preventDefault()
        const {name, description} = this.state
        let {decoration} = this.state
        const {colorTokens, row, save, refresh} = this.props

        const obj: TagDecoration = toJS(decoration)
        if (obj.color === '') {
            obj.color =
                colorTokens?.Main.Secondary.value ??
                colors['🖥 Modern'].Main.Secondary.value

            decoration = fromJS(obj)
            this.setState({decoration})
        }

        const updatedRow = {
            ...row,
            name,
            description,
            decoration,
        }

        void save(updatedRow).then(() => {
            refresh()
        })
    }

    _onCancel = () => {
        this.props.cancel(this.props.row)
    }

    _onRemove = () => {
        return this.props.remove(this.props.row.id.toString()).then((error) => {
            if ((error as ServerErrorAction)?.type !== REMOVE_TAG_ERROR) {
                this.props.refresh()
            }
        })
    }

    _onSelect = () => {
        this.props.select(this.props.row)
    }

    _changeName = (value: string) => {
        this.setState({name: value})
    }

    _changeDescription = (value: string) => {
        this.setState({description: value})
    }

    _changeColor = (value: string) => {
        this.setState({decoration: {color: value}})
    }

    render() {
        const {colorTokens, row, meta} = this.props
        const {decoration, description, name} = this.state

        const isEditing = meta.get('edit')

        if (isEditing) {
            return (
                <tr>
                    <td
                        className="cell-wrapper cell-short clickable"
                        onClick={this._onSelect}
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
                            onSubmit={this._onSave}
                        >
                            <TextInput
                                value={name}
                                onChange={this._changeName}
                                isRequired
                            />
                            <TextInput
                                size={100}
                                value={description ?? undefined}
                                onChange={this._changeDescription}
                            />
                            <ColorPicker
                                className={css.colorPicker}
                                value={decoration.color}
                                defaultValue={
                                    colorTokens?.Main.Secondary.value ??
                                    colors['🖥 Modern'].Main.Secondary.value
                                }
                                onChange={this._changeColor}
                            />
                            <Button intent="secondary" onClick={this._onCancel}>
                                Cancel
                            </Button>
                            <Button type="submit">Save</Button>
                        </Form>
                    </td>
                </tr>
            )
        }

        return (
            <tr className={css.row}>
                <td
                    className="cell-wrapper cell-short clickable smallest"
                    onClick={this._onSelect}
                >
                    <CheckBox
                        labelClassName={css.checkBoxLabel}
                        className={css.checkBox}
                        isChecked={meta.get('selected', false)}
                    />
                </td>

                <td>
                    <div className="cell-wrapper">
                        <TicketTag decoration={fromJS(row.decoration)}>
                            {row.name}
                        </TicketTag>
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
                            onClick={this._onEdit}
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
                                        <li>
                                            It will be removed from all tickets
                                        </li>

                                        <li>
                                            Historical Statistics for this tag
                                            will be lost
                                        </li>

                                        <li>
                                            It will not be possible to add the
                                            tag back to the tickets it was
                                            previously on
                                        </li>
                                    </ul>
                                </>
                            }
                            id={`remove-button-${row.id}`}
                            onConfirm={this._onRemove}
                            placement="left"
                        >
                            {({uid, onDisplayConfirmation}) => (
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
}

const connector = connect(null, {
    cancel,
    edit,
    remove,
    save,
    select,
})

export default withThemedColorTokens(connector(Row))
