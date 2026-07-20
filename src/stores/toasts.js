import { defineStore } from "pinia";

let nextToastId = 1;

export const useToastStore = defineStore("toasts", {
  state: () => ({
    items: []
  }),
  actions: {
    show(message, options = {}) {
      const id = nextToastId;
      nextToastId += 1;

      const toast = {
        id,
        message,
        tone: options.tone || "success"
      };

      this.items.push(toast);

      window.setTimeout(() => {
        this.dismiss(id);
      }, options.duration || 3200);

      return id;
    },
    dismiss(id) {
      this.items = this.items.filter((toast) => toast.id !== id);
    }
  }
});
