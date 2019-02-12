// @flow
import React from 'react'
import {connect} from 'react-redux'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import classNames from 'classnames'

import {fromJS, List, Map} from 'immutable'

import {removeRequest, setRequest} from '../../../../../state/ticket/actions'
import {getRequests, getLatestRequest} from '../../../../../state/requests/selectors'

import headerCss from '../TicketHeader.less'

type Props = {
    request: Object,
    requests: List<Map<*, *>>,
    setRequest: typeof setRequest,
    removeRequest: typeof removeRequest,
}

type State = {
    dropdownOpen: boolean,
    isLoading: boolean,
}


export class TicketRequest extends React.Component<Props, State> {
    static defaultProps = {
        request: fromJS({}),
        requests: fromJS([]),
        setRequest: () => {},
        removeRequest: () => {},
    }

    state = {
        dropdownOpen: false,
        isLoading: false
    }

    _toggle = () => {
        this.setState({dropdownOpen: !this.state.dropdownOpen})
    }

    _shouldDisplay() {
        return window.DEVELOPMENT || document.cookie.includes('is_gorgias_staff')
    }

    _onChange = (action: Function) => {
        this.setState({isLoading: true})
        action().then(() => {
            this.setState({isLoading: false})
        })
    }

    render() {
        const {request, requests, setRequest, removeRequest} = this.props
        const {isLoading} = this.state

        if (!this._shouldDisplay()) {
            return null
        }

        const label = !request.isEmpty() ? request.get('name') : ''
        return (
            <div className="d-none d-md-inline-flex flex-wrap">
                <Dropdown
                    id="ticket-request"
                    isOpen={this.state.dropdownOpen}
                    toggle={this._toggle}
                >
                    <DropdownToggle
                        caret
                        color="secondary"
                        type="button"
                        disabled={isLoading}
                        className={classNames(headerCss.headerButton, 'btn-transparent', {
                            'btn-loading': isLoading,
                        })}
                    >
                        <i
                            className="icon-custom icon-magic"
                            aria-hidden="true"
                        />
                        {label}
                    </DropdownToggle>

                    <DropdownMenu>
                        <DropdownItem
                            header
                        >
                            TICKET REQUEST (BETA)
                        </DropdownItem>
                        {requests.map((request) => (
                            <DropdownItem
                                key={request.get('id')}
                                onClick={() => this._onChange(() => setRequest(request))}
                            >
                                {request.get('name')}
                            </DropdownItem>
                        ))}
                        <DropdownItem divider/>
                        <DropdownItem onClick={() => this._onChange(removeRequest)}>Clear request</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        )
    }
}

export default connect(
    (state) => ({
        request: getLatestRequest(state),
        requests: getRequests(state)
    }), {
        setRequest: setRequest,
        removeRequest: removeRequest
    }
)(TicketRequest)
