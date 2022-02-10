import React from 'react'

import {Col, Row} from 'reactstrap'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'

import Loader from '../../../../../../common/components/Loader/Loader'

type Props = {
    isLoading?: boolean
    onCheckStatus: () => void
    status?: string
}

export const StatusCheck = ({
    isLoading = false,
    onCheckStatus,
    status,
}: Props): JSX.Element | null => {
    if (!status) {
        return null
    }

    return (
        <div data-testid="domain-status-check">
            <Button
                className="mr-4"
                isDisabled={isLoading}
                intent={ButtonIntent.Primary}
                type="button"
                onClick={onCheckStatus}
            >
                {isLoading ? (
                    <Row noGutters data-testid="icon-loading">
                        <Col className="mr-2">
                            <Loader minHeight="16px" size="16px" />
                        </Col>
                        <Col>Checking...</Col>
                    </Row>
                ) : (
                    <>
                        <span className="material-icons mr-2">wifi</span>
                        Check Status
                    </>
                )}
            </Button>
            <span>
                NOTE: It may take up to a few hours for DNS changes to take
                effect.
            </span>
        </div>
    )
}
