export interface topcard {
    bgcolor: string,
    icon: string,
    title: string,
    subtitle: string,
    href: string
}

export const topcards: topcard[] = [
    {
        bgcolor: 'success',
        icon: 'bi bi-people',
        title: '4',
        subtitle: 'Docentes',
        href: '/component/operators'
    },
    {
        bgcolor: 'primary',
        icon: 'bi bi-person',
        title: '83 %',
        subtitle: 'Rendimiento docentes',
        href: '/component/users'
    },
    {
        bgcolor: 'warning',
        icon: 'bi bi-thermometer-half',
        title: '2',
        subtitle: 'Inasistencias',
        href: '/component/incubators'
    },
    {
        bgcolor: 'info',
        icon: 'bi bi-bell-fill',
        title: '104',
        subtitle: 'Alertas emitidas',
        href: '/component/monitoring'
    }
] 