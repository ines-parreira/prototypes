// @flow

import React from 'react'
import {Col, Container, Row} from 'reactstrap'
import {type Record} from 'immutable'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import _debounce from 'lodash/debounce'

import {getCreateOrderState} from '../../../../../../../../../../../state/infobarActions/shopify/createOrder/selectors'
import {onPayloadChange} from '../../../../../../../../../../../state/infobarActions/shopify/createOrder/actions'
import MultiSelectOptionsField, {type Option} from '../../../../../../../../../forms/MultiSelectOptionsField'
import * as segmentTracker from '../../../../../../../../../../../store/middlewares/segmentTracker'
import * as Shopify from '../../../../../../../../../../../constants/integrations/shopify'
import {ShopifyAction} from '../../constants'

import OrderTotals from './OrderTotals'
import css from './OrderFooter.less'

type Props = {
    editable: boolean,
    actionName: string,
    currencyCode: string,
    payload: Record<$Shape<Shopify.DraftOrder>>,
    onPayloadChange: (integrationId: number, Record<$Shape<Shopify.DraftOrder>>) => void,
}

type State = {
    note: string,
}

export class DuplicateOrderFooterComponent extends React.PureComponent<Props, State> {
    static contextTypes = {
        integrationId: PropTypes.number.isRequired,
    }

    static tagsToOptions(tags: string = ''): Option[] {
        return tags.split(',')
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

    _onNoteChange = (event: SyntheticInputEvent<HTMLTextAreaElement>) => {
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
        onPayloadChange(integrationId, newPayload)
    }, 250)

    _trackNoteChanged = _debounce(() => {
        const {actionName} = this.props

        segmentTracker.logEvent(
            actionName === ShopifyAction.CREATE_ORDER
                ? segmentTracker.EVENTS.SHOPIFY_CREATE_ORDER_NOTES_CHANGED
                : segmentTracker.EVENTS.SHOPIFY_DUPLICATE_ORDER_NOTES_CHANGED
        )
    }, 1000)

    _onTagsChange = (tags: Option[]) => {
        const {onPayloadChange, payload, actionName} = this.props
        const {integrationId} = this.context

        const newValue = tags.map((option) => option.value).join(',')
        const newPayload = payload.set('tags', newValue)

        onPayloadChange(integrationId, newPayload)
        segmentTracker.logEvent(
            actionName === ShopifyAction.CREATE_ORDER
                ? segmentTracker.EVENTS.SHOPIFY_CREATE_ORDER_TAGS_CHANGED
                : segmentTracker.EVENTS.SHOPIFY_DUPLICATE_ORDER_TAGS_CHANGED
        )
    }

    render() {
        const {editable, payload, currencyCode, actionName} = this.props
        const {note} = this.state
        const tags = payload.get('tags') || ''

        return (
            <Container
                fluid
                className={css.container}
            >
                <Row>
                    <Col
                        xs={{size: 12, order: 2}}
                        lg={{size: 6, order: 1}}
                    >
                        <div className="mb-4">
                            <h4>Notes</h4>
                            <textarea
                                rows="1"
                                className="form-control"
                                placeholder="Add a note..."
                                value={note}
                                onChange={this._onNoteChange}
                            />
                        </div>
                        <div>
                            <h4>Tags</h4>
                            <MultiSelectOptionsField
                                options={DuplicateOrderFooterComponent.tagsToOptions(this._defaultTags)}
                                selectedOptions={DuplicateOrderFooterComponent.tagsToOptions(tags)}
                                plural="tags"
                                singular="tag"
                                onChange={this._onTagsChange}
                                allowCustomOptions
                                matchInput
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

const mapStateToProps = (state) => ({
    payload: getCreateOrderState(state).get('payload'),
})

const mapDispatchToProps = {
    onPayloadChange,
}

export default connect(mapStateToProps, mapDispatchToProps)(DuplicateOrderFooterComponent)
