import React, {ChangeEvent} from 'react'
import {Col, Container, FormText, Row} from 'reactstrap'
import {Map} from 'immutable'
import _debounce from 'lodash/debounce'

import CheckBox from 'pages/common/forms/CheckBox'
import {
    logEvent,
    SegmentEvent,
} from '../../../../../../../../../../../store/middlewares/segmentTracker'

import OrderTotals from './OrderTotals/OrderTotals'

type OwnProps = {
    currencyCode: string
    loading: boolean
    calculatedEditOrder: Map<any, any>
    changeNote: (note: string) => void
    notifyCustomer: (notify: boolean) => void
}

export function EditOrderForm({
    loading,
    calculatedEditOrder,
    currencyCode,
    changeNote,
    notifyCustomer,
}: OwnProps) {
    const _onNoteChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const padding = 2
        const element = event.target
        const note = element.value
        _updatePayload(note)
        // Adjust textarea's height
        element.style.height = '1px'
        element.style.height = `${element.scrollHeight + padding}px`
    }

    const _updateNotif = _debounce((notif: boolean) => {
        notifyCustomer(notif)
    }, 800)

    const _updatePayload = _debounce((note: string) => {
        changeNote(note)
        _trackNoteChanged()
    }, 800)

    const _trackNoteChanged = _debounce(() => {
        logEvent(SegmentEvent.ShopifyCreateOrderNotesChanged)
    }, 1000)

    return (
        <Container fluid>
            <Row>
                <Col xs={{size: 12, order: 2}} lg={{size: 6, order: 1}}>
                    <div className="mb-4">
                        <h4>Reason for edit</h4>
                        <textarea
                            rows={1}
                            className="form-control"
                            placeholder="Add a reason..."
                            onChange={_onNoteChange}
                        />
                        <FormText color="muted">
                            Only you and other staff can see this reason
                        </FormText>
                    </div>
                    <CheckBox className="mb-3" onChange={_updateNotif}>
                        Send invoice to customer
                    </CheckBox>
                </Col>
                <Col
                    xs={{size: 12, order: 1}}
                    lg={{size: 6, order: 2}}
                    className="mb-xs-4"
                >
                    <OrderTotals
                        currencyCode={currencyCode}
                        loading={loading}
                        calculatedEditOrder={calculatedEditOrder}
                    />
                </Col>
            </Row>
        </Container>
    )
}

export default EditOrderForm
