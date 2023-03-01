
class AnalyzerEvent {
   
    init(){
        this.bind()
    }

    bind(){
        const { defaultClass, activeClass } = VALUES.nav;
        window.addEventListener("load", function () {
            const pathname = window.location.pathname.slice(1);
            const currentPathName = pathname === '' ? CONFIG.routes[0].pathname : pathname
            renderNav(CONFIG.routes);
            const defaultMenu = document.querySelector(`[data-menu=${currentPathName}]`);
            defaultMenu.classList.replace(defaultClass, activeClass);
            document.querySelector('iframe').src = `../src/pages/${currentPathName}/index.html`;
        });

        const navEle = document.querySelector('#nav');
        navEle.addEventListener('click', function (e) {
            const activeEle = e.target;
            if (activeEle.tagName.toLowerCase() === 'li') {
                
                Array.from(navEle.children).forEach(menuEle => {
                    if(menuEle.dataset.menu === activeEle.dataset.menu){
                        menuEle.classList.replace(defaultClass,activeClass);
                        document.querySelector('iframe').src = `../src/pages/${activeEle.dataset.menu}/index.html`;
                    }else{
                        menuEle.classList.replace(activeClass,defaultClass)
                    }
                })
               
            }
        })
    }
}
