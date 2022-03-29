import React, {Component} from 'react'
import {List} from 'immutable'
import {Row, Col, Button} from 'reactstrap'
import classNames from 'classnames'

import TextInput from './input/TextInput'
import css from './ListField.less'

type Props = {
    className?: string
    items: List<string>
    onChange: (value: List<any>) => void
    maxLength: number
    maxItems: number
    addLabel?: string
    disabled?: boolean
}

export default class ListField extends Component<Props> {
    static defaultProps = {
        maxLength: 100,
        maxItems: 100,
    }

    addRow = () => {
        const {items, maxItems} = this.props

        if (maxItems && items.size >= maxItems) {
            return
        }

        this.props.onChange(this.props.items.push(''))
    }

    deleteRow = (index: number) => {
        this.props.onChange(this.props.items.delete(index))
    }

    updateRow = (item: string, index: number) => {
        this.props.onChange(this.props.items.set(index, item))
    }

    render() {
        const {addLabel, className, disabled, items, maxLength, maxItems} =
            this.props

        return (
            <div className={className}>
                {items.map((item, index) => (
                    <Row key={index} className={css.row}>
                        <Col className="flex-grow pr-0">
                            <TextInput
                                className="my-0"
                                name={`item-${index!}`}
                                placeholder={`Type something (limited to ${maxLength} characters)`}
                                value={item}
                                maxLength={maxLength}
                                onChange={(value) =>
                                    this.updateRow(value, index!)
                                }
                                size={300}
                                isDisabled={disabled}
                                isRequired
                            />
                        </Col>
                        <Col
                            className={classNames(
                                'd-flex',
                                'col-sm-auto',
                                css.delete
                            )}
                            onClick={() => !disabled && this.deleteRow(index!)}
                        >
                            <i
                                className={`material-icons md-2 ${
                                    disabled ? 'text-muted' : 'text-danger'
                                }`}
                            >
                                clear
                            </i>
                        </Col>
                    </Row>
                ))}
                <Button
                    className="d-flex align-items-center"
                    size="sm"
                    disabled={disabled === true || items.size === maxItems}
                    onClick={this.addRow}
                >
                    <i className="material-icons md-2">add</i>
                    {addLabel !== undefined ? (
                        <span className="ml-2">{addLabel}</span>
                    ) : null}
                </Button>
            </div>
        )
    }
}
