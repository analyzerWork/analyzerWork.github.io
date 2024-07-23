const {
  ANAlYZER_UTILS,
  apiConfig,
  analyzer_env: { MODE },
} = window.parent;

class Assistant {
  computedData = {
    prompt: '',
    content: '',
  };

  element = {
    $messageSendInput: document.querySelector("#messageSendInput"),
    $messageSendButton: document.querySelector("#messageSendButton"),
    $messageContent: document.querySelector('#messageContent'),
  };
  constructor(initData) {
    this.init(initData);
    this.bind();
  }

  init = (initData) => {
   
  };


  get = (...keys) =>
    keys.reduce(
      (prev, key) => ({
        ...prev,
        [key]: this.computedData[key],
      }),
      {}
    );

  set = (data) => {
    this.computedData = {
      ...this.computedData,
      ...data,
    };
  };

  bind = () => {
    this.element.$messageSendInput.addEventListener(
      "change",
      this.inputChangeHandler
    );

    this.element.$messageSendInput.addEventListener(
      "keyup",
      this.onSearchHandler
    );

    this.element.$messageSendButton.addEventListener(
      "click",
      this.onSearchHandler
    );

  };

  inputChangeHandler = (e) => {
    this.set({
      prompt: e.target.value.trim(),
    });
  };

  onSearchHandler = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      this.sendMessage();
    }
  };

  sendMessage() {
    const { prompt, content } = this.get();
    ANAlYZER_UTILS.requestData(apiConfig["llm_test"], {
      prompt: "test",
    }).then((result) => {
      this.set({
        content: content += result
      })
      // TODO: https://www.npmjs.com/package/dompurify
      this.$messageContent.innerHTML = content += result
    })
  }
}

const toolboxInstance = new Assistant();
