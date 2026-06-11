import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { ObjectListField } from 'pages/integrations/integration/components/http/Integration/ObjectListField'

describe('ObjectListField component', () => {
    const minProps: ComponentProps<typeof ObjectListField> = {
        fieldName: 'field',
        title: 'Form field',
        fields: [],
        validate: jest.fn(),
        onChange: jest.fn(),
    }
    it('should display the field as empty', () => {
        render(<ObjectListField {...minProps} />)

        expect(screen.getByText('Form fields')).toBeInTheDocument()
        expect(screen.getByText('No field')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /add field/i }),
        ).toBeInTheDocument()
    })

    it('should display the field with items', () => {
        render(
            <ObjectListField
                {...minProps}
                fields={[{ key: 'bar', value: 'foo' }]}
                validate={() => 'Header name contains invalid characters'}
            />,
        )

        expect(screen.getByDisplayValue('bar')).toBeInTheDocument()
        expect(screen.getByDisplayValue('foo')).toBeInTheDocument()
        expect(
            screen.getAllByText('Header name contains invalid characters'),
        ).toHaveLength(2)
        expect(screen.getByTitle('Remove field')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /add field/i }),
        ).toBeInTheDocument()
    })

    it('should allow any field name if this.props.validate is not presented', () => {
        render(
            <ObjectListField
                {...minProps}
                fields={[{ key: 'bar', value: 'foo' }]}
            />,
        )
        expect(
            screen.getByPlaceholderText('Key').getAttribute('pattern'),
        ).toBeNull()
    })
})
