import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {useForm} from 'react-hook-form'

import {CustomActionFormInputValues} from '../../types'

import HttpRequestFormInput from '../HttpRequestFormInput'

jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))

describe('<HttpRequestFormInput />', () => {
    it('should render form with valid state', async () => {
        const {result} = renderHook(() =>
            useForm<CustomActionFormInputValues>({
                mode: 'onBlur',
                defaultValues: {
                    http: {
                        url: 'https://test.com',
                        method: 'GET',
                        headers: [],
                        name: '',
                        variables: [],
                        json: null,
                        formUrlencoded: null,
                        bodyContentType: null,
                    },
                },
            })
        )

        render(
            <HttpRequestFormInput
                control={result.current.control}
                variables={[]}
            />
        )

        expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument()

        act(() => {
            fireEvent.focus(screen.getAllByRole('combobox')[0])
        })

        await waitFor(() => {
            expect(screen.getByText('POST')).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByText('POST'))
        })

        expect(screen.getByText('POST')).toBeInTheDocument()
        expect(screen.getByText('{}')).toBeInTheDocument()

        act(() => {
            fireEvent.focus(screen.getAllByRole('combobox')[1])
        })

        await waitFor(() => {
            expect(
                screen.getByText('application/x-www-form-urlencoded')
            ).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(
                screen.getByText('application/x-www-form-urlencoded')
            )
        })

        expect(
            screen.getByText('application/x-www-form-urlencoded')
        ).toBeInTheDocument()

        act(() => {
            fireEvent.focus(screen.getAllByRole('combobox')[0])
        })

        await waitFor(() => {
            expect(screen.getByText('PUT')).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByText('PUT'))
        })

        expect(screen.getByText('PUT')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Add Body Data'))
        })

        expect(screen.getByText('Key and value pairs')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Add Header'))
        })

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Key')).toBeInTheDocument()
        })

        expect(screen.getByText('Headers are invalid')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })
    })

    it('should render form with invalid state', async () => {
        const {result} = renderHook(() =>
            useForm<CustomActionFormInputValues>({
                mode: 'onBlur',
                defaultValues: {
                    http: {
                        url: 'http://test.com',
                        method: 'POST',
                        headers: [],
                        name: '',
                        variables: [],
                        bodyContentType: 'application/json',
                        json: 'bad json',
                        formUrlencoded: null,
                    },
                },
            })
        )

        render(
            <HttpRequestFormInput
                control={result.current.control}
                variables={[]}
            />
        )

        act(() => {
            fireEvent.focus(screen.getAllByRole('textbox')[0])
        })

        act(() => {
            fireEvent.blur(screen.getAllByRole('textbox')[0])
        })

        act(() => {
            fireEvent.focus(screen.getAllByRole('textbox')[1])
        })

        act(() => {
            fireEvent.blur(screen.getAllByRole('textbox')[1])
        })

        await waitFor(() => {
            expect(
                screen.getByText('Only https protocol is allowed')
            ).toBeInTheDocument()
            expect(screen.getByText('Invalid JSON')).toBeInTheDocument()
        })
    })

    it('should handle POST -> GET method change', async () => {
        const {result} = renderHook(() =>
            useForm<CustomActionFormInputValues>({
                mode: 'onBlur',
                defaultValues: {
                    http: {
                        url: 'https://test.com',
                        method: 'POST',
                        headers: [],
                        name: '',
                        variables: [],
                        bodyContentType: 'application/json',
                        json: '{}',
                        formUrlencoded: null,
                    },
                },
            })
        )

        render(
            <HttpRequestFormInput
                control={result.current.control}
                variables={[]}
            />
        )

        act(() => {
            fireEvent.focus(screen.getAllByRole('combobox')[0])
        })

        await waitFor(() => {
            expect(screen.getByText('GET')).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByText('GET'))
        })

        expect(screen.getByText('GET')).toBeInTheDocument()

        act(() => {
            fireEvent.blur(screen.getAllByRole('combobox')[0])
        })

        await waitFor(() => {
            expect(screen.queryByText('Request body')).not.toBeInTheDocument()
        })
    })

    it('should render headers error message', async () => {
        const {result} = renderHook(() =>
            useForm<CustomActionFormInputValues>({
                mode: 'onBlur',
                defaultValues: {
                    http: {
                        url: 'https://test.com',
                        method: 'GET',
                        headers: [{name: '', value: ''}],
                        name: '',
                        variables: [],
                        json: null,
                        formUrlencoded: null,
                        bodyContentType: null,
                    },
                },
            })
        )

        render(
            <HttpRequestFormInput
                control={result.current.control}
                variables={[]}
            />
        )

        act(() => {
            fireEvent.focus(screen.getByPlaceholderText('Key'))
        })

        act(() => {
            fireEvent.blur(screen.getByPlaceholderText('Key'))
        })

        await waitFor(() => {
            expect(screen.getByText('Headers are invalid')).toBeInTheDocument()
        })
    })

    it('should handle body content type change', async () => {
        const {result} = renderHook(() =>
            useForm<CustomActionFormInputValues>({
                mode: 'onBlur',
                defaultValues: {
                    http: {
                        url: 'https://test.com',
                        method: 'POST',
                        headers: [],
                        name: '',
                        variables: [],
                        bodyContentType: 'application/x-www-form-urlencoded',
                        formUrlencoded: [],
                        json: null,
                    },
                },
            })
        )

        render(
            <HttpRequestFormInput
                control={result.current.control}
                variables={[]}
            />
        )

        act(() => {
            fireEvent.focus(screen.getAllByRole('combobox')[1])
        })

        await waitFor(() => {
            expect(screen.getByText('application/json')).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByText('application/json'))
        })

        await waitFor(() => {
            expect(screen.getByText('{}')).toBeInTheDocument()
        })
    })
})
