import type { ChangeEvent, ContextType, RefObject } from 'react'
import React, { Component } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import type { Map } from 'immutable'
import { uniqBy } from 'lodash'
import _debounce from 'lodash/debounce'
import { connect } from 'react-redux'
import { Col, Container, Row } from 'reactstrap'

import { fetchShopTags } from 'models/integration/resources/shopify'
import { ShopifyTags } from 'models/integration/types'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import type { Option } from 'pages/common/forms/MultiSelectOptionsField/types'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { onPayloadChange } from 'state/infobarActions/shopify/createOrder/actions'
import { getCreateOrderState } from 'state/infobarActions/shopify/createOrder/selectors'
import type { RootState } from 'state/types'
import OrderTotals from 'Widgets/modules/Shopify/modules/DraftOrderModal/components/OrderTotals'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

import css from './OrderFooter.less'

type Props = {
    editable: boolean
    actionName: ShopifyActionType
    currencyCode: string
    payload: Map<any, any>
    onPayloadChange: (
        integrationId: number,
        record: Map<any, any>,
        shouldCalculate?: boolean,
    ) => void
    container?: RefObject<HTMLDivElement>
}

type State = {
    note: string
    options: Option[]
}

export class OrderFooterComponent extends Component<Props, State> {
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

    state: State = {
        note: this.props.payload.get('note') || '',
        options: [],
    }
    static contextType = IntegrationContext
    declare context: ContextType<typeof IntegrationContext>

    _defaultTags = this.props.payload.get('tags') || ''

    _onNoteChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const padding = 2
        const element = event.target
        const note = element.value

        this.setState({ note })
        this._updatePayload()
        this._trackNoteChanged()

        // Adjust textarea's height
        element.style.height = '1px'
        element.style.height = `${element.scrollHeight + padding}px`
    }

    _updatePayload = _debounce(() => {
        const { onPayloadChange, payload } = this.props
        const { integrationId } = this.context
        const { note } = this.state
        const newPayload = payload.set('note', note)
        onPayloadChange(integrationId!, newPayload, false)
    }, 250)

    _trackNoteChanged = _debounce(() => {
        const { actionName } = this.props

        logEvent(
            actionName === ShopifyActionType.CreateOrder
                ? SegmentEvent.ShopifyCreateOrderNotesChanged
                : SegmentEvent.ShopifyDuplicateOrderNotesChanged,
        )
    }, 1000)

    _onTagsChange = (tags: Option[]) => {
        const { onPayloadChange, payload } = this.props
        const { integrationId } = this.context
        const newValue = tags.map((option) => option.value as string).join(',')
        const newPayload = payload.set('tags', newValue)

        onPayloadChange(integrationId!, newPayload, false)
    }

    handleFocus = async () => {
        const { integrationId } = this.context
        if (integrationId) {
            let tags: string[] = []

            try {
                tags = await fetchShopTags(integrationId, ShopifyTags.orders)
            } catch {
                // silent fail
                return
            }

            this.setState({
                options: tags.map((tag) => ({ label: tag, value: tag })),
            })
        }
    }

    render() {
        const { editable, payload, currencyCode, actionName, container } =
            this.props
        const { note, options } = this.state
        const tags = payload.get('tags') || ''

        let tagsOptions = options.concat(
            OrderFooterComponent.tagsToOptions(this._defaultTags),
        )

        tagsOptions = uniqBy(tagsOptions, (tag) => tag.label)

        return (
            <Container fluid className={css.container}>
                <Row>
                    <Col xs={{ size: 12, order: 2 }} lg={{ size: 6, order: 1 }}>
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
                                options={tagsOptions}
                                selectedOptions={OrderFooterComponent.tagsToOptions(
                                    tags,
                                )}
                                plural="tags"
                                singular="tag"
                                onChange={this._onTagsChange}
                                onFocus={this.handleFocus}
                                allowCustomOptions
                                matchInput
                                className={css.tagsDropdown}
                            />
                        </div>
                    </Col>
                    <Col
                        xs={{ size: 12, order: 1 }}
                        lg={{ size: 6, order: 2 }}
                        className="mb-xs-4"
                    >
                        <OrderTotals
                            editable={editable}
                            actionName={actionName}
                            currencyCode={currencyCode}
                            container={container}
                        />
                    </Col>
                </Row>
            </Container>
        )
    }
}

const mapStateToProps = (state: RootState) => ({
    payload: getCreateOrderState(state).get('payload'),
    currentAccount: getCurrentAccountState(state),
})

const mapDispatchToProps = {
    onPayloadChange,
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(OrderFooterComponent)
