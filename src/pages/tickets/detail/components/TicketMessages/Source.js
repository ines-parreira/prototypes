//@flow
import React from 'react'
import {Popover, PopoverBody} from 'reactstrap'
import classnames from 'classnames'
import _isArray from 'lodash/isArray'

import SourceIcon from '../../../../common/components/SourceIcon'
import {DatetimeLabel} from '../../../../common/utils/labels'
import {type Source as SourceType} from '../../../../../models/ticket/types'
import {getPersonLabelFromSource} from '../../../common/utils'

import css from './Source.less'

type Props = {
    id: string,
    isForwarded: boolean,
    createdDatetime: string,
    source: SourceType,
}

type State = {
    isDropdownOpen: boolean,
}

export default class Source extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            isDropdownOpen: false,
        }
    }

    _toggleDropdown = () => {
        this.setState({isDropdownOpen: !this.state.isDropdownOpen})
    }

    _renderSourceList(title: string, field: string) {
        const {source} = this.props
        let fieldSource = source[field]

        if (!fieldSource) {
            return null
        }

        fieldSource = _isArray(fieldSource) ? fieldSource : [fieldSource]

        if (!fieldSource.length) {
            return null
        }

        return (
            <li>
                <span className="text-faded">{title}:</span>
                <strong>
                    {fieldSource
                        .map((person) => {
                            return getPersonLabelFromSource(person, source.type)
                        })
                        .join(', ')}
                </strong>
            </li>
        )
    }

    render() {
        const {source} = this.props
        const id = `info-${this.props.id}`

        return (
            <div>
                <span
                    className={classnames('clickable', css.source)}
                    onClick={this._toggleDropdown}
                >
                    <SourceIcon
                        id={id}
                        type={
                            this.props.isForwarded
                                ? 'email-forward'
                                : source.type
                        }
                        className="uncolored"
                    />
                </span>
                <Popover
                    placement="bottom"
                    target={id}
                    isOpen={this.state.isDropdownOpen}
                    toggle={this._toggleDropdown}
                    trigger="legacy"
                >
                    <PopoverBody>
                        <div className={css.details}>
                            <ul>
                                {this._renderSourceList('From', 'from')}
                                {this._renderSourceList('To', 'to')}
                                {this._renderSourceList('Cc', 'cc')}
                                {this._renderSourceList('Bcc', 'bcc')}
                                <li>
                                    <span className="text-faded">
                                        Send via:
                                    </span>
                                    <strong>{source.type}</strong>
                                </li>
                                <li>
                                    <span className="text-faded">Date:</span>
                                    <strong>
                                        <DatetimeLabel
                                            dateTime={
                                                this.props.createdDatetime
                                            }
                                            labelFormat="MM-DD-YYYY HH:mm"
                                        />
                                    </strong>
                                </li>
                            </ul>
                        </div>
                    </PopoverBody>
                </Popover>
            </div>
        )
    }
}
