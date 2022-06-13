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
        <Row>
            <Col>{children}</Col>
            <Col>
                <div className={css.preview}>{preview}</div>
            </Col>
        </Row>
    </Container>
)

export default GorgiasChatIntegrationPreviewContainer
