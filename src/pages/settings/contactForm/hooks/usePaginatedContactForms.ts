import {useState, useMemo, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import useAppSelector from 'hooks/useAppSelector'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {ContactForm} from 'models/contactForm/types'
import {getContactForms} from 'state/entities/contactForm/contactForms'
import {useContactFormApi} from 'pages/settings/contactForm/hooks/useContactFormApi'

type ContactFormListHook = {
    contactForms: ContactForm[]
    isLoading: boolean
    hasMore: boolean
    fetchMore: () => Promise<void>
    hasLoadedOnce: boolean
}

type Pagination = {
    page: number
    nbPages: number
}

export const usePaginatedContactForms = (): ContactFormListHook => {
    const dispatch = useDispatch()
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
    const contactForms = Object.values(useAppSelector(getContactForms))
    const {isReady, isLoading, fetchPaginatedContactForms} = useContactFormApi()
    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        nbPages: 1,
    })
    const hasMore = useMemo(
        () => pagination.page < pagination.nbPages,
        [pagination]
    )

    const fetchContactForms = async () => {
        if (!isReady) return

        try {
            // TODO: pagination
            const {meta} = await fetchPaginatedContactForms()
            setPagination({page: meta.page, nbPages: meta.nbPages})
        } catch (error) {
            void dispatch(
                notify({
                    message: 'Failed to retrieve the Contact Forms list',
                    status: NotificationStatus.Error,
                })
            )
        } finally {
            if (!hasLoadedOnce) setHasLoadedOnce(true)
        }
    }

    const fetchMore = async () => {
        if (hasMore && !isLoading) {
            await fetchContactForms()
        }
    }

    useEffect(() => {
        if (isReady) {
            void fetchContactForms()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady])

    return {
        contactForms,
        isLoading,
        hasMore,
        fetchMore,
        hasLoadedOnce,
    }
}
