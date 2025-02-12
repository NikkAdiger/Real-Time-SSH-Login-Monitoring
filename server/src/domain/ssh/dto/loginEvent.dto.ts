import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsInt } from 'class-validator';

export class GetLoginEventQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    limit: number = 10;
}