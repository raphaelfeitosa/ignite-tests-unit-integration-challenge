import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { CreateTransferUseCase } from './CreateTransferUseCase';


enum OperationType {
  TRANSFER = 'transfer',
}

export class CreateTransferController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;
    const { sender_id } = request.params;

    const splittedPath = request.originalUrl.split('/', 5);
    const type = splittedPath[splittedPath.length - 1] as OperationType;

    const createTransfer = container.resolve(CreateTransferUseCase);

    const transfer = await createTransfer.execute({
      user_id,
      sender_id,
      type,
      amount,
      description
    });

    return response.status(200).json(transfer);
  }
}
