import React, {Component} from 'react'
import {List} from 'immutable'
import {Row, Col} from 'reactstrap'

import {ButtonIntent} from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import InputField from './InputField.js'

type Props = {
    className?: string
    items: List<any>
    onChange: (value: List<any>) => void
    maxLength: number
    maxItems: number
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
        const {className, items, maxLength, maxItems} = this.props

        return (
            <div className={className}>
                {items.map((item: Map<any, any>, index) => {
                    return (
                        <Row key={index} className="mb-3 form-row">
                            <Col className="flex-grow">
                                <InputField
                                    name={`item-${index!}`}
                                    type="text"
                                    placeholder={`Type something (limited to ${maxLength} characters)`}
                                    value={item}
                                    maxLength={maxLength}
                                    onChange={(value) =>
                                        this.updateRow(value, index!)
                                    }
                                    required
                                />
                            </Col>
                            <Col className="d-flex col-sm-auto">
                                <IconButton
                                    intent={ButtonIntent.Destructive}
                                    onClick={() => this.deleteRow(index!)}
                                >
                                    delete
                                </IconButton>
                            </Col>
                        </Row>
                    )
                })}
                {items.size < maxItems ? (
                    <IconButton
                        intent={ButtonIntent.Secondary}
                        onClick={this.addRow}
                    >
                        add
                    </IconButton>
                ) : null}
            </div>
        )
    }
}
