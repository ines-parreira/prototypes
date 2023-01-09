import {renderHook} from 'react-hooks-testing-library'
import React, {ReactNode} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {RootState, StoreDispatch} from 'state/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {handleArchivingCustomField} from 'pages/settings/ticketFields/utils/handleArchivingCustomField'
import {
    archiveCustomField,
    unArchiveCustomField,
} from 'models/customField/resources'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const store = mockStore({})

jest.mock('models/customField/resources')

describe('handleArchivingCustomField()', () => {
    it('should fail archiving a custom field', async () => {
        ;(archiveCustomField as jest.Mock).mockImplementation(() =>
            Promise.reject()
        )

        const {
            result: {current: dispatch},
        } = renderHook(useAppDispatch, {
            wrapper: ({children}: {children?: ReactNode}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        await handleArchivingCustomField(1, true, dispatch)

        expect(archiveCustomField).toHaveBeenCalled()

        const action = store.getActions().pop()
        // delete the dynamic id of the notification
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete action.payload.id
        expect(action).toMatchSnapshot()
    })

    it('should archive a custom field successfully', async () => {
        ;(archiveCustomField as jest.Mock).mockImplementation(() =>
            Promise.resolve()
        )

        const {
            result: {current: dispatch},
        } = renderHook(useAppDispatch, {
            wrapper: ({children}: {children?: ReactNode}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        await handleArchivingCustomField(1, true, dispatch)

        expect(archiveCustomField).toHaveBeenCalled()

        const action = store.getActions().pop()
        // delete the dynamic id of the notification
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete action.payload.id
        expect(action).toMatchSnapshot()
    })

    it('should fail restoring a custom field', async () => {
        ;(unArchiveCustomField as jest.Mock).mockImplementation(() =>
            Promise.reject()
        )

        const {
            result: {current: dispatch},
        } = renderHook(useAppDispatch, {
            wrapper: ({children}: {children?: ReactNode}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        await handleArchivingCustomField(1, false, dispatch)

        expect(unArchiveCustomField).toHaveBeenCalled()

        const action = store.getActions().pop()
        // delete the dynamic id of the notification
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete action.payload.id
        expect(action).toMatchSnapshot()
    })

    it('should restore a custom field successfully', async () => {
        ;(unArchiveCustomField as jest.Mock).mockImplementation(() =>
            Promise.resolve()
        )

        const {
            result: {current: dispatch},
        } = renderHook(useAppDispatch, {
            wrapper: ({children}: {children?: ReactNode}) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

        await handleArchivingCustomField(1, false, dispatch)

        expect(unArchiveCustomField).toHaveBeenCalled()

        const action = store.getActions().pop()
        // delete the dynamic id of the notification
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete action.payload.id
        expect(action).toMatchSnapshot()
    })
})
