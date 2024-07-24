import {useCallback, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {
    PagesWithTopQuestions,
    useLocalStorageTopQuestions,
} from '../../hooks/useLocalStorageTopQuestions'

export const useViewedOnPage = (
    storeIntegrationId: number,
    helpCenterId: number,
    batchDatetime: Date,
    page: PagesWithTopQuestions
) => {
    const history = useHistory()

    const {viewedOnPages, addViewedOnPage} = useLocalStorageTopQuestions(
        storeIntegrationId,
        helpCenterId,
        batchDatetime
    )

    const onLeavePage = useCallback(() => {
        addViewedOnPage(page)
    }, [addViewedOnPage, page])

    useEffect(() => {
        const unlisten = history.listen(onLeavePage)
        window.addEventListener('beforeunload', onLeavePage)

        return () => {
            unlisten()
            window.removeEventListener('beforeunload', onLeavePage)
        }
    }, [history, onLeavePage])

    useEffect(() => history.listen(onLeavePage), [history, onLeavePage])

    return viewedOnPages.has(page)
}
