class AnalyzerModel {
  element = {
    $user: document.querySelector("#user"),
    $waterMarkContainer: document.querySelector("#waterMarkContainer"),
    $appHeader: document.querySelector("#appHeader"),
    $toolboxDropdown: document.querySelector("#toolboxDropdown"),
    $toolboxMenu: document.querySelector("#toolboxMenu"),
    $navEle: document.querySelector("#nav"),
    $anna: document.querySelector("#anna"),
  };

  init = () => {
    this.setup();
    this.bind();
  };

  setup = () => {
    const cookieInstance = new Cookie();
    const user = cookieInstance.getCookie("name");

    this.element.$user.innerHTML = user;
    // check if the app embedded in iframe
    if (self !== top) {
      this.element.$appHeader.style.display = "none";
    }
  };

  bind = () => {
    window.addEventListener("load", () => {
      this.initRenderPage();
      this.makeWaterMark();
      this.renderComponent();
    });

    this.element.$navEle.addEventListener("click", this.switchMenuHandler);
    this.element.$anna.addEventListener("click", this.locationToAnna);

    document.addEventListener("visibilitychange", this.visibilityChangeHandler);
  };

  renderComponent = () => {
    const modelInstance = this;
    const { activeClass, defaultClass } = VALUES.nav;
    this.element.$toolboxDropdown.list(
      [
        {
          id: "product-search",
          value: "产品查询",
        },
        {
          id: "ai-assistant",
          value: "AI 助理",
          externalLink: "https://www.analyzer.plus",
        },
      ],
      {
        onSelect: function (obj) {
          modelInstance.element.$toolboxMenu.classList.add("active-menu");
          Array.from(modelInstance.element.$navEle.children).forEach(
            (menuEle) => {
              if (menuEle.classList.contains(activeClass)) {
                menuEle.classList.remove(activeClass);
                menuEle.classList.add(defaultClass);
              }
            }
          );
          if(obj.externalLink){
            window.open(obj.externalLink);
          }else {
            document.querySelector(
              "iframe"
            ).src = `../src/pages/toolbox/${obj.id}/index.html`;
          }
        },
      }
    );
  };

  injectGlobalVariables = () => {
    window.dayjs = dayjs;
  };

  initRenderPage = () => {
    const { defaultClass, activeClass } = VALUES.nav;
    const pathname = window.location.pathname.slice(1);
    const validPathnames = CONFIG.routes.map(({ pathname }) => pathname);
    const currentPathName = validPathnames.includes(pathname)
      ? pathname
      : CONFIG.routes[0].pathname;
    renderNav(CONFIG.routes);
    const defaultMenu = document.querySelector(
      `[data-menu=${currentPathName}]`
    );
    defaultMenu.classList.replace(defaultClass, activeClass);
    document.querySelector(
      "iframe"
    ).src = `../src/pages/${currentPathName}/index.html`;
  };

  makeWaterMark = () => {
    const cookieInstance = new Cookie();
    const user = cookieInstance.getCookie("name");

    const waterMarkInstance = new WaterMark({ text: user });
    const { backgroundDataURL, dataList } = waterMarkInstance;
    const waterMarkFragment = document.createDocumentFragment();
    dataList.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "watermark";
      div.style.backgroundImage = "url(" + backgroundDataURL + ")";
      div.style.backgroundPosition = `0px ${item * index}px`;
      waterMarkFragment.appendChild(div);
    });
    this.element.$waterMarkContainer.appendChild(waterMarkFragment);
  };
  switchMenuHandler = (e) => {
    const activeEle = e.target;
    if (
      activeEle.tagName.toLowerCase() === "li" &&
      !activeEle.classList.contains("active-menu")
    ) {
      const { defaultClass, activeClass } = VALUES.nav;

      Array.from(this.element.$navEle.children).forEach((menuEle) => {
        if (menuEle.dataset.menu === activeEle.dataset.menu) {
          menuEle.classList.replace(defaultClass, activeClass);
          document.querySelector(
            "iframe"
          ).src = `../src/pages/${activeEle.dataset.menu}/index.html`;
        } else {
          menuEle.classList.replace(activeClass, defaultClass);
        }
      });
      // 工具箱取消
      if (this.element.$toolboxMenu.classList.contains("active-menu")) {
        this.element.$toolboxMenu.classList.remove("active-menu");
      }
    }
  };

  locationToAnna = () => {
    window.open("https://www.analyzer.plus");
  }

  visibilityChangeHandler = () => {
    if (document.visibilityState === "visible") {
      const cookieInstance = new Cookie();
      cookieInstance.authCheck();
    }
  };
}

function getWordsLength(str) {
  let { length } = str;

  for (let i = 0; i < length; i++) {
    if (str.charCodeAt(i) > 255) {
      length++;
    }
  }
  return length;
}

class WaterMark {
  options = {};
  dataList = [];
  backgroundDataURL = "";
  constructor({
    text,
    deg,
    rotate = -35,
    level = 3,
    fontSize = 20,
    opacity = 0.15,
  }) {
    this.options = {
      ...this.options,
      text,
      deg: deg || (Math.PI / 180) * rotate,
      rotate,
      level,
      fontSize,
      opacity,
    };

    this.prepareConfig();
  }

  prepareConfig = () => {
    const { text, deg, level, fontSize, opacity } = this.options;

    const docWidth = Math.abs(
      document.documentElement.clientWidth / Math.sin(deg)
    );
    const docHeight = document.documentElement.clientHeight;
    const canvas = document.createElement("canvas");
    canvas.width = docWidth;
    canvas.height = docHeight;

    const positionY = docHeight / (level * 2);

    this.dataList = [...new Array(level * 2)].map(() => positionY);

    const ctx = canvas.getContext("2d");
    ctx.font = `400 ${fontSize}px Arial`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(200, 200, 200, ${opacity})`;
    ctx.rotate(deg);

    const padding = fontSize * 3;
    const textWidth = `${(fontSize * getWordsLength(text)) / 2 + padding}`;
    const num = Math.ceil(docWidth / +textWidth);
    for (let i = 0; i < num; i++) {
      ctx.fillText(
        text,
        i * +textWidth + docHeight * Math.sin(deg) - (i * 100) / level,
        docHeight * Math.cos(deg) + (i * 100) / level
      );
    }

    const base64URL = canvas.toDataURL();

    this.backgroundDataURL = base64URL;
  };
}
