import { act } from '@testing-library/react-hooks'

import { Value } from 'pages/common/forms/SelectField/types'
import { renderHook } from 'utils/testing/renderHook'

import { useCustomFieldsState } from '../useCustomFieldsState'

describe('useCustomFieldsState Hook', () => {
    it('should initialize with the default state', () => {
        const { result } = renderHook(() => useCustomFieldsState())
        expect(result.current.state).toEqual({
            selectedCustomFields: [],
            isSelectDisabled: false,
            haveRequiredValuesBeenSet: false,
        })
    })

    it('should update selected fields with setSelectedFields', () => {
        const { result } = renderHook(() => useCustomFieldsState())
        const newFields: Value[] = [
            { value: 1, label: 'Field 1' } as unknown as Value,
        ]
        act(() => {
            result.current.setSelectedFields(newFields)
        })
        expect(result.current.state.selectedCustomFields).toEqual(newFields)
    })

    it('should clear selected fields with clearSelectedFields', () => {
        const { result } = renderHook(() => useCustomFieldsState())
        const newFields: Value[] = [
            { value: 1, label: 'Field 1' } as unknown as Value,
        ]
        act(() => {
            result.current.setSelectedFields(newFields)
        })

        expect(result.current.state.selectedCustomFields).toEqual(newFields)

        act(() => {
            result.current.clearSelectedFields()
        })

        expect(result.current.state.selectedCustomFields).toEqual([])
    })

    it('should update isSelectDisabled with setSelectDisabled', () => {
        const { result } = renderHook(() => useCustomFieldsState())
        act(() => {
            result.current.setSelectDisabled(true)
        })
        expect(result.current.state.isSelectDisabled).toEqual(true)

        act(() => {
            result.current.setSelectDisabled(false)
        })
        expect(result.current.state.isSelectDisabled).toEqual(false)
    })

    it('should update haveRequiredValuesBeenSet to true with autoFillRequiredFields', () => {
        const { result } = renderHook(() => useCustomFieldsState())
        act(() => {
            result.current.autoFillRequiredFields([1, 2])
        })
        expect(result.current.state.haveRequiredValuesBeenSet).toEqual(true)
    })

    it('removeField should not change the current state (no-op)', () => {
        const { result } = renderHook(() => useCustomFieldsState())
        const prevState = result.current.state
        act(() => {
            result.current.removeField(1)
        })
        expect(result.current.state).toEqual(prevState)
    })
})
