import React, {ReactNode, Component} from 'react'
import classnames from 'classnames'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {Container, Row, Col} from 'reactstrap'

import appCss from '../../App.less'

import css from './FullPage.less'

type OwnProps = {
    noContainerWidthLimit?: boolean
    children: ReactNode
}

class FullPage extends Component<OwnProps & RouteComponentProps> {
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

export default withRouter(FullPage)
