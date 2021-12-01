import {SHOPIFY_WIDGET_TYPE, SMOOCH_INSIDE_WIDGET_TYPE} from '../constants'
import {getWidgetLabel} from '../predicates'

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
