import { OperationType } from "../../entities/Statement";

interface ICreateTransferDTO {

  user_id: string;
  description: string;
  amount: number;
  type: OperationType;
  sender_id: string;
}

export { ICreateTransferDTO };
