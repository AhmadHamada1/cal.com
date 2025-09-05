import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class GetAtomPublicEventTypeQueryParams {
  @Transform(({ value }: { value: string }) => value === "true")
  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  isTeamEvent?: boolean;

  @IsOptional()
  @Transform(({ value }: { value: string }) => value && parseInt(value))
  @IsNumber()
  @ApiPropertyOptional({ type: Number })
  teamId?: number;

  @IsOptional()
  @Transform(({ value }: { value: string }) => value && parseInt(value))
  @IsNumber()
  @ApiPropertyOptional({ type: Number })
  orgId?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  username?: string;
}
