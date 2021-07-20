import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateTransferError {
  export class UserSendNotFound extends AppError {
    constructor() {
      super('User send not found', 404);
    }
  }

  export class UserReceiverNotFound extends AppError {
    constructor() {
      super('User receiver not found', 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }
}
