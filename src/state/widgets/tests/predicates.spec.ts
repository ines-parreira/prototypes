import {fromJS} from 'immutable'
import {Widget, WidgetType} from 'state/widgets/types'
import {humanizeString} from 'utils'
import {Integration, IntegrationType} from 'models/integration/types'
import {getWidgetId, getWidgetLabel, getWidgetName} from '../predicates'
import {
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    HTTP_WIDGET_TYPE,
    SHOPIFY_WIDGET_TYPE,
    SMOOCH_INSIDE_WIDGET_TYPE,
    THIRD_PARTY_APP_NAME_KEY,
} from '../constants'

describe('predicates tests', () => {
    describe('getWidgetLabel()', () => {
        it('should render custom label', () => {
            const label = getWidgetLabel(SMOOCH_INSIDE_WIDGET_TYPE)
            expect(label).toMatchSnapshot()
        })

        it('should render default label', () => {
            const label = getWidgetLabel(SHOPIFY_WIDGET_TYPE)
            expect(label).toMatchSnapshot()
        })
    })

    describe('getWidgetId()', () => {
        it('should render snake cased name', () => {
            const widgetId = getWidgetId('some - random _ass name 1234````')
            expect(widgetId).toMatchSnapshot()
        })
    })

    describe('getWidgetName()', () => {
        it('should render widget title', () => {
            const myCustomWidgetTitle = 'my-custom-widget-title'
            const source = fromJS({})
            const widget = {
                type: CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE as WidgetType,
            } as Widget
            const templatePath = ['doesntMatter']

            const widgetName = getWidgetName({
                source,
                widgetType: widget.type,
                widgetAppId: widget?.app_id,
                templatePath,
                integration: {} as Integration,
                widgetTitle: myCustomWidgetTitle,
            })
            expect(widgetName).toEqual(myCustomWidgetTitle)
        })

        it('should render third party app name because it has it as a key in the source', () => {
            const appName = 'the-best-app-name yooo'
            const source = fromJS({
                [THIRD_PARTY_APP_NAME_KEY]: appName,
            })
            const widget = {
                type: 'doesnt_matter' as Integration['type'],
            } as Widget
            const templatePath = ['doesntMatter']

            const widgetName = getWidgetName({
                source,
                widgetType: widget.type,
                widgetAppId: widget?.app_id,
                templatePath,
            })
            expect(widgetName).toEqual(appName)
        })

        it(`should render third party app name because the widget is of type ${CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE}`, () => {
            const appName = 'the-best-app-name yooo'
            const source = fromJS({
                ticket: {
                    customer: {
                        external_data: {
                            '123': {
                                [THIRD_PARTY_APP_NAME_KEY]: appName,
                            },
                        },
                    },
                },
            })
            const widget = {
                type: CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
            } as Widget
            const templatePath = ['ticket', 'customer', 'external_data', '123']

            const widgetName = getWidgetName({
                source,
                widgetType: widget.type,
                widgetAppId: widget?.app_id,
                templatePath,
            })

            expect(widgetName).toEqual(appName)
        })

        it(`should render third party appId because couldn't find the thirdPartyAppName by ${THIRD_PARTY_APP_NAME_KEY}`, () => {
            const appId = '123abcd'
            const source = fromJS({
                ticket: {
                    customer: {
                        external_data: {
                            appId: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            })
            const widget = {
                type: CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
                app_id: appId,
            } as Widget
            const templatePath = ['ticket', 'customer', 'external_data', '123']

            const widgetName = getWidgetName({
                source,
                widgetType: widget.type,
                widgetAppId: widget?.app_id,
                templatePath,
            })

            expect(widgetName).toEqual(appId)
        })

        it('should render http integration name', () => {
            const source = fromJS({doesnt: 'matter'})
            const widget = {
                type: HTTP_WIDGET_TYPE as WidgetType,
            } as Widget
            const templatePath = ['doesntMatter']
            const integration = {
                id: 999,
                name: 'my awesome http integration',
                type: IntegrationType.Http,
            } as Integration

            const widgetName = getWidgetName({
                source,
                widgetType: widget.type,
                widgetAppId: widget?.app_id,
                templatePath,
                integration,
            })
            expect(widgetName).toEqual(integration.name)
        })

        it(`should render default name defined for ${IntegrationType.SmoochInside} integration`, () => {
            const source = fromJS({doesnt: 'matter'})
            const widget = {
                type: SMOOCH_INSIDE_WIDGET_TYPE,
            } as Widget
            const templatePath = ['doesntMatter']
            const integration = {
                id: 999,
                name: 'my awesome SMOOCH INSIDE integration',
                type: IntegrationType.SmoochInside,
            } as Integration

            const widgetName = getWidgetName({
                source,
                widgetType: widget.type,
                widgetAppId: widget?.app_id,
                templatePath,
                integration,
            })
            expect(widgetName).toMatchSnapshot()
        })

        it(`should render integration type`, () => {
            const source = fromJS({doesnt: 'matter'})
            const widget = {
                type: SHOPIFY_WIDGET_TYPE,
            } as Widget
            const templatePath = ['doesntMatter']
            const integration = {
                id: 999,
                name: 'my awesome SHOPIFY integration',
                type: IntegrationType.Shopify,
            } as Integration

            const widgetName = getWidgetName({
                source,
                widgetType: widget.type,
                widgetAppId: widget?.app_id,
                templatePath,
                integration,
            })
            expect(widgetName).toEqual(humanizeString(integration.type))
        })

        it.each([
            IntegrationType.Http,
            IntegrationType.Magento2,
            IntegrationType.SmoochInside,
            CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
        ])(
            'should render default names defined for widgetType',
            (widgetType: string) => {
                const source = fromJS({doesnt: 'matter'})
                const widget = {
                    type: widgetType,
                } as Widget
                const templatePath = ['doesntMatter']

                const widgetName = getWidgetName({
                    source,
                    widgetType: widget.type,
                    widgetAppId: widget?.app_id,
                    templatePath,
                })
                expect(widgetName).toMatchSnapshot()
            }
        )

        it('should render widgetType', () => {
            const source = fromJS({doesnt: 'matter'})
            const widget = {
                type: SHOPIFY_WIDGET_TYPE,
            } as Widget
            const templatePath = ['doesntMatter']

            const widgetName = getWidgetName({
                source,
                widgetType: widget.type,
                widgetAppId: widget?.app_id,
                templatePath,
            })
            expect(widgetName).toEqual(humanizeString(widget.type))
        })
    })
})
