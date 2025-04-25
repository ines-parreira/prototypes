import React from 'react'

import { render } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import { ActivationManageButton } from '../ActivationManageButton'

describe('<ActivationManageButton />', () => {
    it.each([
        { progress: 0, text: 'Activate AI Agent' },
        { progress: 50, text: 'Partially activated' },
        { progress: 100, text: 'Fully activated' },
    ])(
        'should render the button with "$text" when progress is $progress',
        ({ progress, text }) => {
            const { getByText } = render(
                <ActivationManageButton
                    onClick={jest.fn()}
                    progress={progress}
                />,
            )

            expect(getByText(text)).toBeInTheDocument()
            expect(getByText(`${progress}%`)).toBeInTheDocument()
            expect(getByText('Manage')).toBeInTheDocument()
        },
    )
})
