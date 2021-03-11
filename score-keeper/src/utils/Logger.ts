export const Logger = {
    enabled: true,
    debug(msg: string, value?: Record<string, any>) {
        if (this.enabled) {
            console.debug(msg, value);
        }
    },

    log(msg: string, value?: Record<string, any>) {
        if (this.enabled) {
            console.log(msg, value);
        }
    },
};
