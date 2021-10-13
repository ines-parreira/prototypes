import React, {Component, ChangeEvent} from 'react'
import {Col, Container, Row} from 'reactstrap'
import {Map} from 'immutable'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import _debounce from 'lodash/debounce'

import {RootState} from '../../../../../../../../../../../../state/types'
import {getCreateOrderState} from '../../../../../../../../../../../../state/infobarActions/shopify/createOrder/selectors'
import {onPayloadChange} from '../../../../../../../../../../../../state/infobarActions/shopify/createOrder/actions'
import MultiSelectOptionsField from '../../../../../../../../../../forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {Option} from '../../../../../../../../../../forms/MultiSelectOptionsField/types'
import * as segmentTracker from '../../../../../../../../../../../../store/middlewares/segmentTracker.js'
import {ShopifyActionType} from '../../../types'

import OrderTotals from './OrderTotals/OrderTotals'
import css from './OrderFooter.less'

type Props = {
    editable: boolean
    actionName: ShopifyActionType
    currencyCode: string
    payload: Map<any, any>
    onPayloadChange: (
        integrationId: number,
        record: Map<any, any>,
        shouldCalculate?: boolean
    ) => void
}

type State = {
    note: string
}

export class OrderFooterComponent extends Component<Props, State> {
    static contextTypes = {
        integrationId: PropTypes.number.isRequired,
    }

    static tagsToOptions(tags = ''): Option[] {
        return tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => !!tag)
            .map((tag) => ({
                label: tag,
                value: tag,
            }))
    }

    state = {
        note: this.props.payload.get('note') || '',
    }

    _defaultTags = this.props.payload.get('tags') || ''

    _onNoteChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const padding = 2
        const element = event.target
        const note = element.value

        this.setState({note})
        this._updatePayload()
        this._trackNoteChanged()

        // Adjust textarea's height
        element.style.height = '1px'
        element.style.height = `${element.scrollHeight + padding}px`
    }

    _updatePayload = _debounce(() => {
        const {onPayloadChange, payload} = this.props
        const {integrationId} = this.context
        const {note} = this.state

        const newPayload = payload.set('note', note)
        onPayloadChange(integrationId, newPayload, false)
    }, 250)

    _trackNoteChanged = _debounce(() => {
        const {actionName} = this.props

        segmentTracker.logEvent(
            actionName === ShopifyActionType.CreateOrder
                ? segmentTracker.EVENTS.SHOPIFY_CREATE_ORDER_NOTES_CHANGED
                : segmentTracker.EVENTS.SHOPIFY_DUPLICATE_ORDER_NOTES_CHANGED
        )
    }, 1000)

    _onTagsChange = (tags: Option[]) => {
        const {onPayloadChange, payload, actionName} = this.props
        const {integrationId} = this.context

        const newValue = tags.map((option) => option.value as string).join(',')
        const newPayload = payload.set('tags', newValue)

        onPayloadChange(integrationId, newPayload, false)
        segmentTracker.logEvent(
            actionName === ShopifyActionType.CreateOrder
                ? segmentTracker.EVENTS.SHOPIFY_CREATE_ORDER_TAGS_CHANGED
                : segmentTracker.EVENTS.SHOPIFY_DUPLICATE_ORDER_TAGS_CHANGED
        )
    }

    render() {
        const {editable, payload, currencyCode, actionName} = this.props
        const {note} = this.state
        const tags = payload.get('tags') || ''

        return (
            <Container fluid className={css.container}>
                <Row>
                    <Col xs={{size: 12, order: 2}} lg={{size: 6, order: 1}}>
                        <div className="mb-4">
                            <h4>Notes</h4>
                            <textarea
                                rows={1}
                                className="form-control"
                                placeholder="Add a note..."
                                value={note}
                                onChange={this._onNoteChange}
                            />
                        </div>
                        <div>
                            <h4>Tags</h4>
                            <MultiSelectOptionsField
                                options={OrderFooterComponent.tagsToOptions(
                                    this._defaultTags
                                )}
                                selectedOptions={OrderFooterComponent.tagsToOptions(
                                    tags
                                )}
                                plural="tags"
                                singular="tag"
                                onChange={this._onTagsChange}
                                allowCustomOptions
                                matchInput
                                className={css.tagsDropdown}
                            />
                        </div>
                    </Col>
                    <Col
                        xs={{size: 12, order: 1}}
                        lg={{size: 6, order: 2}}
                        className="mb-xs-4"
                    >
                        <OrderTotals
                            editable={editable}
                            actionName={actionName}
                            currencyCode={currencyCode}
                        />
                    </Col>
                </Row>
            </Container>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    payload: getCreateOrderState(state).get('payload'),
})

const mapDispatchToProps = {
    onPayloadChange,
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OrderFooterComponent)
