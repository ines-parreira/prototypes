import type { ReactNode } from 'react'
import React from 'react'

import classnames from 'classnames'
import type { RouteComponentProps } from 'react-router-dom'
import { Col, Container, Row } from 'reactstrap'

import appCss from 'pages/App.less'
import withRouter from 'pages/common/utils/withRouter'

import css from './FullPage.less'

type OwnProps = {
    children: ReactNode
    noContainerWidthLimit?: boolean
}

type Props = OwnProps & RouteComponentProps

function FullPage({ children, noContainerWidthLimit }: Props) {
    return (
        <Container
            fluid
            className={classnames(
                'container-padding',
                appCss['main-content'],
                css.container,
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
