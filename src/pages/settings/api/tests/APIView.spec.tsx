import React, { ComponentProps } from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import copy from 'copy-to-clipboard'

import { assumeMock } from 'utils/testing'

import { APIViewContainer } from '../APIView'

jest.mock('copy-to-clipboard')
const copyMock = assumeMock(copy)

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
            const { container } = render(
                <APIViewContainer
                    {...minProps}
                    apiKey="4a75a69bb409c2cd4041df29f5791103acaf0991bf0d0b3fa022951830482510"
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a Create API Key Button', () => {
            const { container } = render(<APIViewContainer {...minProps} />)

            expect(container.firstChild).toMatchSnapshot()
        })

        it("should change apiKeyType's value when clicking the visibility icon", () => {
            render(
                <APIViewContainer
                    {...minProps}
                    apiKey="4a75a69bb409c2cd4041df29f5791103acaf0991bf0d0b3fa022951830482510"
                />,
            )

            act(() => {
                userEvent.click(
                    screen.getByRole('button', { name: 'visibility' }),
                )
            })

            expect(
                screen.getByRole('textbox', { name: /Password/ }),
            ).toHaveAttribute('type', 'text')
        })

        it('should copy the base URL to clipboard when clicking the copy button', () => {
            render(<APIViewContainer {...minProps} />)

            act(() => {
                userEvent.click(document.getElementsByClassName('copyBtn')[0])
            })

            expect(screen.getByText('Copied!')).toBeInTheDocument()
            expect(copyMock).toHaveBeenCalledWith(
                `https://${minProps.domain}.gorgias.com/api/`,
            )
        })

        it('should copy the base user email to clipboard when clicking the copy button', () => {
            const email = 'test@gorgias.com'
            render(<APIViewContainer {...minProps} email={email} />)

            act(() => {
                userEvent.click(document.getElementsByClassName('copyBtn')[1])
            })

            expect(screen.getByText('Copied!')).toBeInTheDocument()
            expect(copyMock).toHaveBeenCalledWith(email)
        })

        it('should copy the API key to clipboard when clicking the copy button', () => {
            const apiKey =
                '4a75a69bb409c2cd4041df29f5791103acaf0991bf0d0b3fa022951830482510'
            render(<APIViewContainer {...minProps} apiKey={apiKey} />)

            act(() => {
                userEvent.click(document.getElementsByClassName('copyBtn')[2])
            })

            expect(screen.getByText('Copied!')).toBeInTheDocument()
            expect(copyMock).toHaveBeenCalledWith(apiKey)
        })
    })
})
