import React, {Component} from 'react'

import {Link} from 'react-router-dom'
import {Container} from 'reactstrap'
import classnames from 'classnames'
import Loader from '../../../../common/components/Loader/Loader'
import css from '../../../../settings/settings.less'

type Props = {
    loading?: boolean
}

export default class SmoochDeprecatedIntegration extends Component<Props> {
    render() {
        const {loading = false} = this.props

        if (loading) {
            return <Loader />
        }

        return (
            <Container
                fluid
                className={classnames(css.pageContainer, css.pb0)}
                data-candu-id="integration-list-top"
            >
                <div className="mb-3">
                    Smooch is now deprecated. A{' '}
                    <Link to="/app/settings/channels/gorgias_chat">
                        new version of the chat
                    </Link>{' '}
                    with additional features is available, please migrate to the
                    new version by following the steps outlined in{' '}
                    <a
                        href="https://docs.gorgias.com/gorgias-chat/migrating-to-new-chat-integration-beta-version"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        this article
                    </a>
                </div>
            </Container>
        )
    }
}
