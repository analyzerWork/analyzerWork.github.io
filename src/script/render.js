const navRootId = 'nav';
const navTemplateId = 'navTemplate';

const renderTemplate = function(rootId,templateId, data){

    const templateData = document.querySelector(`#${templateId}`).render(data);

    document.querySelector(`#${rootId}`).innerHTML = templateData.innerHTML;
}


const renderNav = (routes,currentPathName) => {
    const pathList = routes.map(({pathname}) => pathname);
    const currentRoutes = routes.map(({pathname, name}, index) => ({
        name,
        pathname,
        isActive: (currentPathName === '' && index === 0) || pathname === currentPathName
    }));
    mutableSetState(CONFIG, 'routes', currentRoutes);
    renderTemplate(navRootId, navTemplateId, currentRoutes);
}
