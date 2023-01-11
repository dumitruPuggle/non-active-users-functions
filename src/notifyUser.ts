type NotificationCallback = {
  success: boolean;
};

export class Notification {
  public uid: string;
  constructor(uid: string) {
    this.uid = uid;
  }

  public async send(
    message: string,
    callback: ({}: NotificationCallback) => void
  ) {
    // For now, just a simple form of abstraction
    console.log(message);
    const sampleResult = {
      success: true,
    };
    callback(sampleResult);
  }
}
