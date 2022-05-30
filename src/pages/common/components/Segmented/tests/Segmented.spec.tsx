import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import Segmented from '../Segmented'

const options = [
    {
        value: 'self-service',
        label: 'Self-Service',
    },
    {
        value: 'article-recommendation',
        label: 'Article Recommendation',
    },
]

describe('<Segmented />', () => {
    it('should match snapshot', () => {
        const {container} = render(
            <Segmented
                options={options}
                value="self-service"
                onChange={jest.fn()}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('changes the checked option internally and calls the onChange callback', () => {
        const onChangeFn = jest.fn()
        const {getByLabelText} = render(
            <Segmented
                options={options}
                value="self-service"
                onChange={onChangeFn}
            />
        )

        fireEvent.click(getByLabelText('Article Recommendation'))
        expect(onChangeFn).toHaveBeenCalledWith(
            expect.anything(),
            'article-recommendation'
        )
    })

    it('does not call the change callback for a disabled option', () => {
        const onChangeFn = jest.fn()
        const {getByLabelText} = render(
            <Segmented
                options={[
                    ...options,
                    {
                        value: 'disabled-option',
                        label: 'Disabled option',
                        disabled: true,
                    },
                ]}
                value="self-service"
                onChange={onChangeFn}
            />
        )

        fireEvent.click(getByLabelText('Disabled option'))
        expect(onChangeFn).not.toHaveBeenCalled()
    })
})
