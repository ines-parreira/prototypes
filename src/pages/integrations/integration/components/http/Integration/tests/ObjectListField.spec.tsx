import {render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import ObjectListField from 'pages/integrations/integration/components/http/Integration/ObjectListField'

describe('ObjectListField component', () => {
    const minProps: ComponentProps<typeof ObjectListField> = {
        fieldName: 'field',
        title: 'Form field',
        fields: [],
        validate: jest.fn(),
        onChange: jest.fn(),
    }
    it('should display the field as empty', () => {
        const component = render(<ObjectListField {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should display the field with items', () => {
        const component = render(
            <ObjectListField
                {...minProps}
                fields={[{key: 'bar', value: 'foo'}]}
                validate={() => 'Header name contains invalid characters'}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should allow any field name if this.props.validate is not presented', () => {
        render(
            <ObjectListField
                {...minProps}
                fields={[{key: 'bar', value: 'foo'}]}
            />
        )
        expect(
            screen.getByPlaceholderText('Key').getAttribute('pattern')
        ).toBeNull()
    })
})
