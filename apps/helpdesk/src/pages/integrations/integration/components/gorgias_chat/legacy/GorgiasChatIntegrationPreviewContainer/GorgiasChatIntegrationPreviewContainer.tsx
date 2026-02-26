import type { ReactNode } from 'react'
import React from 'react'

import { Col, Container, Row } from 'reactstrap'

import settingsCss from '../../../../../../settings/settings.less'
import css from './GorgiasChatIntegrationPreviewContainer.less'

type Props = {
    preview: ReactNode
    children: ReactNode
}

const GorgiasChatIntegrationPreviewContainer = ({
    children,
    preview,
}: Props) => (
    <Container fluid className={settingsCss.pageContainer}>
        <Row className={css.row}>
            <Col>{children}</Col>
            <Col>
                <div className={css.stickyParent}>
                    <div className={css.preview}>{preview}</div>
                </div>
            </Col>
        </Row>
    </Container>
)

export default GorgiasChatIntegrationPreviewContainer
