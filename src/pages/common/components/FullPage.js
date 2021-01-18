import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {withRouter} from 'react-router-dom'
import {Container, Row, Col} from 'reactstrap'

import appCss from '../../App.less'

import css from './FullPage.less'

@withRouter
export default class FullPage extends React.Component {
    static propTypes = {
        noContainerWidthLimit: PropTypes.bool,
        children: PropTypes.node.isRequired,
    }

    render() {
        const {noContainerWidthLimit} = this.props
        return (
            <Container
                fluid
                className={classnames(
                    'container-padding',
                    appCss['main-content'],
                    css.container
                )}
            >
                <Row
                    className={classnames(css.row, {
                        [css['no-limit']]: noContainerWidthLimit,
                    })}
                >
                    <Col className={css.col}>{this.props.children}</Col>
                </Row>
            </Container>
        )
    }
}
