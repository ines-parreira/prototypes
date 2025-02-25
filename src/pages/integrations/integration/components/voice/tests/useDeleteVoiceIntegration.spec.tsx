import { renderHook } from '@testing-library/react-hooks'

import { IntegrationType } from '@gorgias/api-queries'

import { integrationsState } from 'fixtures/integrations'
import useAppDispatch from 'hooks/useAppDispatch'
import { PhoneIntegration } from 'models/integration/types'
import { deleteIntegration } from 'state/integrations/actions'
import { assumeMock } from 'utils/testing'

import { useDeleteVoiceIntegration } from '../useDeleteVoiceIntegration'

jest.mock('hooks/useAppDispatch')
const dispatchMock = jest.fn()
assumeMock(useAppDispatch).mockReturnValue(dispatchMock)

jest.mock('state/integrations/actions')
const deleteIntegrationMock = assumeMock(deleteIntegration)

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone,
) as unknown as PhoneIntegration

describe('useDeleteVoiceIntegration', () => {
    const render = () =>
        renderHook(() => useDeleteVoiceIntegration(phoneIntegration))

    it('should dispatch delete integration when calling handleDelete', async () => {
        deleteIntegrationMock.mockReturnValue({
            type: 'delete-integration',
        } as any)
        const { result, waitFor } = render()

        await result.current.handleDelete()

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledWith({
                type: 'delete-integration',
            })
        })
    })
})
