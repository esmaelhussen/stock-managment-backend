import { IsNumber, Min } from 'class-validator';

export class MakeCreditPaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;
}