// @flow
import React from 'react'
import {List} from 'immutable'
import {Row, Col, Button} from 'reactstrap'

import InputField from './InputField'


type Props = {
    className?: string,
    items: List<*>,
    onChange: (List<*>) => void,
    maxLength: number,
    maxItems: number
}


export default class ListField extends React.Component<Props> {
    static defaultProps = {
        maxLength: 100,
        maxItems: 100
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
                {
                    items.map((item, index) => {
                        return (
                            <Row
                                key={index}
                                className="mb-3 form-row"
                            >
                                <Col className="flex-grow">
                                    <InputField
                                        name={`item-${index}`}
                                        type="text"
                                        placeholder={`Type something (limited to ${maxLength} characters)`}
                                        value={item}
                                        maxLength={maxLength}
                                        onChange={(value) => this.updateRow(value, index)}
                                        required
                                    />

                                </Col>
                                <Col className="d-flex col-sm-auto" >
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => this.deleteRow(index)}
                                    >
                                        <i className="material-icons md-2 text-danger">
                                            delete
                                        </i>
                                    </Button>
                                </Col>
                            </Row>
                        )
                    })
                }
                {
                    items.size < maxItems ? (
                        <Button
                            size="sm"
                            onClick={this.addRow}
                        >
                            <i className="material-icons md-2">
                                add
                            </i>
                        </Button>
                    ) : null
                }
            </div>
        )
    }
}
