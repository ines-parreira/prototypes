import { userEvent } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { RootState, StoreDispatch } from 'state/types'

import ImageField, { ImageFieldVariant } from '../ImageField'

const mockStore = configureMockStore<RootState, StoreDispatch>()

jest.mock('common/utils', () => {
    const mockedUtils = jest.requireActual('common/utils')
    return {
        ...mockedUtils,
        uploadFiles: jest.fn(() => Promise.resolve([{ url: 'testUrl' }])),
    } as unknown
})

const onChangeMock = jest.fn()

const defaultState = {} as RootState

describe('<ImageField />', () => {
    it.each([
        ['an avatar image', ImageFieldVariant.Avatar],
        ['a header image', ImageFieldVariant.Header],
    ])('renders %s', async (_, variant) => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <ImageField
                    onChange={onChangeMock}
                    maxSize={500 * 1000}
                    variant={variant}
                />
            </Provider>,
        )

        expect(screen.getByText('Upload image')).toBeInTheDocument()

        const testFile = new File(['test'], 'test.png', { type: 'image/png' })
        const fileInput = container.querySelector('input')

        userEvent.upload(fileInput!, testFile)

        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith('testUrl')
        })
    })

    it('discards an image', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <ImageField
                    onChange={onChangeMock}
                    isDiscardable={true}
                    url="testUrl"
                    maxSize={500 * 1000}
                />
            </Provider>,
        )

        expect(screen.getByText('Replace image')).toBeInTheDocument()

        const closeIcon = screen.getByText('close')

        fireEvent.click(closeIcon)

        expect(onChangeMock).toHaveBeenLastCalledWith('')
    })
})
