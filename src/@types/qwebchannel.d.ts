/**
 * Type definitions for qwebchannel.js
 */

declare module 'qwebchannel' {
  export class QWebChannel {
    constructor(transport: any, initCallback: (channel: QWebChannel) => void);
    objects: {
      [key: string]: any;
    };
  }

  export default QWebChannel;
}
