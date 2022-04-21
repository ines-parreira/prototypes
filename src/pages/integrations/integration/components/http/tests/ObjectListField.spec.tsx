import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'

import ObjectListField from '../ObjectListField'

describe('ObjectListField component', () => {
    const minProps: ComponentProps<typeof ObjectListField> = {
        fieldName: 'field',
        title: 'Form field',
        fields: [],
        validate: jest.fn(),
        onChange: jest.fn(),
    }
    it('should display the field as empty', () => {
        const component = shallow(<ObjectListField {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should display the field with items', () => {
        const component = shallow(
            <ObjectListField
                {...minProps}
                fields={[{key: 'bar', value: 'foo'}]}
                validate={() => 'Header name contains invalid characters'}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should allow any field name if this.props.validate is not presented', () => {
        const component = shallow<ObjectListField>(
            <ObjectListField
                {...minProps}
                fields={[{key: 'bar', value: 'foo'}]}
            />
        )
        expect(
            (
                component.find('InputField').getElements()[0].props as Record<
                    string,
                    unknown
                >
            ).pattern
        ).toBeUndefined()
    })
})
