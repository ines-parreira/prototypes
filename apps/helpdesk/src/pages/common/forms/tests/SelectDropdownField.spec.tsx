import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { LegacySelectField as SelectField } from '@gorgias/axiom'

import SelectDropdownField from '../SelectDropdownField'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    LegacySelectField: jest.fn(),
}))

const SelectFieldMock = assumeMock(SelectField)
SelectFieldMock.mockReturnValue(<div>Mocked SelectField</div>)

describe('SelectDropdownField', () => {
    it('should render SelectField with correct props', () => {
        render(
            <SelectDropdownField
                options={[]}
                onChange={jest.fn()}
                value={'value'}
            />,
        )

        expect(SelectFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                options: [],
                onChange: expect.any(Function),
                selectedOption: 'value',
            }),
            {},
        )
    })
})
