import {WidgetContextType} from 'state/widgets/types'
import {
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
} from 'state/widgets/constants'
import {getSourcePathFromContext} from '../utils'

describe('getSourcePathFromContext()', () => {
    it('should render defaultSourcePath for ticket context because unknown context type', () => {
        const sourcePath = getSourcePathFromContext(
            'some_random_context' as WidgetContextType,
            ''
        )

        expect(sourcePath).toMatchSnapshot()
    })

    it('should render values of config because unknown widget type', () => {
        const sourcePath = getSourcePathFromContext(
            WidgetContextType.Ticket,
            ''
        )

        expect(sourcePath).toMatchSnapshot()
    })

    it('should not append to the same array', () => {
        const sourcePath = getSourcePathFromContext(
            WidgetContextType.Ticket,
            CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE
        ) as string[]

        sourcePath.push('1')

        const sourcePath2 = getSourcePathFromContext(
            WidgetContextType.Ticket,
            CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE
        ) as string[]

        sourcePath2.push('2')

        expect(sourcePath.includes('2')).toBe(false)
        expect(sourcePath2.includes('1')).toBe(false)
    })

    it('should render the sourcePath for standalone widget because of wrong widget type', () => {
        const sourcePath = getSourcePathFromContext(
            WidgetContextType.Ticket,
            'abc_random_widget_type'
        )

        expect(sourcePath).toMatchSnapshot()
    })
    it.each([
        [WidgetContextType.Ticket, CUSTOM_WIDGET_TYPE],
        [WidgetContextType.Ticket, 'integrations'],
        [WidgetContextType.Ticket, CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE],
        [WidgetContextType.Customer, CUSTOM_WIDGET_TYPE],
        [WidgetContextType.Customer, 'integrations'],
        [WidgetContextType.Customer, CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE],
        [WidgetContextType.User, CUSTOM_WIDGET_TYPE],
        [WidgetContextType.User, 'integrations'],
        [WidgetContextType.User, CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE],
    ])(
        'should render the correct sourcePath',
        (widgetContextType: WidgetContextType, widgetType: string) => {
            const sourcePath = getSourcePathFromContext(
                widgetContextType,
                widgetType
            )

            expect(sourcePath).toMatchSnapshot(
                `getSourcePathFromContext() should render the correct sourcePath DEFAULT_SOURCE_PATHS[${widgetContextType}][${widgetType}]`
            )
        }
    )
})
