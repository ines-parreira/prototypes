import React, {ComponentType, ReactChildren} from 'react'
import {act, renderHook} from '@testing-library/react-hooks'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import {useWorkflowEntrypoint} from '../useWorkflowEntrypoint'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const renderHookOptions = {
    wrapper: (({children}: {children: ReactChildren}) => (
        <Provider store={mockStore({})}>{children}</Provider>
    )) as ComponentType,
}

const mockSelfServiceConfiguration: ReturnType<
    typeof useSelfServiceConfiguration
> = {
    isFetchPending: false,
    isUpdatePending: false,
    storeIntegration: undefined,
    selfServiceConfiguration: undefined,
    handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
} as const

jest.mock('pages/automation/common/hooks/useSelfServiceConfiguration', () => {
    return {
        __esModule: true,
        default: jest.fn().mockReturnValue(mockSelfServiceConfiguration),
    }
})

function updateMock(
    overrides: Partial<ReturnType<typeof useSelfServiceConfiguration>>
) {
    ;(
        useSelfServiceConfiguration as jest.MockedFn<
            typeof useSelfServiceConfiguration
        >
    ).mockReturnValue({
        ...mockSelfServiceConfiguration,
        ...overrides,
    })
}

describe('useWorkflowEntrypoint', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        updateMock({})
    })

    it('reflect changes on entrypoint label and save new entrypoint correctly', async () => {
        const mockHandleSelfServiceConfigurationUpdate = jest.fn()
        updateMock({
            handleSelfServiceConfigurationUpdate:
                mockHandleSelfServiceConfigurationUpdate,
            selfServiceConfiguration: {} as SelfServiceConfiguration,
        })
        const {result, rerender} = renderHook(
            () => useWorkflowEntrypoint('', '', 'a'),
            renderHookOptions
        )
        expect(result.current.label).toBe('')
        expect(result.current.isDirty).toBe(false)

        act(() => result.current.setLabel('new'))
        expect(result.current.label).toBe('new')
        expect(result.current.isDirty).toBe(true)

        // now save
        await act(async () => await result.current.handleSave())
        const expectedConfig = {
            workflows_entrypoints: [
                {enabled: false, label: 'new', workflow_id: 'a'},
            ],
        }
        expect(mockHandleSelfServiceConfigurationUpdate).toHaveBeenCalledWith(
            expectedConfig
        )
        updateMock({
            selfServiceConfiguration:
                expectedConfig as SelfServiceConfiguration,
        })
        rerender()
        expect(result.current.isDirty).toBe(false)
        expect(result.current.label).toBe('new')
    })

    it('reflect changes on entrypoint label and append entrypoint correctly', async () => {
        const mockHandleSelfServiceConfigurationUpdate = jest.fn()
        updateMock({
            handleSelfServiceConfigurationUpdate:
                mockHandleSelfServiceConfigurationUpdate,
            selfServiceConfiguration: {
                workflows_entrypoints: [
                    {
                        enabled: false,
                        label: 'existing',
                        workflow_id: 'existingId',
                    },
                ],
            } as SelfServiceConfiguration,
        })
        const {result, rerender} = renderHook(
            () => useWorkflowEntrypoint('', '', 'a'),
            renderHookOptions
        )
        expect(result.current.label).toBe('')
        expect(result.current.isDirty).toBe(false)

        act(() => result.current.setLabel('new'))
        expect(result.current.label).toBe('new')
        expect(result.current.isDirty).toBe(true)

        // now save
        await act(async () => await result.current.handleSave())
        const expectedConfig = {
            workflows_entrypoints: [
                {enabled: false, label: 'existing', workflow_id: 'existingId'},
                {enabled: false, label: 'new', workflow_id: 'a'},
            ],
        }
        expect(mockHandleSelfServiceConfigurationUpdate).toHaveBeenCalledWith(
            expectedConfig
        )
        updateMock({
            selfServiceConfiguration:
                expectedConfig as SelfServiceConfiguration,
        })
        rerender()
        expect(result.current.isDirty).toBe(false)
        expect(result.current.label).toBe('new')
    })
})
