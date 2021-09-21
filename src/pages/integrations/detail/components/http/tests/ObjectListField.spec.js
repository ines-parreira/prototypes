import React from 'react'
import {shallow} from 'enzyme'

import ObjectListField from '../ObjectListField.tsx'

describe('ObjectListField component', () => {
    it('should display the field as empty', () => {
        const component = shallow(
            <ObjectListField
                name="http.form"
                fieldName="field"
                title="Form field"
                fields={[]}
                validate={() => {}}
                onChange={() => {}}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display the field with items', () => {
        const component = shallow(
            <ObjectListField
                name="http.form"
                fieldName="field"
                title="Form field"
                fields={[{foo: 'bar', baz: 'foo'}]}
                validate={() => 'Header name contains invalid characters'}
                onChange={() => {}}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should allow any field name if this.props.validate is not presented', () => {
        const component = shallow(
            <ObjectListField
                name="http.form"
                fieldName="field"
                title="Form field"
                fields={[{foo: 'bar', baz: 'foo'}]}
                onChange={() => {}}
            />
        )
        expect(
            component.find('InputField').getElements()[0].props.pattern
        ).toBeNull()
    })
})
