import { renderHook } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import type { FormValues } from 'pages/aiAgent/types'

import { useGetHelpCenterList } from '../../../../models/helpCenter/queries'
import { EMPTY_HELP_CENTER_ID } from '../../../automate/common/components/HelpCenterSelect'
import { INITIAL_FORM_VALUES } from '../../constants'
import { useConfigurationForm } from '../../hooks/useConfigurationForm'
import { getFormValuesFromStoreConfiguration } from '../../hooks/utils/configurationForm.utils'
import { useAiAgentStoreConfigurationContext } from '../../providers/AiAgentStoreConfigurationContext'
import { useFaqHelpCenter } from './useFaqHelpCenter'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))

jest.mock('../../../../models/helpCenter/queries', () => ({
    useGetHelpCenterList: jest.fn(),
}))

jest.mock('../../hooks/useConfigurationForm', () => ({
    useConfigurationForm: jest.fn(),
}))

jest.mock('../../hooks/utils/configurationForm.utils', () => ({
    getFormValuesFromStoreConfiguration: jest.fn(),
}))

jest.mock('../../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockUseGetHelpCenterList = useGetHelpCenterList as jest.MockedFunction<
    typeof useGetHelpCenterList
>
const mockUseConfigurationForm = useConfigurationForm as jest.MockedFunction<
    typeof useConfigurationForm
>
const mockGetFormValuesFromStoreConfiguration =
    getFormValuesFromStoreConfiguration as jest.MockedFunction<
        typeof getFormValuesFromStoreConfiguration
    >
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.MockedFunction<
        typeof useAiAgentStoreConfigurationContext
    >

describe('useFaqHelpCenter', () => {
    const mockHelpCenters = [
        { id: 1, name: 'Help Center 1' },
        { id: 2, name: 'Help Center 2' },
    ]

    const mockConfigurationFormReturn = {
        handleOnSave: jest.fn(),
        formValues: { helpCenterId: 1 },
        updateValue: jest.fn(),
        isPendingCreateOrUpdate: false,
    }

    const mockStoreConfiguration = {
        id: 1,
        snippetHelpCenterId: 1,
        helpCenterId: 1,
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseParams.mockReturnValue({
            shopName: 'test-shop',
            shopType: 'shopify',
        })

        mockUseGetHelpCenterList.mockReturnValue({
            data: {
                data: { data: mockHelpCenters },
            },
        } as any)

        mockUseConfigurationForm.mockReturnValue(
            mockConfigurationFormReturn as any,
        )

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: mockStoreConfiguration,
        } as any)

        mockGetFormValuesFromStoreConfiguration.mockReturnValue({
            ...INITIAL_FORM_VALUES,
            helpCenterId: 1,
        } as unknown as FormValues)
    })

    describe('basic functionality', () => {
        it('returns faqHelpCenters from API query', () => {
            const { result } = renderHook(() => useFaqHelpCenter())

            expect(result.current.faqHelpCenters).toEqual(mockHelpCenters)
        })

        it('returns empty array when no help centers exist', () => {
            mockUseGetHelpCenterList.mockReturnValue({
                data: undefined,
            } as any)

            const { result } = renderHook(() => useFaqHelpCenter())

            expect(result.current.faqHelpCenters).toEqual([])
        })

        it('returns shopName from useParams', () => {
            const { result } = renderHook(() => useFaqHelpCenter())

            expect(result.current.shopName).toBe('test-shop')
        })

        it('returns isPendingCreateOrUpdate from useConfigurationForm', () => {
            const { result } = renderHook(() => useFaqHelpCenter())

            expect(result.current.isPendingCreateOrUpdate).toBe(false)
        })

        it('returns handleOnSave from useConfigurationForm', () => {
            const { result } = renderHook(() => useFaqHelpCenter())

            expect(result.current.handleOnSave).toBe(
                mockConfigurationFormReturn.handleOnSave,
            )
        })
    })

    describe('defaultFormValues computation', () => {
        it('returns form values from store configuration when available', () => {
            renderHook(() => useFaqHelpCenter())

            expect(
                mockGetFormValuesFromStoreConfiguration,
            ).toHaveBeenCalledWith(mockStoreConfiguration)
            expect(mockUseConfigurationForm).toHaveBeenCalledWith(
                expect.objectContaining({
                    initValues: {
                        ...INITIAL_FORM_VALUES,
                        helpCenterId: 1,
                    },
                }),
            )
        })

        it('returns INITIAL_FORM_VALUES when store configuration is loading', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                isLoading: true,
                storeConfiguration: null,
            } as any)

            renderHook(() => useFaqHelpCenter())

            expect(mockUseConfigurationForm).toHaveBeenCalledWith(
                expect.objectContaining({
                    initValues: INITIAL_FORM_VALUES,
                }),
            )
        })

        it('uses first help center when no store configuration exists', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                isLoading: false,
                storeConfiguration: null,
            } as any)

            renderHook(() => useFaqHelpCenter())

            expect(mockUseConfigurationForm).toHaveBeenCalledWith(
                expect.objectContaining({
                    initValues: {
                        ...INITIAL_FORM_VALUES,
                        helpCenterId: 1,
                    },
                }),
            )
        })

        it('sets helpCenterId to null when no help centers and no store configuration exist', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                isLoading: false,
                storeConfiguration: null,
            } as any)

            mockUseGetHelpCenterList.mockReturnValue({
                data: {
                    data: { data: [] },
                },
            } as any)

            renderHook(() => useFaqHelpCenter())

            expect(mockUseConfigurationForm).toHaveBeenCalledWith(
                expect.objectContaining({
                    initValues: {
                        ...INITIAL_FORM_VALUES,
                        helpCenterId: null,
                    },
                }),
            )
        })

        it('passes shopName to useConfigurationForm', () => {
            renderHook(() => useFaqHelpCenter())

            expect(mockUseConfigurationForm).toHaveBeenCalledWith(
                expect.objectContaining({
                    shopName: 'test-shop',
                }),
            )
        })

        it('passes shopType to useConfigurationForm', () => {
            renderHook(() => useFaqHelpCenter())

            expect(mockUseConfigurationForm).toHaveBeenCalledWith(
                expect.objectContaining({
                    shopType: 'shopify',
                }),
            )
        })
    })

    describe('selectedHelpCenter', () => {
        it('returns the help center matching formValues.helpCenterId', () => {
            mockUseConfigurationForm.mockReturnValue({
                ...mockConfigurationFormReturn,
                formValues: { helpCenterId: 2 },
            } as any)

            const { result } = renderHook(() => useFaqHelpCenter())

            expect(result.current.selectedHelpCenter).toEqual({
                id: 2,
                name: 'Help Center 2',
            })
        })

        it('returns EMPTY_FAQ_HELP_CENTER when helpCenterId is null', () => {
            mockUseConfigurationForm.mockReturnValue({
                ...mockConfigurationFormReturn,
                formValues: { helpCenterId: null },
            } as any)

            const { result } = renderHook(() => useFaqHelpCenter())

            expect(result.current.selectedHelpCenter).toEqual({
                id: EMPTY_HELP_CENTER_ID,
                name: 'No help center',
            })
        })

        it('returns EMPTY_FAQ_HELP_CENTER when helpCenterId does not match any help center', () => {
            mockUseConfigurationForm.mockReturnValue({
                ...mockConfigurationFormReturn,
                formValues: { helpCenterId: 999 },
            } as any)

            const { result } = renderHook(() => useFaqHelpCenter())

            expect(result.current.selectedHelpCenter).toEqual({
                id: EMPTY_HELP_CENTER_ID,
                name: 'No help center',
            })
        })

        it('returns EMPTY_FAQ_HELP_CENTER when helpCenterId is undefined', () => {
            mockUseConfigurationForm.mockReturnValue({
                ...mockConfigurationFormReturn,
                formValues: {},
            } as any)

            const { result } = renderHook(() => useFaqHelpCenter())

            expect(result.current.selectedHelpCenter).toEqual({
                id: EMPTY_HELP_CENTER_ID,
                name: 'No help center',
            })
        })
    })

    describe('setHelpCenterId', () => {
        it('calls updateValue with helpCenterId and value', () => {
            const { result } = renderHook(() => useFaqHelpCenter())

            result.current.setHelpCenterId(2)

            expect(
                mockConfigurationFormReturn.updateValue,
            ).toHaveBeenCalledWith('helpCenterId', 2)
        })

        it('calls updateValue with null when EMPTY_HELP_CENTER_ID is provided', () => {
            const { result } = renderHook(() => useFaqHelpCenter())

            result.current.setHelpCenterId(EMPTY_HELP_CENTER_ID)

            expect(
                mockConfigurationFormReturn.updateValue,
            ).toHaveBeenCalledWith('helpCenterId', null)
        })

        it('handles setting help center to 0', () => {
            const { result } = renderHook(() => useFaqHelpCenter())

            result.current.setHelpCenterId(0)

            expect(
                mockConfigurationFormReturn.updateValue,
            ).toHaveBeenCalledWith('helpCenterId', 0)
        })
    })

    describe('helpCenterItems', () => {
        it('includes empty option at the beginning', () => {
            const { result } = renderHook(() => useFaqHelpCenter())

            expect(result.current.helpCenterItems[0]).toEqual({
                id: EMPTY_HELP_CENTER_ID,
                name: 'No help center',
            })
        })

        it('includes all FAQ help centers after empty option', () => {
            const { result } = renderHook(() => useFaqHelpCenter())

            expect(result.current.helpCenterItems).toEqual([
                { id: EMPTY_HELP_CENTER_ID, name: 'No help center' },
                { id: 1, name: 'Help Center 1' },
                { id: 2, name: 'Help Center 2' },
            ])
        })

        it('only contains empty option when no help centers exist', () => {
            mockUseGetHelpCenterList.mockReturnValue({
                data: {
                    data: { data: [] },
                },
            } as any)

            const { result } = renderHook(() => useFaqHelpCenter())

            expect(result.current.helpCenterItems).toEqual([
                { id: EMPTY_HELP_CENTER_ID, name: 'No help center' },
            ])
        })
    })

    describe('API query configuration', () => {
        it('requests FAQ help centers with correct parameters', () => {
            renderHook(() => useFaqHelpCenter())

            expect(mockUseGetHelpCenterList).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'faq',
                }),
                expect.any(Object),
            )
        })

        it('configures query with staleTime and refetchOnWindowFocus', () => {
            renderHook(() => useFaqHelpCenter())

            expect(mockUseGetHelpCenterList).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    staleTime: 1000 * 60 * 5,
                    refetchOnWindowFocus: false,
                }),
            )
        })
    })
})
