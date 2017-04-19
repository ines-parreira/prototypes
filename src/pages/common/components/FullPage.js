import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {withRouter} from 'react-router'
import {
    Container,
    Row,
    Col,
} from 'reactstrap'
import _last from 'lodash/last'

import appCss from '../../App.less'
import css from './FullPage.less'

@withRouter
export default class FullPage extends React.Component {
    static propTypes = {
        children: PropTypes.node.isRequired,
        routes: PropTypes.array.isRequired,
    }

    render() {
        const currentRoute = _last(this.props.routes)

        return (
            <Container
                fluid
                className={classnames('container-padding', appCss['main-content'], css.container)}
            >
                <Row
                    className={classnames(css.row, {
                        [css['no-limit']]: currentRoute.noContainerWidthLimit,
                    })}
                >
                    <Col>
                        {this.props.children}
                    </Col>
                </Row>
            </Container>
        )
    }
}
