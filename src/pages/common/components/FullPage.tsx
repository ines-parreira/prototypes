import classnames from 'classnames'
import React, {ReactNode} from 'react'
import {RouteComponentProps} from 'react-router-dom'
import {Container, Row, Col} from 'reactstrap'

import appCss from 'pages/App.less'
import withRouter from 'pages/common/utils/withRouter'

import css from './FullPage.less'

type OwnProps = {
    children: ReactNode
    noContainerWidthLimit?: boolean
}

type Props = OwnProps & RouteComponentProps

function FullPage({children, noContainerWidthLimit}: Props) {
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
                <Col className={css.col}>{children}</Col>
            </Row>
        </Container>
    )
}

export default withRouter(FullPage)
