import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { CreateTransferError } from "./CreateTransferError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";


@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) { }

  async execute({ user_id, type, amount, description, sender_id }: ICreateTransferDTO) {
    const user_send = await this.usersRepository.findById(user_id);
    if (!user_send) {
      throw new CreateTransferError.UserSendNotFound();
    }

    const user_receiver = await this.usersRepository.findById(sender_id);
    if (!user_receiver) {
      throw new CreateTransferError.UserReceiverNotFound();
    }

    // if (type === 'withdraw') {
    const { balance } = await this.statementsRepository.getUserBalance({ user_id });

    console.log(">>>", balance);
    if (balance < amount) {
      throw new CreateStatementError.InsufficientFunds();
    }
    // }

    const statementOperationUserReceiver = await this.statementsRepository.create({
      user_id,
      sender_id,
      type,
      amount,
      description
    });

    // const statementOperationUserSend = await this.statementsRepository.create({
    //   user_id,
    //   type,
    //   amount,
    //   description
    // });

    return statementOperationUserReceiver;
  }
}
