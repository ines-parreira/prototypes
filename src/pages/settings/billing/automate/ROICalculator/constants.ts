export const SALARY_TYPES: Record<string, {label: string; value: string}> = {
    annual_salary: {
        label: 'Annual Salary',
        value: 'annual_salary',
    },
    hourly_rate: {
        label: 'Hourly Rate',
        value: 'hourly_rate',
    },
}

export const SUPPORT_METRICS_TYPES: Record<
    string,
    {label: string; value: string}
> = {
    monthly_support_tickets: {
        label: 'Monthly Support Tickets',
        value: 'monthly_support_tickets',
    },
    full_time_support_agents: {
        label: 'Full-time Support Agents',
        value: 'full_time_support_agents',
    },
}
