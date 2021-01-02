// import { ResponseCode } from './response-code.enum';
export enum ResponseCode {
    Success = "Success",
    Error = "Error"
  }
  export class Response {
    code: any;
    message: string;
  }