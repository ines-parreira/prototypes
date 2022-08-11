import React, {Component, ChangeEvent, ContextType} from 'react'
import {Col, Container, Row} from 'reactstrap'
import {Map} from 'immutable'
import {connect} from 'react-redux'
import _debounce from 'lodash/debounce'

import {uniqBy} from 'lodash'
import css from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/shared/DraftOrderModal/OrderFooter/OrderFooter.less'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {Option} from 'pages/common/forms/MultiSelectOptionsField/types'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import OrderTotals from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/shared/DraftOrderModal/OrderFooter/OrderTotals/OrderTotals'
import {reportError} from 'utils/errors'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {ShopifyActionType} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/types'
import {RootState} from 'state/types'
import {getCreateOrderState} from 'state/infobarActions/shopify/createOrder/selectors'
import {onPayloadChange} from 'state/infobarActions/shopify/createOrder/actions'
import {ShopifyTags} from 'models/integration/types'
import {fetchShopTags} from 'models/integration/resources/shopify'
import {getOptionsFromTags} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/utils'
import {getLoggerOnTagSelectionEvent} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/logEventData'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

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
    currentAccount: Map<any, any>
    widgetData?: Record<string, any>
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
    context!: ContextType<typeof IntegrationContext>

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
        onPayloadChange(integrationId!, newPayload, false)
    }, 250)

    _trackNoteChanged = _debounce(() => {
        const {actionName} = this.props

        logEvent(
            actionName === ShopifyActionType.CreateOrder
                ? SegmentEvent.ShopifyCreateOrderNotesChanged
                : SegmentEvent.ShopifyDuplicateOrderNotesChanged
        )
    }, 1000)

    _onTagsChange = (tags: Option[]) => {
        const {onPayloadChange, payload, actionName} = this.props
        const {integrationId} = this.context
        const newValue = tags.map((option) => option.value as string).join(',')
        const newPayload = payload.set('tags', newValue)

        onPayloadChange(integrationId!, newPayload, false)
        logEvent(
            actionName === ShopifyActionType.CreateOrder
                ? SegmentEvent.ShopifyCreateOrderTagsChanged
                : SegmentEvent.ShopifyDuplicateOrderTagsChanged
        )
    }

    handleFocus = async () => {
        const {integrationId} = this.context
        if (integrationId) {
            let tags: string[] = []

            try {
                tags = await fetchShopTags(integrationId, ShopifyTags.orders)
            } catch (e) {
                reportError(e)
            }

            const tagsOptions = getOptionsFromTags(tags)
            this.setState({
                options: tagsOptions,
            })
        }
    }

    render() {
        const {
            editable,
            payload,
            currencyCode,
            actionName,
            widgetData,
            currentAccount,
        } = this.props
        const {note, options} = this.state
        const tags = payload.get('tags') || ''

        let tagsOptions = options.concat(
            OrderFooterComponent.tagsToOptions(this._defaultTags)
        )

        tagsOptions = uniqBy(tagsOptions, (tag) => tag.label)

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
                                options={tagsOptions}
                                selectedOptions={OrderFooterComponent.tagsToOptions(
                                    tags
                                )}
                                plural="tags"
                                singular="tag"
                                onChange={this._onTagsChange}
                                onFocus={this.handleFocus}
                                allowCustomOptions
                                matchInput
                                className={css.tagsDropdown}
                                onSelectTag={
                                    actionName === ShopifyActionType.CreateOrder
                                        ? getLoggerOnTagSelectionEvent(
                                              {
                                                  account_id:
                                                      currentAccount.get(
                                                          'domain'
                                                      ),
                                                  customer_id:
                                                      widgetData?.customer_id ||
                                                      widgetData?.target_id,
                                                  order_id: null,
                                              },
                                              SegmentEvent.ShopifyCreateOrderTagsSuggestionUsed
                                          )
                                        : getLoggerOnTagSelectionEvent(
                                              {
                                                  account_id:
                                                      currentAccount.get(
                                                          'domain'
                                                      ),
                                                  customer_id:
                                                      widgetData?.customer_id ||
                                                      widgetData?.target_id,
                                                  order_id:
                                                      widgetData?.target_id,
                                              },
                                              SegmentEvent.ShopifyDuplicateOrderTagsSuggestionUsed
                                          )
                                }
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
    currentAccount: getCurrentAccountState(state),
})

const mapDispatchToProps = {
    onPayloadChange,
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OrderFooterComponent)
