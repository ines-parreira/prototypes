import { FormEvent } from 'react'

import { act } from '@testing-library/react'

import { TicketStatus } from 'business/types/ticket'
import { renderHook } from 'utils/testing/renderHook'

import useForm from '../useForm'

describe('useForm', () => {
    let checkValidity: jest.Mock
    let form: HTMLFormElement
    let event: FormEvent<HTMLFormElement>
    let submit: jest.Mock

    beforeEach(() => {
        jest.resetAllMocks()

        checkValidity = jest.fn(() => false)
        form = { checkValidity } as unknown as HTMLFormElement
        event = {
            preventDefault: jest.fn(),
            target: form,
        } as unknown as FormEvent<HTMLFormElement>
        submit = jest.fn()
    })

    it('should return default state on initial render', () => {
        const { result } = renderHook(() => useForm(submit))

        expect(result.current).toEqual({
            formRef: expect.objectContaining({ current: null }),
            onSubmit: expect.any(Function),
            setTicketStatus: expect.any(Function),
        })
    })

    it('should prevent the default form submit event', () => {
        const { result } = renderHook(() => useForm(submit))

        result.current.formRef.current = form
        result.current.onSubmit(event)

        expect(event.preventDefault).toHaveBeenCalledWith()
    })

    it('should not call submit if the target of the submit event is not the correct form', () => {
        const { result } = renderHook(() => useForm(submit))

        result.current.formRef.current = form
        result.current.onSubmit({
            preventDefault: jest.fn(),
        } as unknown as FormEvent<HTMLFormElement>)

        expect(submit).not.toHaveBeenCalled()
    })

    it('should not call submit if the form is not valid', () => {
        const { result } = renderHook(() => useForm(submit))

        result.current.formRef.current = form
        result.current.onSubmit(event)

        expect(submit).not.toHaveBeenCalled()
    })

    it('should call submit with the default ticket status', () => {
        const { result } = renderHook(() => useForm(submit))

        checkValidity.mockReturnValue(true)
        result.current.formRef.current = form
        act(() => {
            result.current.onSubmit(event)
        })

        expect(submit).toHaveBeenCalledWith({ status: TicketStatus.Open })
    })

    it('should call submit with a changed ticket status', () => {
        const { result } = renderHook(() => useForm(submit))

        act(() => {
            result.current.setTicketStatus(TicketStatus.Closed)
        })

        checkValidity.mockReturnValue(true)
        result.current.formRef.current = form
        act(() => {
            result.current.onSubmit(event)
        })

        expect(submit).toHaveBeenCalledWith({ status: TicketStatus.Closed })
    })

    it('should reset the ticket status', () => {
        const { result } = renderHook(() => useForm(submit))

        act(() => {
            result.current.setTicketStatus(TicketStatus.Closed)
        })

        checkValidity.mockReturnValue(true)
        result.current.formRef.current = form
        act(() => {
            result.current.onSubmit(event)
        })
        expect(submit).toHaveBeenCalledWith({ status: TicketStatus.Closed })

        act(() => {
            result.current.onSubmit(event)
        })
        expect(submit).toHaveBeenCalledWith({ status: TicketStatus.Open })
    })
})
