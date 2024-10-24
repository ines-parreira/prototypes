import {renderHook} from '@testing-library/react-hooks'

import {useListWorkflowEntryPoints} from 'models/workflows/queries'

import {useSelfServicePreviewContext} from '../../SelfServicePreviewContext'
import useWorkflowsEntrypoints from '../useWorkflowsEntrypoints'

// Mock the dependencies
jest.mock('models/workflows/queries', () => ({
    useListWorkflowEntryPoints: jest.fn(),
}))

jest.mock('../../SelfServicePreviewContext', () => ({
    useSelfServicePreviewContext: jest.fn(),
}))

describe('useWorkflowsEntrypoints', () => {
    it('should return an empty array when enabledWorkflowIdsInChannel is undefined, null, or empty', () => {
        // Test case where enabledWorkflowIdsInChannel is undefined
        ;(useSelfServicePreviewContext as jest.Mock).mockReturnValue({
            workflowsEntrypoints: undefined,
        })
        ;(useListWorkflowEntryPoints as jest.Mock).mockReturnValue({
            data: {},
        })

        let result = renderHook(() => useWorkflowsEntrypoints('en')).result
        expect(result.current).toEqual([])
        ;(useSelfServicePreviewContext as jest.Mock).mockReturnValue({
            workflowsEntrypoints: null,
        })

        result = renderHook(() => useWorkflowsEntrypoints('en')).result
        expect(result.current).toEqual([])
        ;(useSelfServicePreviewContext as jest.Mock).mockReturnValue({
            workflowsEntrypoints: [],
        })

        result = renderHook(() => useWorkflowsEntrypoints('en')).result
        expect(result.current).toEqual([])
    })

    it('should return empty array when there are no enabled workflows', () => {
        // Mock the context to return no enabled workflows
        ;(useSelfServicePreviewContext as jest.Mock).mockReturnValue({
            workflowsEntrypoints: [
                {workflow_id: '1', enabled: false},
                {workflow_id: '2', enabled: false},
            ],
        })
        ;(useListWorkflowEntryPoints as jest.Mock).mockReturnValue({
            data: {},
        })

        const {result} = renderHook(() => useWorkflowsEntrypoints('en'))

        expect(result.current).toEqual([])
    })

    it('should return the correct entrypoints with labels', () => {
        ;(useSelfServicePreviewContext as jest.Mock).mockReturnValue({
            workflowsEntrypoints: [
                {workflow_id: '1', enabled: true},
                {workflow_id: '2', enabled: true},
            ],
        })
        ;(useListWorkflowEntryPoints as jest.Mock).mockReturnValue({
            data: {
                '1': 'Workflow 1 Label',
                '2': 'Workflow 2 Label',
            },
        })

        const {result} = renderHook(() => useWorkflowsEntrypoints('en'))

        expect(result.current).toEqual([
            {workflow_id: '1', label: 'Workflow 1 Label'},
            {workflow_id: '2', label: 'Workflow 2 Label'},
        ])
    })

    it('should filter out workflows without labels', () => {
        ;(useSelfServicePreviewContext as jest.Mock).mockReturnValue({
            workflowsEntrypoints: [
                {workflow_id: '1', enabled: true},
                {workflow_id: '2', enabled: true},
            ],
        })
        ;(useListWorkflowEntryPoints as jest.Mock).mockReturnValue({
            data: {
                '1': 'Workflow 1 Label',
                // '2' workflow doesn't have a label
            },
        })

        const {result} = renderHook(() => useWorkflowsEntrypoints('en'))

        expect(result.current).toEqual([
            {workflow_id: '1', label: 'Workflow 1 Label'},
        ])
    })

    it('should return an empty array if no workflows are enabled', () => {
        ;(useSelfServicePreviewContext as jest.Mock).mockReturnValue({
            workflowsEntrypoints: [],
        })
        ;(useListWorkflowEntryPoints as jest.Mock).mockReturnValue({
            data: {},
        })

        const {result} = renderHook(() => useWorkflowsEntrypoints('en'))

        expect(result.current).toEqual([])
    })
})
