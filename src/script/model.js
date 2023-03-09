
class AnalyzerModel {
   
    init = () => {
        this.bind()
    }

    bind = () => {
        window.addEventListener("load", () => {
            this.initRenderPage()
        });

        const navEle = document.querySelector('#nav');
        navEle.addEventListener('click', (e) => this.switchMenuHandler(e,navEle))
    }

    injectGlobalVariables = () => {
        window.dayjs = dayjs
    }

    initRenderPage = () => {
        const { defaultClass, activeClass } = VALUES.nav;
        const pathname = window.location.pathname.slice(1);
        const currentPathName = pathname === '' ? CONFIG.routes[0].pathname : pathname
        renderNav(CONFIG.routes);
        const defaultMenu = document.querySelector(`[data-menu=${currentPathName}]`);
        defaultMenu.classList.replace(defaultClass, activeClass);
        document.querySelector('iframe').src = `../src/pages/${currentPathName}/index.html`;
    }

    switchMenuHandler = (e, navEle) => {
        const activeEle = e.target;
        if (activeEle.tagName.toLowerCase() === 'li' && !activeEle.classList.contains('active-menu')) {
            const { defaultClass, activeClass } = VALUES.nav;
            Array.from(navEle.children).forEach(menuEle => {
                if(menuEle.dataset.menu === activeEle.dataset.menu){
                    menuEle.classList.replace(defaultClass,activeClass);
                    document.querySelector('iframe').src = `../src/pages/${activeEle.dataset.menu}/index.html`;
                }else{
                    menuEle.classList.replace(activeClass,defaultClass)
                }
            })
           
        }
    }
}
