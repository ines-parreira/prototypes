import { Link, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { Banner, Button } from '@gorgias/axiom'
import {
    BusinessHoursDetails,
    useGetBusinessHoursDetails,
} from '@gorgias/helpdesk-queries'

import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'

import SettingsContent from '../SettingsContent'
import SettingsPageContainer from '../SettingsPageContainer'
import { BUSINESS_HOURS_BASE_URL } from './constants'
import CustomBusinessHoursProvider from './CustomBusinessHoursProvider'
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
        <Wrapper businessHours={businessHours}>
            <CustomBusinessHoursProvider businessHoursId={businessHours.id}>
                <EditCustomBusinessHoursForm businessHours={businessHours} />
            </CustomBusinessHoursProvider>
        </Wrapper>
    )
}

const Wrapper = ({
    children,
    businessHours,
}: {
    children: React.ReactNode
    businessHours?: BusinessHoursDetails
}) => {
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
                            {`Edit ${businessHours?.name || 'custom business hours'}`}
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
