import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import Clipboard from 'clipboard'
import {InputGroup, InputGroupButton, Button, Input} from 'reactstrap'

import * as currentUserSelectors from '../../../state/currentUser/selectors'

class ApiKeyView extends React.Component {
    state = {
        isCopied: false,
    }

    componentDidMount() {
        const clipboard = new Clipboard('#copyApiKey')

        clipboard.on('success', () => {
            this.setState({isCopied: true})
            setTimeout(() => {
                this.setState({isCopied: false})
            }, 1500)
        })
    }

    render() {
        const {apiKey} = this.props

        return (
            <div>
                <h1>
                    <i className="key alternative blue icon ml5ni mr10i" />
                    API key
                </h1>
                <p>
                    Here’s your API key. You can use it to authenticate requests
                    on <a href="http://docs.gorgias.io/" target="_blank">our API</a>, and make changes
                    to your tickets & users. Make sure you keep it safe.
                </p>

                <h4>Your personal API key</h4>

                <InputGroup>
                    <Input
                        id="apiKey"
                        type="text"
                        value={apiKey}
                        readOnly
                    />
                    <InputGroupButton>
                        <Button
                            id="copyApiKey"
                            color="info"
                            data-clipboard-target="#apiKey"
                        >
                            <i className="copy icon mr-2" />
                            {this.state.isCopied ? 'COPIED!' : 'COPY'}
                        </Button>
                    </InputGroupButton>
                </InputGroup>
            </div>
        )
    }
}

ApiKeyView.defaultProps = {
    isLoading: true
}

ApiKeyView.propTypes = {
    apiKey: PropTypes.string.isRequired,
    isLoading: PropTypes.bool.isRequired
}

function mapStateToProps(state) {
    return {
        apiKey: currentUserSelectors.getApiKey(state)
    }
}

export default connect(mapStateToProps)(ApiKeyView)
