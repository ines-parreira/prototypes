import {humanizeString} from 'utils'
import {WrapperTemplate} from 'models/widget/types'
import {IntegrationType} from 'models/integration/types'
import {httpIntegration} from 'fixtures/integrations'
import {
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    THIRD_PARTY_APP_NAME_KEY,
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'
import {WidgetType} from 'state/widgets/types'

import {getWidgetId, getWidgetTitle, LABELS} from '../helpers'

describe('helpers tests', () => {
    describe('getWidgetId()', () => {
        it('should render snake cased name', () => {
            const widgetId = getWidgetId('foo bar')
            expect(widgetId).toBe('foo_bar')
        })
    })

    describe('getWidgetTitle()', () => {
        const baseProps = {
            source: {},
        }
        const template: WrapperTemplate = {
            type: 'wrapper',
            widgets: [{type: 'card', title: 'foo', path: '', widgets: []}],
            templatePath: '',
            path: '',
        }

        describe('template title', () => {
            it('should return exclusively template title if provided', () => {
                expect(
                    getWidgetTitle({
                        ...baseProps,
                        widgetType: IntegrationType.Shopify,
                        template: {...template, title: 'foo'},
                    })
                ).toBe('foo')
            })

            it('should return the templated title if a matching source is provided', () => {
                expect(
                    getWidgetTitle({
                        ...baseProps,
                        widgetType: IntegrationType.Shopify,
                        template: {...template, title: '{{foo}}'},
                        source: {foo: 'bar'},
                    })
                ).toBe('bar')
            })
        })

        describe('integration widget title', () => {
            it("should return the integration's type", () => {
                expect(
                    getWidgetTitle({
                        ...baseProps,
                        widgetType: IntegrationType.Shopify,
                    })
                ).toBe('Shopify')
            })

            it("should return the special label of some integration's type", () => {
                expect(
                    getWidgetTitle({
                        ...baseProps,
                        widgetType: IntegrationType.Magento2,
                    })
                ).toBe(LABELS[IntegrationType.Magento2])
            })

            it('should return integration’s humanized name if widget type is HTTP', () => {
                expect(
                    getWidgetTitle({
                        ...baseProps,
                        widgetType: IntegrationType.Http,
                        integration: httpIntegration,
                    })
                ).toBe(httpIntegration.name)
            })
        })

        describe('external data widget title', () => {
            it('should return the app name if provided in the source', () => {
                expect(
                    getWidgetTitle({
                        ...baseProps,
                        widgetType: CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
                        source: {[THIRD_PARTY_APP_NAME_KEY]: 'foo'},
                    })
                ).toBe('foo')
            })

            it('should return the appId if no app name is provided', () => {
                expect(
                    getWidgetTitle({
                        ...baseProps,
                        widgetType: CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
                        appId: 'foo',
                    })
                ).toBe('foo')
            })
        })

        describe('ecommerce widget title', () => {
            it('should return default label for this widget type', () => {
                expect(
                    getWidgetTitle({
                        ...baseProps,
                        widgetType: WOOCOMMERCE_WIDGET_TYPE,
                    })
                ).toBe(LABELS[WOOCOMMERCE_WIDGET_TYPE])
            })
        })

        describe('fallback return', () => {
            it('should return first widget title in case none of the logic above applies', () => {
                expect(
                    getWidgetTitle({
                        ...baseProps,
                        template,
                        widgetType: STANDALONE_WIDGET_TYPE,
                    })
                ).toBe(template?.widgets?.[0].title)
            })

            it('should return default label for some widget types in case none of the logic above applies', () => {
                expect(
                    getWidgetTitle({
                        ...baseProps,
                        template: undefined,
                        widgetType: STANDALONE_WIDGET_TYPE,
                    })
                ).toBe(LABELS[STANDALONE_WIDGET_TYPE])
            })

            // not sure this would ever happen
            it('should return humanized widget type in last resort', () => {
                expect(
                    getWidgetTitle({
                        ...baseProps,
                        widgetType: IntegrationType.Phone as WidgetType,
                    })
                ).toBe(humanizeString(IntegrationType.Phone))
            })
        })
    })
})
