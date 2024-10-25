/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class SignUpController {
  handle(httpRequest: any): any {
    return {
      statusCode: 400,
      body: new Error('Missing param: name'),
    };
  }
}
