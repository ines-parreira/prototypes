import classNames from 'classnames'
import React, {ReactNode} from 'react'
import {Col, Container, Row} from 'reactstrap'

import settingsCss from '../../../../../settings/settings.less'
import css from './GorgiasChatIntegrationPreviewContainer.less'

type Props = {
    preview: ReactNode
    children: ReactNode
}

export const GorgiasChatIntegrationPreviewContainer = ({
    children,
    preview,
}: Props) => (
    <Container fluid className={settingsCss.pageContainer}>
        <Row className={css.row}>
            <Col className={(css.column, css.content)}>{children}</Col>
            <Col className={classNames(css.column, css.preview)}>{preview}</Col>
        </Row>
    </Container>
)

export default GorgiasChatIntegrationPreviewContainer
