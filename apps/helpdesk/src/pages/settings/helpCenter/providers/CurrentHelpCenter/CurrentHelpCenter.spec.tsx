import { render } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { changeHelpCenterId, changeViewLanguage } from 'state/ui/helpCenter'

import { useHelpCenterApi } from '../../hooks/useHelpCenterApi'
import { useHelpCenterIdParam } from '../../hooks/useHelpCenterIdParam'
import CurrentHelpCenter from './CurrentHelpCenter'

jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('../../hooks/useHelpCenterApi')
jest.mock('../../hooks/useHelpCenterIdParam')
jest.mock('@repo/feature-flags', () => ({
    useFlag: jest.fn(() => false),
    FeatureFlagKey: {},
}))
jest.mock(
    '../../components/AIArticlesLibraryView/hooks/useHasAccessToAILibrary',
)

const mockDispatch = jest.fn()
const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseHelpCenterApi = useHelpCenterApi as jest.Mock
const mockUseHelpCenterIdParam = useHelpCenterIdParam as jest.Mock

describe('CurrentHelpCenter', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseHelpCenterApi.mockReturnValue({ client: {} })
    })

    it('should sync Redux state with URL parameter when help center IDs differ', () => {
        mockUseHelpCenterIdParam.mockReturnValue(123)
        mockUseAppSelector
            .mockReturnValueOnce({ id: 456, default_locale: 'en' })
            .mockReturnValueOnce('en')

        render(
            <MemoryRouter initialEntries={['/settings/help-center/123']}>
                <Route path="/settings/help-center/:id">
                    <CurrentHelpCenter />
                </Route>
            </MemoryRouter>,
        )

        expect(mockDispatch).toHaveBeenCalledWith(changeHelpCenterId(123))
    })

    it('should set view language to help center default locale when not set', () => {
        mockUseHelpCenterIdParam.mockReturnValue(123)
        mockUseAppSelector
            .mockReturnValueOnce({ id: 123, default_locale: 'fr-FR' })
            .mockReturnValueOnce(null)

        render(
            <MemoryRouter initialEntries={['/settings/help-center/123']}>
                <Route path="/settings/help-center/:id">
                    <CurrentHelpCenter />
                </Route>
            </MemoryRouter>,
        )

        expect(mockDispatch).toHaveBeenCalledWith(changeViewLanguage('fr-FR'))
    })

    it('should not sync Redux state when help center IDs match', () => {
        mockUseHelpCenterIdParam.mockReturnValue(123)
        mockUseAppSelector
            .mockReturnValueOnce({ id: 123, default_locale: 'en-US' })
            .mockReturnValueOnce('en-US')

        render(
            <MemoryRouter initialEntries={['/settings/help-center/123']}>
                <Route path="/settings/help-center/:id">
                    <CurrentHelpCenter />
                </Route>
            </MemoryRouter>,
        )

        expect(mockDispatch).not.toHaveBeenCalledWith(changeHelpCenterId(123))
    })

    it('should sync Redux state when help center id is undefined', () => {
        mockUseHelpCenterIdParam.mockReturnValue(123)
        mockUseAppSelector
            .mockReturnValueOnce({ default_locale: 'en-US' })
            .mockReturnValueOnce('en-US')

        render(
            <MemoryRouter initialEntries={['/settings/help-center/123']}>
                <Route path="/settings/help-center/:id">
                    <CurrentHelpCenter />
                </Route>
            </MemoryRouter>,
        )

        expect(mockDispatch).toHaveBeenCalledWith(changeHelpCenterId(123))
    })

    it('should not sync Redux state when helpCenterId is null', () => {
        mockUseHelpCenterIdParam.mockReturnValue(null)
        mockUseAppSelector
            .mockReturnValueOnce({ id: 456, default_locale: 'en-US' })
            .mockReturnValueOnce('en-US')

        render(
            <MemoryRouter initialEntries={['/settings/help-center/']}>
                <Route path="/settings/help-center/:id">
                    <CurrentHelpCenter />
                </Route>
            </MemoryRouter>,
        )

        expect(mockDispatch).not.toHaveBeenCalledWith(changeHelpCenterId(null))
    })
})
