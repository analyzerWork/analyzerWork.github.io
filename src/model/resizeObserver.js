class CustomResizeObserver {
  canResize = true;
  instance = null;
  callbacks = [];
  constructor() {
    this.initObserver();
  }

  initObserver() {
    console.log("init CustomResizeObserver");
    this.instance = new ResizeObserver(() => {
      if (!this.canResize) {
        return;
      }
      this.canResize = false;
      this.trigger();
    });
  }

  observe(element, callback) {
    this.callbacks.push(callback);
    this.instance.observe(element);
  }

  unobserve() {
    this.instance.disconnect();
  }

  trigger() {
    window.setTimeout(() => {
      console.log("CustomResizeObserver trigger");

      this.callbacks.forEach((callback) => {
        callback();
      });
      this.canResize = true;
    }, 300);
  }
}
