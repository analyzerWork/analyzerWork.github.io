const navRootId = 'nav';
const navTemplateId = 'navTemplate';

const renderTemplate = function(rootId,templateId, data){
    const templateData = document.querySelector(`#${templateId}`).render(data);

    document.querySelector(`#${rootId}`).innerHTML = templateData.innerHTML;
}


const renderNav = (routes) => {
  renderTemplate(navRootId, navTemplateId, routes);
}
