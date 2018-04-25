import React from 'react'
import {shallow} from 'enzyme'
import ObjectListField from '../ObjectListField'

describe('ObjectListField component', () => {
    it('should display the field as empty', () => {
        const component = shallow(
            <ObjectListField
                name="http.form"
                fieldName="field"
                title="Form field"
                fields={[]}
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
                fields={[{'foo': 'bar', 'baz': 'foo'}]}
                onChange={() => {}}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
