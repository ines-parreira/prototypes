import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, {ComponentProps} from 'react'

import {APIViewContainer} from '../APIView'

jest.mock('copy-to-clipboard')

describe('<APIView/>', () => {
    const minProps: ComponentProps<typeof APIViewContainer> = {
        apiKey: '',
        email: '',
        domain: 'justatest',
        fetchCurrentAuths: jest.fn(),
        notify: jest.fn(),
        resetApiKey: jest.fn(),
    }

    describe('render()', () => {
        it('should render a Reset Button', () => {
            const {container} = render(
                <APIViewContainer
                    {...minProps}
                    apiKey="4a75a69bb409c2cd4041df29f5791103acaf0991bf0d0b3fa022951830482510"
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a Create API Key Button', () => {
            const {container} = render(<APIViewContainer {...minProps} />)

            expect(container.firstChild).toMatchSnapshot()
        })

        it("should change apiKeyType's value when clicking the visibility icon", () => {
            render(
                <APIViewContainer
                    {...minProps}
                    apiKey="4a75a69bb409c2cd4041df29f5791103acaf0991bf0d0b3fa022951830482510"
                />
            )

            act(() => {
                userEvent.click(
                    screen.getByRole('button', {name: 'visibility'})
                )
            })

            expect(
                screen.getByRole('textbox', {name: /Password/})
            ).toHaveAttribute('type', 'text')
        })

        it('should copy the apiKey content to clipboard when clicking the copy button', () => {
            render(
                <APIViewContainer
                    {...minProps}
                    apiKey="4a75a69bb409c2cd4041df29f5791103acaf0991bf0d0b3fa022951830482510"
                />
            )

            act(() => {
                userEvent.click(document.getElementsByClassName('copyBtn')[0])
            })

            expect(screen.getByText('Copied!')).toBeInTheDocument()
        })
    })
})
