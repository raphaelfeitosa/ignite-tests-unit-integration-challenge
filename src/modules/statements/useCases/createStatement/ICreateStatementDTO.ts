import { Statement } from "../../entities/Statement";

// type IOptionalCreateStatementDTO =
//   Pick<
//     Statement,
//     'sender_id'
//   >

// export type ICreateStatementDTO =
//   Pick<
//     Statement,
//     'user_id' |
//     'description' |
//     'amount' |
//     'type'
//   > &
//   Partial<IOptionalCreateStatementDTO>

import { OperationType } from "../../entities/Statement";

interface ICreateStatementDTO {

  user_id: string;
  description: string;
  amount: number;
  type: OperationType;
  sender_id?: string;
}

export { ICreateStatementDTO };

