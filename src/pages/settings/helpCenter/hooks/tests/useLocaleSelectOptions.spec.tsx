import React from 'react'
import {render} from '@testing-library/react'

import {LocaleCode} from '../../../../../models/helpCenter/types'

import {getLocalesResponseFixture} from '../../fixtures/getLocalesResponse.fixtures'

import {useLocaleSelectOptions} from '../useLocaleSelectOptions'

const availableLanguages = ['en-US']

const Example = () => {
    const options = useLocaleSelectOptions(
        getLocalesResponseFixture,
        availableLanguages as LocaleCode[]
    )

    return (
        <>
            {options.map((option) => (
                <div key={option.value}>
                    <span data-testid={`label-${option.value}`}>
                        {option.label}
                    </span>
                    <span data-testid={`text-${option.value}`}>
                        {option.text}
                    </span>
                    <span data-testid={`value-${option.value}`}>
                        {option.value}
                    </span>
                </div>
            ))}
        </>
    )
}

describe('useLocaleSelectOptions', () => {
    it('options has a label, text and value', () => {
        const {getByTestId, getByText} = render(<Example />)

        getByTestId('label-en-US')
        getByText('en-US')

        expect(getByTestId('text-en-US').innerHTML).toEqual('English - USA')
    })
})
