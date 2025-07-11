import { Link, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { useGetBusinessHoursDetails } from '@gorgias/helpdesk-queries'
import { Banner, Button } from '@gorgias/merchant-ui-kit'

import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'

import SettingsContent from '../SettingsContent'
import SettingsPageContainer from '../SettingsPageContainer'
import { BUSINESS_HOURS_BASE_URL } from './constants'
import EditCustomBusinessHoursForm from './EditCustomBusinessHoursForm'

export default function EditCustomBusinessHoursPage() {
    const { id: idParam } = useParams<{ id: string }>()

    const {
        data: businessHours,
        isFetching,
        isError,
        refetch,
    } = useGetBusinessHoursDetails(Number(idParam), {
        query: {
            refetchOnWindowFocus: false,
            select: (data) => data.data,
        },
    })

    if (isError) {
        return (
            <Wrapper>
                <Banner
                    type="error"
                    action={
                        <Button onClick={() => refetch()} fillStyle="ghost">
                            Refresh
                        </Button>
                    }
                >
                    Something went wrong while fetching the data. Please try
                    again.
                </Banner>
            </Wrapper>
        )
    }

    if (isFetching || !businessHours) {
        return (
            <Wrapper>
                <Loader />
            </Wrapper>
        )
    }

    return (
        <Wrapper>
            <EditCustomBusinessHoursForm businessHours={businessHours} />
        </Wrapper>
    )
}

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to={BUSINESS_HOURS_BASE_URL}>
                                Business hours
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Edit custom business hours
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <SettingsPageContainer>
                <SettingsContent>{children}</SettingsContent>
            </SettingsPageContainer>
        </div>
    )
}
